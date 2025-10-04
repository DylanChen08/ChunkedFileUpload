import SparkMD5 from 'spark-md5';

/**
 * 文件分片接口
 */
export interface Chunk {
  blob: Blob; // 分片的二进制数据
  start: number; // 分片的起始位置
  end: number; // 分片的结束位置
  hash: string; // 分片的hash值
  index: number; // 分片在文件中的索引
}

// 同时导出类型别名，确保兼容性
export type { Chunk as ChunkType };

/**
 * 创建一个不带hash的chunk
 * @param file 文件对象
 * @param index 分片索引
 * @param chunkSize 分片大小
 * @returns Chunk对象
 */
export function createChunk(
  file: File,
  index: number,
  chunkSize: number
): Chunk {
  const start = index * chunkSize;
  const end = Math.min((index + 1) * chunkSize, file.size);
  const blob = file.slice(start, end);
  return {
    blob,
    start,
    end,
    hash: '',
    index,
  };
}

/**
 * 计算chunk的hash值
 * @param chunk 分片对象
 * @returns Promise<string> hash值
 */
export function calcChunkHash(chunk: Chunk): Promise<string> {
  return new Promise((resolve) => {
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();
    
    fileReader.onload = (e) => {
      spark.append(e.target?.result as ArrayBuffer);
      resolve(spark.end());
    };
    
    fileReader.onerror = () => {
      resolve('');
    };
    
    fileReader.readAsArrayBuffer(chunk.blob);
  });
}
