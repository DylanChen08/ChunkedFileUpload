# 后端服务器配置说明

## 概述

前端已经完成与后端API的对接，现在需要启动后端服务器来支持大文件分片上传功能。

## 后端API要求

根据API文档，后端需要提供以下接口：

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

## 前端配置

前端已配置为连接到 `http://localhost:3000` 的后端服务器。

如需修改后端地址，请编辑 `src/components/FileUpload.vue` 中的：

```typescript
const requestStrategy = new ApiRequestStrategy('http://localhost:3000');
```

## 测试步骤

1. 启动后端服务器（端口3000）
2. 启动前端开发服务器：`pnpm run dev`
3. 在浏览器中访问前端应用
4. 选择一个大文件进行上传测试

## 功能特性

✅ **断点续传** - 利用hash校验实现断点续传
✅ **并发控制** - 支持多分片并发上传
✅ **进度监控** - 实时显示上传进度
✅ **错误处理** - 完善的错误处理和重试机制
✅ **暂停恢复** - 支持上传暂停和恢复
✅ **Web Worker** - 使用Web Worker进行hash计算，不阻塞UI

## 注意事项

1. 确保后端服务器支持CORS跨域请求
2. 建议分片大小设置为5MB
3. 并发上传分片数量建议不超过4个
4. 确保服务器有足够的存储空间和带宽
