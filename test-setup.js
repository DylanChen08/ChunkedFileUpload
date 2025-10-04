#!/usr/bin/env node

/**
 * 项目设置验证脚本
 * 检查项目依赖和配置是否正确
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 检查项目设置...\n');

// 检查关键文件
const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'index.html',
  'src/main.ts',
  'src/App.tsx',
  'src/components/FileUpload.tsx'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 文件不存在`);
    allFilesExist = false;
  }
});

// 检查核心模块
const coreModules = [
  'src/core/EventEmitter.ts',
  'src/core/TaskQueue.ts',
  'src/core/Chunk.ts',
  'src/core/ChunkSplitor.ts',
  'src/core/MultiThreadSplitor.ts',
  'src/core/RequestStrategy.ts',
  'src/core/UploadController.ts'
];

console.log('\n📦 检查核心模块...');
coreModules.forEach(module => {
  const modulePath = path.join(__dirname, module);
  if (fs.existsSync(modulePath)) {
    console.log(`✅ ${module}`);
  } else {
    console.log(`❌ ${module} - 模块不存在`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('\n🎉 项目设置完成！');
  console.log('\n📋 下一步操作:');
  console.log('1. 运行 npm install 安装依赖');
  console.log('2. 运行 npm run dev 启动开发服务器');
  console.log('3. 访问 http://localhost:3000 查看效果');
  console.log('\n💡 提示: 可以上传大文件测试分片上传功能');
} else {
  console.log('\n❌ 项目设置不完整，请检查缺失的文件');
  process.exit(1);
}
