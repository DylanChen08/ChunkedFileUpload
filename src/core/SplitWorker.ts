import { Chunk, calcChunkHash } from './Chunk';

/**
 * Web Worker 用于计算分片hash
 */
onmessage = async function (e) {
  const chunks = e.data as Chunk[];
  const results: Chunk[] = [];
  
  for (const chunk of chunks) {
    try {
      const hash = await calcChunkHash(chunk);
      chunk.hash = hash;
      results.push(chunk);
    } catch (error) {
      console.error('计算分片hash失败:', error);
      // 即使失败也要推送，避免阻塞
      results.push(chunk);
    }
  }
  
  postMessage(results);
};
