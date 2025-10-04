import SparkMD5 from 'spark-md5';

/**
 * 分片接口
 */
interface Chunk {
  blob: Blob;
  start: number;
  end: number;
  hash: string;
  index: number;
}

/**
 * 计算chunk的hash值
 */
function calcChunkHash(chunk: Chunk): Promise<string> {
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

/**
 * Web Worker 用于计算分片hash
 */
onmessage = async function (e) {
  console.log('🔧 SplitWorker 收到消息:', e.data.length, '个分片');
  const chunks = e.data as Chunk[];
  const results: Chunk[] = [];
  
  for (const chunk of chunks) {
    try {
      console.log('🔧 计算分片hash:', chunk.index, '大小:', chunk.blob.size);
      const hash = await calcChunkHash(chunk);
      chunk.hash = hash;
      console.log('🔧 分片hash计算完成:', chunk.index, 'hash:', hash);
      results.push(chunk);
    } catch (error) {
      console.error('❌ 计算分片hash失败:', error);
      // 即使失败也要推送，避免阻塞
      results.push(chunk);
    }
  }
  
  console.log('🔧 SplitWorker 返回结果:', results.length, '个分片');
  postMessage(results);
};
