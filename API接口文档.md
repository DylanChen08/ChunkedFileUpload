# 大文件分片上传 API 接口文档

## 概述

本文档描述了大文件分片上传后端服务的所有API接口，供前端开发人员对接使用。

**基础URL**: `http://localhost:3000`

## 接口列表

- [1. 创建文件上传会话](#1-创建文件上传会话)
- [2. Hash校验](#2-hash校验)
- [3. 分片上传](#3-分片上传)
- [4. 文件合并](#4-文件合并)
- [5. 获取文件信息](#5-获取文件信息)
- [6. 下载文件](#6-下载文件)
- [7. 流式访问文件](#7-流式访问文件)

---

## 1. 创建文件上传会话

创建文件上传会话，获取上传token。

### 请求

```http
HEAD /upload/create
```

### 请求头

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file-name | string | 是 | 文件名 |
| file-size | string | 是 | 文件大小（字节） |
| chunk-size | string | 是 | 分片大小（字节，建议5MB） |

### 响应头

| 参数名 | 类型 | 说明 |
|--------|------|------|
| Upload-Token | string | 上传token，后续请求必须携带 |
| Chunk-Size | string | 分片大小（字节） |

### 响应状态码

- `200`: 成功
- `400`: 参数错误
- `500`: 服务器错误

### 示例

```javascript
const response = await fetch('/upload/create', {
  method: 'HEAD',
  headers: {
    'file-name': 'example.mp4',
    'file-size': '104857600',
    'chunk-size': '5242880'
  }
});

const uploadToken = response.headers.get('Upload-Token');
const chunkSize = response.headers.get('Chunk-Size');
```

---

## 2. Hash校验

校验分片或文件的hash，检查是否已存在。

### 请求

```http
POST /upload/hash-check
Content-Type: application/json
```

### 请求体

```json
{
  "uploadToken": "string",  // 上传token
  "hash": "string",         // hash值
  "type": "chunk"           // 类型：chunk(分片) 或 file(文件)
}
```

### 响应

#### 分片hash校验响应

```json
{
  "hasFile": true           // 分片是否已存在
}
```

#### 文件hash校验响应

```json
{
  "hasFile": true,          // 文件是否已存在
  "rest": [1, 2, 3],        // 剩余未上传的分片索引（仅当hasFile为false时）
  "url": "/upload/download/file-id"  // 文件下载链接（仅当hasFile为true时）
}
```

### 响应状态码

- `200`: 成功
- `400`: 参数错误
- `404`: 上传会话不存在
- `500`: 服务器错误

### 示例

```javascript
// 校验分片hash
const chunkCheckResponse = await fetch('/upload/hash-check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    uploadToken: 'your-upload-token',
    hash: 'chunk-hash-value',
    type: 'chunk'
  })
});

// 校验文件hash
const fileCheckResponse = await fetch('/upload/hash-check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    uploadToken: 'your-upload-token',
    hash: 'file-hash-value',
    type: 'file'
  })
});
```

---

## 3. 分片上传

上传文件分片数据。

### 请求

```http
POST /upload/chunk
Content-Type: multipart/form-data
```

### 请求体 (FormData)

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| uploadToken | string | 是 | 上传token |
| chunkIndex | string | 是 | 分片索引（从0开始） |
| chunkHash | string | 是 | 分片hash值 |
| chunk | File | 是 | 分片文件数据 |

### 响应

```json
{
  "success": true,          // 是否成功
  "message": "string",      // 响应消息
  "chunkHash": "string"     // 分片hash值
}
```

### 响应状态码

- `200`: 成功
- `400`: 参数错误或hash校验失败
- `404`: 上传会话不存在
- `500`: 服务器错误

### 示例

```javascript
const formData = new FormData();
formData.append('uploadToken', uploadToken);
formData.append('chunkIndex', '0');
formData.append('chunkHash', chunkHash);
formData.append('chunk', chunkBlob);

const response = await fetch('/upload/chunk', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

---

## 4. 文件合并

合并所有分片，完成文件上传。

### 请求

```http
POST /upload/merge
Content-Type: application/json
```

### 请求体

```json
{
  "uploadToken": "string",  // 上传token
  "fileHash": "string",     // 文件整体hash值
  "fileName": "string",     // 文件名
  "fileSize": 104857600     // 文件大小（字节）
}
```

### 响应

```json
{
  "success": true,          // 是否成功
  "message": "string",      // 响应消息
  "fileId": "string",       // 文件ID
  "url": "string"           // 文件访问URL
}
```

### 响应状态码

- `200`: 成功
- `400`: 参数错误或hash校验失败
- `404`: 上传会话不存在
- `500`: 服务器错误

### 示例

```javascript
const response = await fetch('/upload/merge', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    uploadToken: 'your-upload-token',
    fileHash: 'file-hash-value',
    fileName: 'example.mp4',
    fileSize: 104857600
  })
});

const result = await response.json();
```

---

## 5. 获取文件信息

获取已上传文件的详细信息。

### 请求

```http
GET /upload/file/{fileId}
```

### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileId | string | 是 | 文件ID |

### 响应

```json
{
  "id": "string",           // 文件ID
  "name": "string",         // 文件名
  "size": 104857600,        // 文件大小
  "hash": "string",         // 文件hash
  "chunkSize": 5242880,     // 分片大小
  "chunks": [               // 分片列表
    {
      "hash": "string",     // 分片hash
      "index": 0,           // 分片索引
      "size": 5242880,      // 分片大小
      "start": 0,           // 起始位置
      "end": 5242880        // 结束位置
    }
  ],
  "status": "completed",     // 文件状态：uploading/completed/failed
  "uploadToken": "string",  // 上传token
  "createdAt": "2024-01-01T00:00:00.000Z",  // 创建时间
  "completedAt": "2024-01-01T00:00:00.000Z", // 完成时间
  "url": "string"          // 文件访问URL
}
```

### 响应状态码

- `200`: 成功
- `404`: 文件不存在
- `500`: 服务器错误

### 示例

```javascript
const response = await fetch('/upload/file/your-file-id');
const fileInfo = await response.json();
```

---

## 6. 下载文件

下载已上传的文件。

### 请求

```http
GET /upload/download/{fileId}
```

### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileId | string | 是 | 文件ID |

### 响应

- **Content-Type**: `application/octet-stream`
- **Content-Disposition**: `attachment; filename="filename"`
- **响应体**: 文件二进制数据

### 响应状态码

- `200`: 成功
- `404`: 文件不存在
- `500`: 服务器错误

### 示例

```javascript
const response = await fetch('/upload/download/your-file-id');
const blob = await response.blob();

// 创建下载链接
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'filename';
a.click();
```

---

## 7. 流式访问文件

流式访问已上传的文件（用于在线预览）。

### 请求

```http
GET /upload/stream/{fileId}
```

### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileId | string | 是 | 文件ID |

### 响应

- **Content-Type**: `application/octet-stream`
- **Content-Length**: 文件大小
- **响应体**: 文件二进制数据流

### 响应状态码

- `200`: 成功
- `404`: 文件不存在
- `500`: 服务器错误

### 示例

```javascript
const response = await fetch('/upload/stream/your-file-id');
const blob = await response.blob();

// 创建预览链接
const url = window.URL.createObjectURL(blob);
const video = document.createElement('video');
video.src = url;
video.controls = true;
document.body.appendChild(video);
```

---

## 错误处理

### 通用错误响应

```json
{
  "statusCode": 400,
  "message": "错误描述",
  "error": "Bad Request"
}
```

### 常见错误码

| 状态码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 413 | 请求体过大 |
| 500 | 服务器内部错误 |

---

## 前端集成示例

### 完整的上传流程

```javascript
class FileUploader {
  constructor(apiBase = 'http://localhost:3000') {
    this.apiBase = apiBase;
    this.chunkSize = 5 * 1024 * 1024; // 5MB
  }

  async uploadFile(file) {
    try {
      // 1. 创建上传会话
      const uploadToken = await this.createUploadSession(file);
      
      // 2. 分片并上传
      const chunks = this.createChunks(file);
      for (let i = 0; i < chunks.length; i++) {
        await this.uploadChunk(uploadToken, chunks[i], i);
      }
      
      // 3. 合并文件
      const result = await this.mergeFile(uploadToken, file);
      return result;
      
    } catch (error) {
      console.error('上传失败:', error);
      throw error;
    }
  }

  async createUploadSession(file) {
    const response = await fetch(`${this.apiBase}/upload/create`, {
      method: 'HEAD',
      headers: {
        'file-name': file.name,
        'file-size': file.size.toString(),
        'chunk-size': this.chunkSize.toString()
      }
    });
    
    return response.headers.get('Upload-Token');
  }

  createChunks(file) {
    const chunks = [];
    for (let i = 0; i < Math.ceil(file.size / this.chunkSize); i++) {
      const start = i * this.chunkSize;
      const end = Math.min(start + this.chunkSize, file.size);
      chunks.push({
        index: i,
        blob: file.slice(start, end)
      });
    }
    return chunks;
  }

  async uploadChunk(uploadToken, chunk, index) {
    // 计算分片hash
    const hash = await this.calculateHash(chunk.blob);
    
    // 检查分片是否已存在
    const checkResponse = await fetch(`${this.apiBase}/upload/hash-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uploadToken,
        hash,
        type: 'chunk'
      })
    });
    
    const checkResult = await checkResponse.json();
    if (checkResult.hasFile) {
      return; // 分片已存在，跳过上传
    }
    
    // 上传分片
    const formData = new FormData();
    formData.append('uploadToken', uploadToken);
    formData.append('chunkIndex', index.toString());
    formData.append('chunkHash', hash);
    formData.append('chunk', chunk.blob);
    
    const response = await fetch(`${this.apiBase}/upload/chunk`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }
  }

  async mergeFile(uploadToken, file) {
    const fileHash = await this.calculateFileHash(file);
    
    const response = await fetch(`${this.apiBase}/upload/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uploadToken,
        fileHash,
        fileName: file.name,
        fileSize: file.size
      })
    });
    
    return await response.json();
  }

  async calculateHash(blob) {
    // 使用crypto-js计算MD5
    const arrayBuffer = await blob.arrayBuffer();
    const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
    return CryptoJS.MD5(wordArray).toString();
  }

  async calculateFileHash(file) {
    return this.calculateHash(file);
  }
}

// 使用示例
const uploader = new FileUploader();
const fileInput = document.getElementById('fileInput');

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      const result = await uploader.uploadFile(file);
      console.log('上传成功:', result);
    } catch (error) {
      console.error('上传失败:', error);
    }
  }
});
```

---

## 注意事项

1. **分片大小**: 建议设置为5MB，平衡上传效率和内存使用
2. **并发控制**: 建议同时上传的分片数量不超过4个
3. **错误重试**: 网络错误时应该重试上传
4. **进度监控**: 可以通过分片上传数量计算上传进度
5. **断点续传**: 利用hash校验实现断点续传
6. **内存管理**: 大文件上传时注意内存使用，及时释放不需要的对象

---

## 联系支持

如有问题，请联系后端开发团队。
