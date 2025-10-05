import type { RequestStrategy, HashCheckResult } from './RequestStrategy';
import type { Chunk } from './Chunk';

/**
 * 真实的API请求策略实现
 * 对接后端大文件分片上传API
 */
export class ApiRequestStrategy implements RequestStrategy {
  private apiBase: string;
  private uploadToken: string | null = null;
  private chunkSize: number = 5 * 1024 * 1024; // 5MB

  constructor(apiBase: string = 'http://localhost:3000') {
    this.apiBase = apiBase;
    console.log('🔧 ApiRequestStrategy 初始化，API地址:', this.apiBase);
  }

  /**
   * 创建上传会话
   */
  async createUploadSession(fileName: string, fileSize: number, chunkSize: number = this.chunkSize): Promise<string> {
    console.log('🚀 创建上传会话:', { fileName, fileSize, chunkSize });
    
    try {
      const response = await fetch(`${this.apiBase}/upload/create`, {
        method: 'HEAD',
        headers: {
          'file-name': fileName,
          'file-size': fileSize.toString(),
          'chunk-size': chunkSize.toString()
        }
      });

      if (!response.ok) {
        throw new Error(`创建上传会话失败: ${response.status} ${response.statusText}`);
      }

      const uploadToken = response.headers.get('Upload-Token');
      const serverChunkSize = response.headers.get('Chunk-Size');

      if (!uploadToken) {
        throw new Error('服务器未返回上传token');
      }

      this.uploadToken = uploadToken;
      if (serverChunkSize) {
        this.chunkSize = parseInt(serverChunkSize);
      }

      console.log('✅ 上传会话创建成功:', { uploadToken, chunkSize: this.chunkSize });
      return uploadToken;
    } catch (error) {
      console.error('❌ 创建上传会话失败:', error);
      throw error;
    }
  }

  /**
   * 校验分片或文件的hash
   */
  async checkHash(hash: string, type: 'chunk' | 'file'): Promise<HashCheckResult> {
    console.log('🔍 Hash校验:', { hash, type, uploadToken: this.uploadToken });
    
    if (!this.uploadToken) {
      throw new Error('上传token不存在，请先创建上传会话');
    }

    try {
      const response = await fetch(`${this.apiBase}/upload/hash-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uploadToken: this.uploadToken,
          hash,
          type
        })
      });

      if (!response.ok) {
        throw new Error(`Hash校验失败: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Hash校验结果:', result);
      return result;
    } catch (error) {
      console.error('❌ Hash校验失败:', error);
      throw error;
    }
  }

  /**
   * 上传分片
   */
  async uploadChunk(chunk: Chunk): Promise<void> {
    console.log('📤 上传分片:', { 
      index: chunk.index, 
      hash: chunk.hash, 
      size: chunk.size,
      uploadToken: this.uploadToken 
    });

    if (!this.uploadToken) {
      throw new Error('上传token不存在，请先创建上传会话');
    }

    try {
      const formData = new FormData();
      formData.append('uploadToken', this.uploadToken);
      formData.append('chunkIndex', chunk.index.toString());
      formData.append('chunkHash', chunk.hash);
      formData.append('chunk', chunk.data);

      const response = await fetch(`${this.apiBase}/upload/chunk`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`分片上传失败: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || '分片上传失败');
      }

      console.log('✅ 分片上传成功:', result);
    } catch (error) {
      console.error('❌ 分片上传失败:', error);
      throw error;
    }
  }

  /**
   * 合并文件
   */
  async mergeFile(fileHash: string, fileName: string, fileSize: number): Promise<string> {
    console.log('🔗 合并文件:', { fileHash, fileName, fileSize, uploadToken: this.uploadToken });

    if (!this.uploadToken) {
      throw new Error('上传token不存在，请先创建上传会话');
    }

    try {
      const response = await fetch(`${this.apiBase}/upload/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uploadToken: this.uploadToken,
          fileHash,
          fileName,
          fileSize
        })
      });

      if (!response.ok) {
        throw new Error(`文件合并失败: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || '文件合并失败');
      }

      console.log('✅ 文件合并成功:', result);
      return result.url;
    } catch (error) {
      console.error('❌ 文件合并失败:', error);
      throw error;
    }
  }

  /**
   * 获取分片大小
   */
  getChunkSize(): number {
    return this.chunkSize;
  }

  /**
   * 获取上传token
   */
  getUploadToken(): string | null {
    return this.uploadToken;
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.uploadToken = null;
    console.log('🔄 ApiRequestStrategy 状态已重置');
  }
}
