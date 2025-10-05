# 大文件上传 API 快速参考

## 基础信息

- **服务地址**: `http://localhost:3000`
- **分片大小**: 建议 5MB (5 * 1024 * 1024 字节)
- **并发数**: 建议不超过 4 个

## 核心接口

### 1. 创建上传会话
```http
HEAD /upload/create
Headers: file-name, file-size, chunk-size
Response: Upload-Token, Chunk-Size
```

### 2. 分片上传
```http
POST /upload/chunk
Content-Type: multipart/form-data
Body: uploadToken, chunkIndex, chunkHash, chunk
```

### 3. 文件合并
```http
POST /upload/merge
Content-Type: application/json
Body: { uploadToken, fileHash, fileName, fileSize }
```

### 4. Hash校验
```http
POST /upload/hash-check
Content-Type: application/json
Body: { uploadToken, hash, type }
```

## 前端集成代码

```javascript
// 1. 创建上传会话
const response = await fetch('/upload/create', {
  method: 'HEAD',
  headers: {
    'file-name': file.name,
    'file-size': file.size.toString(),
    'chunk-size': '5242880'
  }
});
const uploadToken = response.headers.get('Upload-Token');

// 2. 分片上传
const formData = new FormData();
formData.append('uploadToken', uploadToken);
formData.append('chunkIndex', '0');
formData.append('chunkHash', chunkHash);
formData.append('chunk', chunkBlob);

await fetch('/upload/chunk', {
  method: 'POST',
  body: formData
});

// 3. 文件合并
await fetch('/upload/merge', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    uploadToken,
    fileHash,
    fileName: file.name,
    fileSize: file.size
  })
});
```

## 错误码

- `200`: 成功
- `400`: 参数错误
- `404`: 资源不存在
- `500`: 服务器错误

## 注意事项

1. 所有分片必须按顺序上传
2. 分片hash必须与服务器校验一致
3. 文件合并前确保所有分片已上传
4. 支持断点续传，利用hash校验跳过已存在的分片
