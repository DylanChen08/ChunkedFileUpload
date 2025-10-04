import { EventEmitter } from './EventEmitter';
import type { Chunk } from './Chunk';
import { createChunk } from './Chunk';
import SparkMD5 from 'spark-md5';

/**
 * 分片的相关事件
 * chunks: 一部分分片产生了
 * wholeHash: 整个文件的hash计算完成
 * drain: 所有分片处理完成
 */
export type ChunkSplitorEvents = 'chunks' | 'wholeHash' | 'drain';

/**
 * 分片器抽象类
 * 使用模板模式，提供不同的分片策略
 */
export abstract class ChunkSplitor extends EventEmitter<ChunkSplitorEvents> {
  protected chunkSize: number; // 分片大小（单位字节）
  protected file: File; // 待分片的文件
  protected hash?: string; // 整个文件的hash
  protected chunks: Chunk[]; // 分片列表
  private handleChunkCount = 0; // 已计算hash的分片数量
  private spark = new SparkMD5(); // 计算hash的工具
  private hasSplited = false; // 是否已经分片

  constructor(file: File, chunkSize: number = 1024 * 1024 * 5) {
    super();
    this.file = file;
    this.chunkSize = chunkSize;
    // 获取分片数组
    const chunkCount = Math.ceil(this.file.size / this.chunkSize);
    this.chunks = new Array(chunkCount)
      .fill(0)
      .map((_, index) => createChunk(this.file, index, this.chunkSize));
  }

  /**
   * 开始分片
   */
  split() {
    console.log('🔪 ChunkSplitor.split() 开始');
    console.log('🔪 文件大小:', this.file.size);
    console.log('🔪 分片大小:', this.chunkSize);
    console.log('🔪 总分片数:', this.chunks.length);
    
    if (this.hasSplited) {
      console.log('🔪 已经分片过了，跳过');
      return;
    }
    this.hasSplited = true;
    const emitter = new EventEmitter<'chunks'>();
    
    const chunksHandler = (chunks: Chunk[]) => {
      console.log('🔪 收到分片计算结果:', chunks.length, '个分片');
      this.emit('chunks', chunks);
      chunks.forEach((chunk) => {
        this.spark.append(chunk.hash);
      });
      this.handleChunkCount += chunks.length;
      
      console.log('🔪 已处理分片数:', this.handleChunkCount, '/', this.chunks.length);
      
      if (this.handleChunkCount === this.chunks.length) {
        // 计算完成
        console.log('🔪 所有分片hash计算完成，计算整体hash...');
        emitter.off('chunks', chunksHandler);
        this.hash = this.spark.end();
        console.log('🔪 整体hash:', this.hash);
        this.emit('wholeHash', this.hash);
        this.spark.destroy();
        this.emit('drain');
      }
    };
    
    emitter.on('chunks', chunksHandler);
    console.log('🔪 开始计算分片hash...');
    this.calcHash(this.chunks, emitter);
  }

  /**
   * 计算每一个分片的hash
   * 子类需要实现此方法
   * @param chunks 分片数组
   * @param emitter 事件发射器
   */
  abstract calcHash(chunks: Chunk[], emitter: EventEmitter<'chunks'>): void;

  /**
   * 分片完成后一些需要销毁的工作
   * 子类需要实现此方法
   */
  abstract dispose(): void;

  /**
   * 获取分片列表
   */
  getChunks(): Chunk[] {
    return this.chunks;
  }

  /**
   * 获取文件hash
   */
  getHash(): string | undefined {
    return this.hash;
  }

  /**
   * 获取分片数量
   */
  getChunkCount(): number {
    return this.chunks.length;
  }
}
