# 大文件分片上传示例

基于Vue3 + TSX + ElementPlus实现的大文件分片上传功能演示项目。

## 功能特性

- ✅ **文件分片**: 支持大文件自动分片上传
- ✅ **多线程处理**: 使用Web Worker进行多线程hash计算
- ✅ **并发控制**: 智能控制上传并发数，充分利用带宽
- ✅ **断点续传**: 支持上传暂停/恢复
- ✅ **进度显示**: 实时显示上传进度和分片状态
- ✅ **错误处理**: 完善的错误处理和用户提示
- ✅ **响应式设计**: 适配移动端和桌面端

## 技术架构

### 核心模块

1. **EventEmitter**: 基于发布订阅模式的事件系统
2. **TaskQueue**: 支持并发控制的任务队列
3. **ChunkSplitor**: 抽象分片器，支持多种分片策略
4. **UploadController**: 上传控制器，协调整个上传流程
5. **RequestStrategy**: 请求策略接口，支持不同请求库

### 设计模式

- **模板模式**: ChunkSplitor抽象类定义分片流程
- **策略模式**: RequestStrategy接口解耦请求库
- **发布订阅模式**: EventEmitter统一事件处理
- **观察者模式**: 上传进度和状态通知

## 项目结构

```
src/
├── core/                    # 核心功能模块
│   ├── EventEmitter.ts     # 事件发射器
│   ├── TaskQueue.ts        # 任务队列
│   ├── Chunk.ts            # 分片相关功能
│   ├── ChunkSplitor.ts     # 分片器抽象类
│   ├── MultiThreadSplitor.ts # 多线程分片器
│   ├── SplitWorker.ts      # Web Worker
│   ├── RequestStrategy.ts  # 请求策略接口
│   ├── MockRequestStrategy.ts # 模拟请求实现
│   └── UploadController.ts # 上传控制器
├── components/             # Vue组件
│   └── FileUpload.tsx     # 文件上传组件
├── App.tsx                # 主应用组件
├── main.ts                # 应用入口
└── style.css              # 样式文件
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 使用说明

1. **选择文件**: 点击或拖拽文件到上传区域
2. **开始上传**: 点击"开始上传"按钮启动分片上传
3. **控制上传**: 可以随时暂停或恢复上传
4. **查看进度**: 实时查看上传进度和分片状态
5. **完成上传**: 上传完成后获得文件访问地址

## 核心特性详解

### 1. 文件分片策略

支持多种分片模式：
- **多线程分片**: 使用Web Worker并行计算hash
- **主线程分片**: 在主线程中计算hash
- **自定义分片**: 继承ChunkSplitor实现自定义策略

### 2. 并发控制

- 智能控制上传并发数，避免网络阻塞
- 支持动态调整并发数
- 任务队列管理，确保上传顺序

### 3. 断点续传

- 支持上传暂停和恢复
- 自动检测已上传分片，避免重复上传
- 服务器端分片去重，节省存储空间

### 4. 错误处理

- 网络错误自动重试
- 分片上传失败处理
- 用户友好的错误提示

## 扩展开发

### 自定义请求策略

```typescript
class CustomRequestStrategy implements RequestStrategy {
  async createFile(file: File): Promise<string> {
    // 实现文件创建逻辑
  }
  
  async uploadChunk(chunk: Chunk, token: string): Promise<void> {
    // 实现分片上传逻辑
  }
  
  // ... 其他方法
}
```

### 自定义分片策略

```typescript
class CustomSplitor extends ChunkSplitor {
  calcHash(chunks: Chunk[], emitter: EventEmitter<'chunks'>): void {
    // 实现自定义分片逻辑
  }
  
  dispose(): void {
    // 清理资源
  }
}
```

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 许可证

MIT License
