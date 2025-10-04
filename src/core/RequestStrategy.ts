import type { Chunk } from './Chunk';

/**
 * 请求策略接口
 * 使用策略模式对请求库解耦
 */
export interface RequestStrategy {
  /**
   * 文件创建请求，返回token
   * @param file 文件对象
   * @returns Promise<string> 上传token
   */
  createFile(file: File): Promise<string>;

  /**
   * 分片上传请求
   * @param chunk 分片对象
   * @param token 上传token
   * @param onProgress 进度回调
   * @returns Promise<void>
   */
  uploadChunk(
    chunk: Chunk, 
    token: string, 
    onProgress?: (progress: number) => void
  ): Promise<void>;

  /**
   * 文件合并请求，返回文件url
   * @param token 上传token
   * @returns Promise<string> 文件访问URL
   */
  mergeFile(token: string): Promise<string>;

  /**
   * hash校验请求
   * @param token 上传token
   * @param hash hash值
   * @param type hash类型
   * @returns Promise<HashCheckResult>
   */
  patchHash<T extends 'file' | 'chunk'>(
    token: string,
    hash: string,
    type: T
  ): Promise<HashCheckResult<T>>;
}

/**
 * 分片hash校验结果
 */
export interface ChunkHashCheckResult {
  hasFile: boolean;
}

/**
 * 文件hash校验结果
 */
export interface FileHashCheckResult {
  hasFile: boolean;
  rest: number[];
  url: string;
}

/**
 * hash校验结果联合类型
 */
export type HashCheckResult<T extends 'file' | 'chunk'> = T extends 'file'
  ? FileHashCheckResult
  : ChunkHashCheckResult;
