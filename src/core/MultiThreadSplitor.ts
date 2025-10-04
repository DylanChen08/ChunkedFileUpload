import { ChunkSplitor } from './ChunkSplitor';
import type { Chunk } from './Chunk';
import { calcChunkHash } from './Chunk';
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
    console.log('🧵 MultiThreadSplitor.calcHash() 开始');
    console.log('🧵 Worker数量:', this.workers.length);
    console.log('🧵 分片数量:', chunks.length);
    
    const workerSize = Math.ceil(chunks.length / this.workers.length);
    console.log('🧵 每个Worker处理分片数:', workerSize);
    
    for (let i = 0; i < this.workers.length; i++) {
      const worker = this.workers[i];
      const start = i * workerSize;
      const end = Math.min((i + 1) * workerSize, chunks.length);
      const workerChunks = chunks.slice(start, end);
      
      console.log(`🧵 Worker ${i} 处理分片 ${start}-${end-1}, 数量: ${workerChunks.length}`);
      
      if (workerChunks.length === 0) continue;
      
      worker.postMessage(workerChunks);
      worker.onmessage = (e) => {
        console.log(`🧵 Worker ${i} 返回结果:`, e.data.length, '个分片');
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
