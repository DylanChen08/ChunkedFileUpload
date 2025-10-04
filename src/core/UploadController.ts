import { EventEmitter } from './EventEmitter';
import { TaskQueue, Task } from './TaskQueue';
import { ChunkSplitor } from './ChunkSplitor';
import { RequestStrategy } from './RequestStrategy';
import { Chunk } from './Chunk';
import { MultiThreadSplitor } from './MultiThreadSplitor';

/**
 * 上传控制器事件类型
 */
export type UploadControllerEvents = 
  | 'start' 
  | 'progress' 
  | 'chunkComplete' 
  | 'end' 
  | 'error' 
  | 'pause' 
  | 'resume';

/**
 * 上传进度信息
 */
export interface UploadProgress {
  loaded: number; // 已上传字节数
  total: number; // 总字节数
  percentage: number; // 上传百分比
  uploadedChunks: number; // 已上传分片数
  totalChunks: number; // 总分片数
}

/**
 * 上传控制器
 * 负责协调分片、请求控制等核心逻辑
 */
export class UploadController extends EventEmitter<UploadControllerEvents> {
  private file: File;
  private requestStrategy: RequestStrategy;
  private splitStrategy: ChunkSplitor;
  private taskQueue: TaskQueue;
  private token: string = '';
  private progress: UploadProgress;
  private isPaused: boolean = false;

  constructor(
    file: File,
    requestStrategy: RequestStrategy,
    splitStrategy?: ChunkSplitor,
    concurrency: number = 4
  ) {
    super();
    this.file = file;
    this.requestStrategy = requestStrategy;
    this.splitStrategy = splitStrategy || new MultiThreadSplitor(file);
    this.taskQueue = new TaskQueue(concurrency);
    
    this.progress = {
      loaded: 0,
      total: file.size,
      percentage: 0,
      uploadedChunks: 0,
      totalChunks: 0
    };

    this.setupEventListeners();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners() {
    // 任务队列事件监听
    this.taskQueue.on('start', () => {
      this.emit('start');
    });

    this.taskQueue.on('drain', () => {
      this.handleAllChunksUploaded();
    });

    // 分片策略事件监听
    this.splitStrategy.on('chunks', this.handleChunks.bind(this));
    this.splitStrategy.on('wholeHash', this.handleWholeHash.bind(this));
    this.splitStrategy.on('drain', () => {
      // 分片处理完成
    });
  }

  /**
   * 初始化上传
   */
  async init() {
    try {
      // 获取文件token
      this.token = await this.requestStrategy.createFile(this.file);
      this.emit('start');
      
      // 开始分片
      this.splitStrategy.split();
    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * 处理分片事件
   * @param chunks 分片数组
   */
  private handleChunks(chunks: Chunk[]) {
    // 更新总分片数
    this.progress.totalChunks = this.splitStrategy.getChunkCount();
    
    // 分片上传任务加入队列
    chunks.forEach((chunk) => {
      const task = new Task(this.uploadChunk.bind(this), chunk);
      this.taskQueue.add(task);
    });
    
    // 启动任务队列
    this.taskQueue.start();
  }

  /**
   * 上传单个分片
   * @param chunk 分片对象
   */
  private async uploadChunk(chunk: Chunk) {
    if (this.isPaused) {
      return;
    }

    try {
      // hash校验
      const resp = await this.requestStrategy.patchHash(this.token, chunk.hash, 'chunk');
      
      if (resp.hasFile) {
        // 分片已存在，直接标记为完成
        this.updateProgress(chunk.blob.size);
        this.emit('chunkComplete', chunk);
        return;
      }

      // 分片上传
      await this.requestStrategy.uploadChunk(
        chunk, 
        this.token, 
        (progress) => {
          // 这里可以处理单个分片的上传进度
        }
      );

      this.updateProgress(chunk.blob.size);
      this.emit('chunkComplete', chunk);
    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * 处理整体hash事件
   * @param hash 文件整体hash
   */
  private async handleWholeHash(hash: string) {
    try {
      // 文件hash校验
      const resp = await this.requestStrategy.patchHash(this.token, hash, 'file');
      
      if (resp.hasFile) {
        // 文件已存在
        this.progress.loaded = this.progress.total;
        this.progress.percentage = 100;
        this.emit('progress', this.progress);
        this.emit('end', resp.url);
        return;
      }

      // 根据缺失的分片重新编排任务
      if (resp.rest && resp.rest.length > 0) {
        this.handleMissingChunks(resp.rest);
      }
    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * 处理缺失的分片
   * @param missingChunkIndexes 缺失的分片索引
   */
  private handleMissingChunks(missingChunkIndexes: number[]) {
    const chunks = this.splitStrategy.getChunks();
    const missingChunks = missingChunkIndexes.map(index => chunks[index]).filter(Boolean);
    
    missingChunks.forEach((chunk) => {
      const task = new Task(this.uploadChunk.bind(this), chunk);
      this.taskQueue.add(task);
    });
    
    this.taskQueue.start();
  }

  /**
   * 处理所有分片上传完成
   */
  private async handleAllChunksUploaded() {
    try {
      // 请求合并文件
      const fileUrl = await this.requestStrategy.mergeFile(this.token);
      this.emit('end', fileUrl);
    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * 更新上传进度
   * @param loadedBytes 已上传字节数
   */
  private updateProgress(loadedBytes: number) {
    this.progress.loaded += loadedBytes;
    this.progress.uploadedChunks++;
    this.progress.percentage = Math.round((this.progress.loaded / this.progress.total) * 100);
    
    this.emit('progress', this.progress);
  }

  /**
   * 暂停上传
   */
  pause() {
    this.isPaused = true;
    this.taskQueue.pause();
    this.emit('pause');
  }

  /**
   * 恢复上传
   */
  resume() {
    this.isPaused = false;
    this.taskQueue.start();
    this.emit('resume');
  }

  /**
   * 获取当前进度
   */
  getProgress(): UploadProgress {
    return { ...this.progress };
  }

  /**
   * 销毁资源
   */
  dispose() {
    this.splitStrategy.dispose();
    this.taskQueue.pause();
    this.removeAllListeners();
  }
}
