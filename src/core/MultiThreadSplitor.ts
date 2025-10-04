import { ChunkSplitor } from './ChunkSplitor';
import { Chunk, calcChunkHash } from './Chunk';
import { EventEmitter } from './EventEmitter';

/**
 * 多线程分片器
 * 使用Web Worker进行多线程hash计算
 */
export class MultiThreadSplitor extends ChunkSplitor {
  private workers: Worker[] = [];

  constructor(file: File, chunkSize: number = 1024 * 1024 * 5) {
    super(file, chunkSize);
    this.initWorkers();
  }

  /**
   * 初始化Web Workers
   */
  private initWorkers() {
    const workerCount = navigator.hardwareConcurrency || 4;
    this.workers = new Array(workerCount).fill(0).map(() => {
      const worker = new Worker(
        new URL('./SplitWorker.ts', import.meta.url),
        { type: 'module' }
      );
      return worker;
    });
  }

  /**
   * 计算分片hash
   * @param chunks 分片数组
   * @param emitter 事件发射器
   */
  calcHash(chunks: Chunk[], emitter: EventEmitter<'chunks'>): void {
    const workerSize = Math.ceil(chunks.length / this.workers.length);
    
    for (let i = 0; i < this.workers.length; i++) {
      const worker = this.workers[i];
      const start = i * workerSize;
      const end = Math.min((i + 1) * workerSize, chunks.length);
      const workerChunks = chunks.slice(start, end);
      
      if (workerChunks.length === 0) continue;
      
      worker.postMessage(workerChunks);
      worker.onmessage = (e) => {
        emitter.emit('chunks', e.data);
      };
    }
  }

  /**
   * 销毁资源
   */
  dispose(): void {
    this.workers.forEach((worker) => worker.terminate());
    this.workers = [];
  }
}
