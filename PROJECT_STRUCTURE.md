# 项目结构说明

## 整体架构

```
ChunkedFileUpload/
├── src/                          # 源代码目录
│   ├── core/                     # 核心功能模块
│   │   ├── EventEmitter.ts       # 事件发射器 - 发布订阅模式
│   │   ├── TaskQueue.ts          # 任务队列 - 并发控制
│   │   ├── Chunk.ts              # 分片相关功能
│   │   ├── ChunkSplitor.ts       # 分片器抽象类 - 模板模式
│   │   ├── MultiThreadSplitor.ts # 多线程分片器实现
│   │   ├── SplitWorker.ts        # Web Worker - 多线程hash计算
│   │   ├── RequestStrategy.ts    # 请求策略接口 - 策略模式
│   │   ├── MockRequestStrategy.ts # 模拟请求实现
│   │   └── UploadController.ts   # 上传控制器 - 核心协调器
│   ├── components/               # Vue组件
│   │   └── FileUpload.tsx       # 文件上传组件 - Vue3+TSX
│   ├── types/                    # 类型声明
│   │   └── spark-md5.d.ts       # spark-md5类型声明
│   ├── App.tsx                   # 主应用组件
│   ├── main.ts                   # 应用入口
│   └── style.css                 # 样式文件
├── package.json                  # 项目配置
├── vite.config.ts                # Vite配置
├── tsconfig.json                 # TypeScript配置
├── index.html                    # HTML入口
├── README.md                     # 项目说明
├── PROJECT_STRUCTURE.md          # 项目结构说明
└── start.sh                      # 启动脚本
```

## 核心模块详解

### 1. 事件系统 (EventEmitter)
- **作用**: 统一前后端事件处理
- **模式**: 发布订阅模式
- **特点**: 支持一次性监听、事件移除、批量清理

### 2. 任务队列 (TaskQueue)
- **作用**: 控制并发执行的任务
- **特点**: 支持并发数控制、任务状态管理、事件通知
- **应用**: 分片上传并发控制、hash计算并发控制

### 3. 分片系统 (ChunkSplitor)
- **作用**: 文件分片和hash计算
- **模式**: 模板模式
- **实现**: 
  - MultiThreadSplitor: 多线程分片
  - 可扩展其他分片策略

### 4. 请求策略 (RequestStrategy)
- **作用**: 解耦请求库依赖
- **模式**: 策略模式
- **实现**: 
  - MockRequestStrategy: 模拟实现
  - 可扩展真实API实现

### 5. 上传控制器 (UploadController)
- **作用**: 协调整个上传流程
- **功能**: 
  - 分片管理
  - 进度控制
  - 错误处理
  - 状态管理

## 设计模式应用

### 1. 模板模式 (Template Pattern)
```typescript
// ChunkSplitor抽象类定义分片流程
abstract class ChunkSplitor {
  // 模板方法
  split() {
    // 固定流程
    this.calcHash(chunks, emitter);
  }
  
  // 抽象方法 - 子类实现
  abstract calcHash(chunks: Chunk[], emitter: EventEmitter): void;
}
```

### 2. 策略模式 (Strategy Pattern)
```typescript
// RequestStrategy接口解耦请求库
interface RequestStrategy {
  createFile(file: File): Promise<string>;
  uploadChunk(chunk: Chunk, token: string): Promise<void>;
  // ...
}
```

### 3. 发布订阅模式 (Observer Pattern)
```typescript
// EventEmitter统一事件处理
class EventEmitter<T> {
  on(event: T, listener: Function): void;
  emit(event: T, ...args: any[]): void;
  off(event: T, listener: Function): void;
}
```

## 数据流图

```
用户选择文件
    ↓
FileUpload组件
    ↓
UploadController初始化
    ↓
ChunkSplitor分片处理
    ↓
TaskQueue并发控制
    ↓
RequestStrategy发送请求
    ↓
服务器处理
    ↓
返回结果
```

## 扩展点

### 1. 自定义分片策略
```typescript
class CustomSplitor extends ChunkSplitor {
  calcHash(chunks: Chunk[], emitter: EventEmitter<'chunks'>): void {
    // 自定义分片逻辑
  }
}
```

### 2. 自定义请求策略
```typescript
class CustomRequestStrategy implements RequestStrategy {
  async createFile(file: File): Promise<string> {
    // 自定义API调用
  }
}
```

### 3. 自定义上传控制器
```typescript
class CustomUploadController extends UploadController {
  // 扩展上传逻辑
}
```

## 技术栈

- **前端框架**: Vue3 + TSX
- **UI库**: ElementPlus
- **构建工具**: Vite
- **类型检查**: TypeScript
- **Hash计算**: SparkMD5
- **多线程**: Web Worker
- **状态管理**: 响应式数据
- **事件系统**: 自定义EventEmitter
