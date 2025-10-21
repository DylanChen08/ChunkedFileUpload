import type { RequestStrategy, HashCheckResult } from './RequestStrategy';
import type { Chunk } from './Chunk';
import { ApiRequestStrategy } from './ApiRequestStrategy';
import { MockRequestStrategy } from './MockRequestStrategy';
import { configManager } from '../config/uploadConfig';

/**
 * 混合请求策略
 * 根据配置自动选择使用API模式还是Mock模式
 */
export class HybridRequestStrategy implements RequestStrategy {
  private apiStrategy: ApiRequestStrategy;
  private mockStrategy: MockRequestStrategy;
  private currentStrategy: RequestStrategy;

  constructor() {
    this.apiStrategy = new ApiRequestStrategy();
    this.mockStrategy = new MockRequestStrategy();
    
    // 根据当前配置选择策略
    this.currentStrategy = this.selectStrategy();
    
    console.log('🔀 HybridRequestStrategy 初始化，当前模式:', configManager.getMode());
  }

  /**
   * 创建文件上传会话
   */
  async createUploadSession(fileName: string, fileSize: number, chunkSize: number): Promise<string> {
    console.log('🔀 HybridRequestStrategy.createUploadSession() 开始');
    console.log('🔀 当前模式:', configManager.getMode());
    
    // 确保使用正确的策略
    this.ensureCorrectStrategy();
    
    return await this.currentStrategy.createUploadSession(fileName, fileSize, chunkSize);
  }

  /**
   * 校验分片或文件的hash
   */
  async checkHash(hash: string, type: 'chunk' | 'file'): Promise<HashCheckResult> {
    console.log('🔀 HybridRequestStrategy.checkHash() 开始');
    console.log('🔀 当前模式:', configManager.getMode());
    
    // 确保使用正确的策略
    this.ensureCorrectStrategy();
    
    return await this.currentStrategy.checkHash(hash, type);
  }

  /**
   * 上传分片
   */
  async uploadChunk(chunk: Chunk): Promise<void> {
    console.log('🔀 HybridRequestStrategy.uploadChunk() 开始');
    console.log('🔀 当前模式:', configManager.getMode());
    
    // 确保使用正确的策略
    this.ensureCorrectStrategy();
    
    return await this.currentStrategy.uploadChunk(chunk);
  }

  /**
   * 合并文件
   */
  async mergeFile(fileHash: string, fileName: string, fileSize: number): Promise<string> {
    console.log('🔀 HybridRequestStrategy.mergeFile() 开始');
    console.log('🔀 当前模式:', configManager.getMode());
    
    // 确保使用正确的策略
    this.ensureCorrectStrategy();
    
    return await this.currentStrategy.mergeFile(fileHash, fileName, fileSize);
  }

  /**
   * 获取分片大小
   */
  getChunkSize(): number {
    return configManager.getChunkSize();
  }

  /**
   * 获取上传token
   */
  getUploadToken(): string | null {
    // 确保使用正确的策略
    this.ensureCorrectStrategy();
    
    return this.currentStrategy.getUploadToken();
  }

  /**
   * 切换模式
   */
  switchMode(): void {
    console.log('🔀 切换上传模式...');
    const oldMode = configManager.getMode();
    const newMode = oldMode === 'api' ? 'mock' : 'api';
    
    configManager.setMode(newMode);
    this.currentStrategy = this.selectStrategy();
    
    console.log('🔀 模式已切换:', oldMode, '->', newMode);
  }

  /**
   * 获取当前模式
   */
  getCurrentMode(): string {
    return configManager.getMode();
  }

  /**
   * 重置当前策略状态
   */
  reset(): void {
    console.log('🔀 重置当前策略状态...');
    
    // 重置当前策略
    if (this.currentStrategy === this.apiStrategy) {
      this.apiStrategy.reset();
    } else {
      this.mockStrategy.reset();
    }
    
    console.log('🔀 策略状态已重置');
  }

  /**
   * 根据配置选择策略
   */
  private selectStrategy(): RequestStrategy {
    const mode = configManager.getMode();
    
    if (mode === 'api') {
      // 更新API策略的配置
      this.apiStrategy = new ApiRequestStrategy(configManager.getApiBaseUrl());
      return this.apiStrategy;
    } else {
      return this.mockStrategy;
    }
  }

  /**
   * 确保使用正确的策略
   */
  private ensureCorrectStrategy(): void {
    const currentMode = configManager.getMode();
    const expectedStrategy = currentMode === 'api' ? this.apiStrategy : this.mockStrategy;
    
    if (this.currentStrategy !== expectedStrategy) {
      console.log('🔀 检测到模式变化，切换策略:', this.currentStrategy.constructor.name, '->', expectedStrategy.constructor.name);
      this.currentStrategy = expectedStrategy;
    }
  }
}

