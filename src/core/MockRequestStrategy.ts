import type { RequestStrategy, HashCheckResult } from './RequestStrategy';
import type { Chunk } from './Chunk';

/**
 * 模拟请求策略实现
 * 用于演示和测试，实际项目中需要替换为真实的API调用
 */
export class MockRequestStrategy implements RequestStrategy {
  private baseUrl: string;
  private uploadToken: string | null = null;
  private chunkSize: number = 5 * 1024 * 1024; // 5MB
  private sessions: Map<string, any> = new Map();

  constructor(baseUrl: string = '/api/upload') {
    this.baseUrl = baseUrl;
    console.log('🌐 MockRequestStrategy 初始化，基础URL:', this.baseUrl);
  }

  /**
   * 创建文件上传会话
   */
  async createUploadSession(fileName: string, fileSize: number, chunkSize: number = this.chunkSize): Promise<string> {
    console.log('🌐 MockRequestStrategy.createUploadSession() 开始');
    console.log('🌐 文件信息:', { fileName, fileSize, chunkSize });
    
    // 模拟网络延迟
    console.log('🌐 模拟网络延迟...');
    await this.delay(500);
    
    const token = this.generateToken();
    console.log('🌐 生成token:', token);
    
    this.uploadToken = token;
    this.chunkSize = chunkSize;
    
    this.sessions.set(token, {
      fileName,
      fileSize,
      chunkSize,
      chunks: new Map(),
      uploadedChunks: new Set(),
      isCompleted: false
    });
    
    console.log('🌐 创建文件上传会话成功:', token);
    return token;
  }

  /**
   * 校验分片或文件的hash
   */
  async checkHash(hash: string, type: 'chunk' | 'file'): Promise<HashCheckResult> {
    console.log('🔍 MockRequestStrategy.checkHash() 开始:', { hash, type });
    
    if (!this.uploadToken) {
      throw new Error('上传token不存在，请先创建上传会话');
    }

    // 模拟网络延迟
    await this.delay(200);
    
    const session = this.sessions.get(this.uploadToken);
    if (!session) {
      throw new Error('上传会话不存在');
    }

    if (type === 'chunk') {
      // 模拟分片hash校验
      const hasFile = Math.random() < 0.1; // 10%概率分片已存在
      console.log('🔍 分片hash校验结果:', { hasFile });
      return { hasFile };
    } else {
      // 模拟文件hash校验
      const hasFile = Math.random() < 0.05; // 5%概率文件已存在
      console.log('🔍 文件hash校验结果:', { hasFile });
      
      if (hasFile) {
        return {
          hasFile: true,
          url: `${this.baseUrl}/files/${hash}`
        };
      } else {
        // 模拟部分分片已上传的情况
        const totalChunks = Math.ceil(session.fileSize / session.chunkSize);
        const uploadedChunks = Array.from(session.uploadedChunks);
        const rest = Array.from({ length: totalChunks }, (_, i) => i)
          .filter(i => !uploadedChunks.includes(i));
        
        return {
          hasFile: false,
          rest,
          url: ''
        };
      }
    }
  }

  /**
   * 上传分片
   */
  async uploadChunk(chunk: Chunk): Promise<void> {
    console.log('📤 MockRequestStrategy.uploadChunk() 开始:', {
      index: chunk.index,
      hash: chunk.hash,
      size: chunk.blob.size
    });

    if (!this.uploadToken) {
      throw new Error('上传token不存在，请先创建上传会话');
    }

    // 模拟网络延迟和进度
    const delay = Math.random() * 1000 + 500;
    console.log('📤 模拟上传延迟:', delay + 'ms');
    await this.delay(delay);

    const session = this.sessions.get(this.uploadToken);
    if (session) {
      session.chunks.set(chunk.index, chunk);
      session.uploadedChunks.add(chunk.index);
      console.log('📤 分片上传完成:', chunk.index);
    }
  }

  /**
   * 合并文件
   */
  async mergeFile(fileHash: string, fileName: string, fileSize: number): Promise<string> {
    console.log('🔗 MockRequestStrategy.mergeFile() 开始:', { fileHash, fileName, fileSize });

    if (!this.uploadToken) {
      throw new Error('上传token不存在，请先创建上传会话');
    }

    // 模拟网络延迟
    console.log('🔗 模拟合并延迟...');
    await this.delay(1000);
    
    const session = this.sessions.get(this.uploadToken);
    if (session) {
      session.isCompleted = true;
      const fileUrl = `${this.baseUrl}/files/${this.uploadToken}`;
      console.log('🔗 文件合并完成:', fileUrl);
      return fileUrl;
    }
    
    throw new Error('上传会话不存在');
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
    this.sessions.clear();
    console.log('🔄 MockRequestStrategy 状态已重置');
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