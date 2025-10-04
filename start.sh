#!/bin/bash

echo "🚀 启动大文件分片上传示例项目"
echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装项目依赖..."
    npm install
    echo ""
fi

echo "🔧 启动开发服务器..."
echo "📱 项目将在 http://localhost:3000 启动"
echo "💡 提示: 可以上传大文件测试分片上传功能"
echo ""

npm run dev
