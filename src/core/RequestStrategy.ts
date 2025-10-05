import type { Chunk } from './Chunk';

/**
 * 请求策略接口
 * 定义与后端交互的契约
 */
export interface RequestStrategy {
  /**
   * 创建文件上传会话
   * @param fileName 文件名
   * @param fileSize 文件大小
   * @param chunkSize 分片大小
   * @returns 上传token
   */
  createUploadSession(fileName: string, fileSize: number, chunkSize: number): Promise<string>;

  /**
   * 校验分片或文件的hash
   * @param hash hash值
   * @param type 类型：chunk(分片) 或 file(文件)
   * @returns 校验结果
   */
  checkHash(hash: string, type: 'chunk' | 'file'): Promise<HashCheckResult>;

  /**
   * 上传分片
   * @param chunk 分片对象
   */
  uploadChunk(chunk: Chunk): Promise<void>;

  /**
   * 合并文件
   * @param fileHash 文件hash
   * @param fileName 文件名
   * @param fileSize 文件大小
   * @returns 文件访问URL
   */
  mergeFile(fileHash: string, fileName: string, fileSize: number): Promise<string>;

  /**
   * 获取分片大小
   * @returns 分片大小
   */
  getChunkSize(): number;

  /**
   * 获取上传token
   * @returns 上传token
   */
  getUploadToken(): string | null;
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
  rest?: number[];
  url?: string;
}

/**
 * hash校验结果联合类型
 */
export type HashCheckResult = ChunkHashCheckResult | FileHashCheckResult;