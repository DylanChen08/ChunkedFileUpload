/**
 * 上传配置管理
 */

export type UploadMode = 'api' | 'mock';

export interface UploadConfig {
  mode: UploadMode;
  apiBaseUrl: string;
  chunkSize: number;
  concurrency: number;
  enableWebWorker: boolean;
  enableProgress: boolean;
}

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: UploadConfig = {
  mode: 'mock', // 默认使用模拟模式
  apiBaseUrl: 'http://localhost:3000',
  chunkSize: 5 * 1024 * 1024, // 5MB
  concurrency: 4,
  enableWebWorker: true,
  enableProgress: true
};

/**
 * 配置存储键
 */
const CONFIG_STORAGE_KEY = 'chunked-upload-config';

/**
 * 配置管理器
 */
export class ConfigManager {
  private config: UploadConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * 获取当前配置
   */
  getConfig(): UploadConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<UploadConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  /**
   * 获取上传模式
   */
  getMode(): UploadMode {
    return this.config.mode;
  }

  /**
   * 设置上传模式
   */
  setMode(mode: UploadMode): void {
    this.config.mode = mode;
    this.saveConfig();
  }

  /**
   * 获取API基础URL
   */
  getApiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  /**
   * 设置API基础URL
   */
  setApiBaseUrl(url: string): void {
    this.config.apiBaseUrl = url;
    this.saveConfig();
  }

  /**
   * 获取分片大小
   */
  getChunkSize(): number {
    return this.config.chunkSize;
  }

  /**
   * 设置分片大小
   */
  setChunkSize(size: number): void {
    this.config.chunkSize = size;
    this.saveConfig();
  }

  /**
   * 获取并发数
   */
  getConcurrency(): number {
    return this.config.concurrency;
  }

  /**
   * 设置并发数
   */
  setConcurrency(concurrency: number): void {
    this.config.concurrency = concurrency;
    this.saveConfig();
  }

  /**
   * 是否启用Web Worker
   */
  isWebWorkerEnabled(): boolean {
    return this.config.enableWebWorker;
  }

  /**
   * 设置Web Worker启用状态
   */
  setWebWorkerEnabled(enabled: boolean): void {
    this.config.enableWebWorker = enabled;
    this.saveConfig();
  }

  /**
   * 是否启用进度显示
   */
  isProgressEnabled(): boolean {
    return this.config.enableProgress;
  }

  /**
   * 设置进度显示启用状态
   */
  setProgressEnabled(enabled: boolean): void {
    this.config.enableProgress = enabled;
    this.saveConfig();
  }

  /**
   * 重置为默认配置
   */
  resetToDefault(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.saveConfig();
  }

  /**
   * 从本地存储加载配置
   */
  private loadConfig(): UploadConfig {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_CONFIG, ...parsed };
      }
    } catch (error) {
      console.warn('加载配置失败，使用默认配置:', error);
    }
    return { ...DEFAULT_CONFIG };
  }

  /**
   * 保存配置到本地存储
   */
  private saveConfig(): void {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.warn('保存配置失败:', error);
    }
  }
}

/**
 * 全局配置管理器实例
 */
export const configManager = new ConfigManager();

