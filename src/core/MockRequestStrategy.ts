import type { RequestStrategy, HashCheckResult } from './RequestStrategy';
import type { Chunk } from './Chunk';

/**
 * 模拟请求策略实现
 * 用于演示和测试，实际项目中需要替换为真实的API调用
 */
export class MockRequestStrategy implements RequestStrategy {
  private baseUrl: string;
  private tokens: Map<string, any> = new Map();

  constructor(baseUrl: string = '/api/upload') {
    this.baseUrl = baseUrl;
  }

  /**
   * 创建文件上传会话
   */
  async createFile(file: File): Promise<string> {
    console.log('🌐 MockRequestStrategy.createFile() 开始');
    console.log('🌐 文件信息:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // 模拟网络延迟
    console.log('🌐 模拟网络延迟...');
    await this.delay(500);
    
    const token = this.generateToken();
    console.log('🌐 生成token:', token);
    
    this.tokens.set(token, {
      file,
      chunks: new Map(),
      uploadedChunks: new Set(),
      isCompleted: false
    });
    
    console.log('🌐 创建文件上传会话成功:', token);
    return token;
  }

  /**
   * 上传分片
   */
  async uploadChunk(
    chunk: Chunk, 
    token: string, 
    onProgress?: (progress: number) => void
  ): Promise<void> {
    // 模拟网络延迟和进度
    const delay = Math.random() * 1000 + 500;
    const steps = 10;
    
    for (let i = 0; i <= steps; i++) {
      await this.delay(delay / steps);
      onProgress?.(i / steps * 100);
    }

    const session = this.tokens.get(token);
    if (session) {
      session.chunks.set(chunk.index, chunk);
      session.uploadedChunks.add(chunk.index);
    }
    
    console.log(`上传分片 ${chunk.index} 完成`);
  }

  /**
   * 合并文件
   */
  async mergeFile(token: string): Promise<string> {
    // 模拟网络延迟
    await this.delay(1000);
    
    const session = this.tokens.get(token);
    if (session) {
      session.isCompleted = true;
      const fileUrl = `${this.baseUrl}/files/${token}`;
      console.log('文件合并完成:', fileUrl);
      return fileUrl;
    }
    
    throw new Error('上传会话不存在');
  }

  /**
   * Hash校验
   */
  async patchHash<T extends 'file' | 'chunk'>(
    token: string,
    hash: string,
    type: T
  ): Promise<HashCheckResult<T>> {
    // 模拟网络延迟
    await this.delay(200);
    
    const session = this.tokens.get(token);
    if (!session) {
      throw new Error('上传会话不存在');
    }

    if (type === 'chunk') {
      // 模拟分片hash校验
      const hasFile = Math.random() < 0.1; // 10%概率分片已存在
      return { hasFile } as HashCheckResult<T>;
    } else {
      // 模拟文件hash校验
      const hasFile = Math.random() < 0.05; // 5%概率文件已存在
      if (hasFile) {
        return {
          hasFile: true,
          rest: [],
          url: `${this.baseUrl}/files/${hash}`
        } as HashCheckResult<T>;
      } else {
        // 模拟部分分片已上传的情况
        const totalChunks = Math.ceil(session.file.size / (1024 * 1024 * 5));
        const uploadedChunks = Array.from(session.uploadedChunks);
        const rest = Array.from({ length: totalChunks }, (_, i) => i)
          .filter(i => !uploadedChunks.includes(i));
        
        return {
          hasFile: false,
          rest,
          url: ''
        } as HashCheckResult<T>;
      }
    }
  }

  /**
   * 生成模拟token
   */
  private generateToken(): string {
    return 'mock_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 模拟网络延迟
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
