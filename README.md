# 大文件分片上传系统

一个基于Vue3 + ElementPlus + TypeScript实现的大文件分片上传系统，支持前端模拟和后端API两种模式。

## ✨ 功能特性

### 🔄 双模式支持
- **前端模拟模式**: 纯前端实现，无需后端服务器，适合演示和测试
- **后端API模式**: 对接真实后端服务，支持生产环境使用

### 🚀 核心功能
- ✅ **大文件分片上传** - 支持任意大小文件的分片上传
- ✅ **断点续传** - 利用hash校验实现断点续传
- ✅ **并发控制** - 支持多分片并发上传，可配置并发数
- ✅ **进度监控** - 实时显示上传进度和分片状态
- ✅ **暂停恢复** - 支持上传暂停和恢复功能
- ✅ **Web Worker** - 使用Web Worker进行hash计算，不阻塞UI
- ✅ **配置管理** - 灵活的配置系统，支持实时切换模式
- ✅ **错误处理** - 完善的错误处理和重试机制

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **UI组件库**: ElementPlus
- **类型系统**: TypeScript
- **构建工具**: Vite
- **包管理器**: pnpm
- **Hash计算**: Spark-MD5
- **设计模式**: 策略模式、模板方法模式、发布订阅模式

## 📦 项目结构

```
src/
├── components/          # Vue组件
│   ├── ConfigPanel.vue  # 配置面板
│   └── FileUpload.vue   # 文件上传组件
├── config/              # 配置管理
│   └── uploadConfig.ts  # 上传配置
├── core/                # 核心逻辑
│   ├── ApiRequestStrategy.ts    # API请求策略
│   ├── Chunk.ts                 # 分片定义
│   ├── ChunkSplitor.ts          # 分片分割器
│   ├── EventEmitter.ts          # 事件发射器
│   ├── HybridRequestStrategy.ts # 混合请求策略
│   ├── MockRequestStrategy.ts   # 模拟请求策略
│   ├── MultiThreadSplitor.ts    # 多线程分片器
│   ├── RequestStrategy.ts       # 请求策略接口
│   ├── SplitWorker.ts           # Web Worker脚本
│   ├── TaskQueue.ts             # 任务队列
│   └── UploadController.ts      # 上传控制器
├── types/               # 类型定义
├── App.vue              # 根组件
├── main.ts              # 入口文件
└── style.css            # 全局样式
```

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm run dev
```

### 构建生产版本

```bash
pnpm run build
```

## 🔧 配置说明

### 上传模式

1. **前端模拟模式** (默认)
   - 纯前端实现，无需后端服务器
   - 适合演示、测试和开发
   - 模拟真实的网络延迟和上传过程

2. **后端API模式**
   - 对接真实的后端服务
   - 需要后端服务器支持
   - 支持生产环境使用

### 配置参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| 上传模式 | api/mock | mock |
| API地址 | 后端服务器地址 | http://localhost:3000 |
| 分片大小 | 每个分片的大小 | 5MB |
| 并发数 | 同时上传的分片数量 | 4 |
| Web Worker | 是否启用Web Worker | true |
| 进度显示 | 是否显示上传进度 | true |

## 📡 后端API接口

当使用后端API模式时，需要实现以下接口：

### 1. 创建上传会话
```http
HEAD /upload/create
Headers: file-name, file-size, chunk-size
Response: Upload-Token, Chunk-Size
```

### 2. Hash校验
```http
POST /upload/hash-check
Content-Type: application/json
Body: { uploadToken, hash, type }
```

### 3. 分片上传
```http
POST /upload/chunk
Content-Type: multipart/form-data
Body: uploadToken, chunkIndex, chunkHash, chunk
```

### 4. 文件合并
```http
POST /upload/merge
Content-Type: application/json
Body: { uploadToken, fileHash, fileName, fileSize }
```

详细的API文档请参考 `API接口文档.md` 和 `API快速参考.md`。

## 🎯 使用示例

### 基本使用

1. 启动应用后，在配置面板中选择上传模式
2. 如果选择后端API模式，确保后端服务器已启动
3. 选择要上传的文件
4. 点击"开始上传"按钮
5. 观察上传进度和状态

### 配置切换

- 在配置面板中可以实时切换上传模式
- 调整分片大小、并发数等参数
- 配置会自动保存到本地存储

### 断点续传

- 系统会自动检测已上传的分片
- 跳过已存在的分片，只上传缺失的部分
- 支持网络中断后的续传

## 🔍 调试信息

系统提供了详细的调试日志，可以在浏览器控制台中查看：

- 🔧 配置相关日志
- 📦 分片处理日志
- 📤 上传过程日志
- 🔍 Hash校验日志
- ❌ 错误信息日志

## 🎨 界面预览

- **配置面板**: 提供模式切换和参数配置
- **上传区域**: 300px正方形拖拽上传区域
- **文件信息**: 显示选中文件的基本信息
- **进度显示**: 实时显示上传进度和分片状态
- **控制按钮**: 开始、暂停、恢复上传

## 📝 注意事项

1. **分片大小**: 建议设置为5MB，平衡上传效率和内存使用
2. **并发控制**: 建议同时上传的分片数量不超过4个
3. **网络环境**: 确保网络稳定，避免频繁重试
4. **浏览器兼容**: 需要支持ES2020和Web Worker的现代浏览器
5. **存储空间**: 确保有足够的本地存储空间用于配置缓存

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License