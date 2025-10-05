<template>
  <div class="file-upload-container">
    <el-card header="大文件分片上传示例" class="upload-card">
      <div class="upload-content">
        <!-- 文件选择区域 -->
        <div class="file-selector">
          <div class="upload-dragger">
            <input
              ref="fileInput"
              type="file"
              accept="*/*"
              @change="handleFileChange"
              style="display: none;"
            />
            <div 
              class="upload-area" 
              @click="triggerFileSelect"
              @dragover.prevent
              @dragenter.prevent
              @drop="handleDrop"
            >
              <el-icon size="48" color="#409EFF">
                <Folder />
              </el-icon>
              <div class="upload-text">
                <p>点击或拖拽文件到此区域上传</p>
                <p class="upload-hint">支持任意格式文件，推荐大文件测试分片上传效果</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 文件信息 -->
        <div v-if="selectedFile" class="file-info">
          <h4>文件信息</h4>
          <p><strong>文件名:</strong> {{ selectedFile.name }}</p>
          <p><strong>文件大小:</strong> {{ formatFileSize(selectedFile.size) }}</p>
          <p><strong>文件类型:</strong> {{ selectedFile.type || '未知' }}</p>
        </div>

        <!-- 上传控制按钮 -->
        <div class="upload-controls">
          <el-button
            type="primary"
            :disabled="!selectedFile || isUploading"
            @click="startUpload"
          >
            {{ isUploading ? '上传中...' : '开始上传' }}
          </el-button>
          
          <el-button
            v-if="isUploading"
            :type="isPaused ? 'success' : 'warning'"
            size="large"
            @click="togglePause"
          >
            <el-icon>
              <VideoPlay v-if="isPaused" />
              <VideoPause v-else />
            </el-icon>
            {{ isPaused ? '恢复上传' : '暂停上传' }}
          </el-button>
        </div>

        <!-- 上传进度 -->
        <div v-if="isUploading" class="upload-progress">
          <h4>上传进度</h4>
          <el-progress
            :percentage="progress.percentage"
            :status="isPaused ? 'warning' : 'success'"
            :stroke-width="8"
          />
          <div class="progress-details">
            <p>已上传: {{ formatFileSize(progress.loaded) }} / {{ formatFileSize(progress.total) }}</p>
            <p>分片进度: {{ progress.uploadedChunks }} / {{ progress.totalChunks }}</p>
          </div>
        </div>

        <!-- 完成信息 -->
        <div v-if="fileUrl" class="upload-result">
          <h4>上传完成</h4>
          <p>文件访问地址: <a :href="fileUrl" target="_blank">{{ fileUrl }}</a></p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Folder, VideoPlay, VideoPause } from '@element-plus/icons-vue';
import { UploadController } from '../core/UploadController';
import type { UploadProgress } from '../core/UploadController';
import { ApiRequestStrategy } from '../core/ApiRequestStrategy';

const uploadController = ref<UploadController | null>(null);
const isUploading = ref(false);
const isPaused = ref(false);
const progress = reactive<UploadProgress>({
  loaded: 0,
  total: 0,
  percentage: 0,
  uploadedChunks: 0,
  totalChunks: 0
});
const fileUrl = ref('');
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement>();

// 触发文件选择
const triggerFileSelect = () => {
  console.log('🖱️ 点击上传区域，触发文件选择');
  if (fileInput.value) {
    fileInput.value.click();
  }
};

// 处理文件选择
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    console.log('📁 文件选择事件触发:', file);
    console.log('📁 文件名:', file.name);
    console.log('📁 文件大小:', file.size);
    console.log('📁 文件类型:', file.type);
    
    selectedFile.value = file;
    progress.loaded = 0;
    progress.total = file.size;
    progress.percentage = 0;
    progress.uploadedChunks = 0;
    progress.totalChunks = 0;
    fileUrl.value = '';
    
    console.log('📁 文件已设置到selectedFile:', selectedFile.value);
  }
};

// 处理拖拽文件
const handleDrop = (event: DragEvent) => {
  console.log('🎯 拖拽文件事件触发');
  event.preventDefault();
  
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    console.log('📁 拖拽文件:', file);
    console.log('📁 文件名:', file.name);
    console.log('📁 文件大小:', file.size);
    console.log('📁 文件类型:', file.type);
    
    selectedFile.value = file;
    progress.loaded = 0;
    progress.total = file.size;
    progress.percentage = 0;
    progress.uploadedChunks = 0;
    progress.totalChunks = 0;
    fileUrl.value = '';
    
    console.log('📁 拖拽文件已设置到selectedFile:', selectedFile.value);
  }
};

// 开始上传
const startUpload = async () => {
  console.log('🚀 开始上传按钮点击');
  console.log('🚀 selectedFile.value:', selectedFile.value);
  
  if (!selectedFile.value) {
    console.log('❌ 没有选择文件');
    ElMessage.warning('请先选择文件');
    return;
  }

  try {
    console.log('🔧 创建请求策略...');
    // 创建请求策略（使用真实API实现）
    const requestStrategy = new ApiRequestStrategy('http://localhost:3000');
    console.log('🔧 请求策略创建成功:', requestStrategy);
    
    console.log('🔧 创建上传控制器...');
    // 创建上传控制器
    uploadController.value = new UploadController(
      selectedFile.value,
      requestStrategy
    );
    console.log('🔧 上传控制器创建成功:', uploadController.value);

    // 设置事件监听
    console.log('🔧 设置事件监听...');
    setupEventListeners();

    // 开始上传
    console.log('🔧 初始化上传控制器...');
    await uploadController.value.init();
    console.log('🔧 上传控制器初始化完成');
    
    isUploading.value = true;
    isPaused.value = false;
    console.log('✅ 上传状态已设置为true');
  } catch (error) {
    console.error('❌ 上传失败:', error);
    ElMessage.error('上传失败: ' + (error as Error).message);
  }
};

// 暂停/恢复上传
const togglePause = () => {
  if (!uploadController.value) return;

  if (isPaused.value) {
    uploadController.value.resume();
    isPaused.value = false;
    ElMessage.success('上传已恢复');
  } else {
    uploadController.value.pause();
    isPaused.value = true;
    ElMessage.info('上传已暂停');
  }
};

// 设置事件监听器
const setupEventListeners = () => {
  console.log('🎧 设置事件监听器...');
  if (!uploadController.value) {
    console.log('❌ 上传控制器不存在，无法设置事件监听');
    return;
  }

  console.log('🎧 监听progress事件...');
  uploadController.value.on('progress', (newProgress: UploadProgress) => {
    console.log('📊 进度更新:', newProgress);
    Object.assign(progress, newProgress);
  });

  console.log('🎧 监听end事件...');
  uploadController.value.on('end', (url: string) => {
    console.log('✅ 上传完成:', url);
    fileUrl.value = url;
    isUploading.value = false;
    isPaused.value = false;
    ElMessage.success('上传完成！');
  });

  console.log('🎧 监听error事件...');
  uploadController.value.on('error', (error: Error) => {
    console.error('❌ 上传错误:', error);
    isUploading.value = false;
    isPaused.value = false;
    ElMessage.error('上传失败: ' + error.message);
  });
  
  console.log('✅ 事件监听器设置完成');
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 清理资源
onUnmounted(() => {
  if (uploadController.value) {
    uploadController.value.dispose();
  }
});
</script>

<style scoped>
/* 上传组件样式 */
.file-upload-container {
  max-width: 800px;
  margin: 0 auto;
}

.upload-card {
  /* box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); */
  border-radius: 16px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.upload-content {
  padding: 20px;
}

.upload-dragger {
  width: 100%;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.upload-area {
  width: 300px;
  height: 300px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}


.upload-area:hover {
  border-color: #409EFF;
  background: #f0f9ff;
}

.upload-text p {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
}

.upload-hint {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.file-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #409EFF;
}

.file-info h4 {
  margin-bottom: 10px;
  color: #333;
}

.file-info p {
  margin: 5px 0;
  color: #666;
}

.upload-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

/* 确保ElementPlus按钮样式正确显示 */
.upload-controls .el-button {
  min-width: 120px;
  height: 40px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.upload-controls .el-button--primary {
  background: #409EFF;
  border-color: #409EFF;
  color: white;
}

.upload-controls .el-button--primary:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

.upload-controls .el-button--success {
  background: #67c23a;
  border-color: #67c23a;
  color: white;
}

.upload-controls .el-button--success:hover {
  background: #85ce61;
  border-color: #85ce61;
}

.upload-controls .el-button--warning {
  background: #e6a23c;
  border-color: #e6a23c;
  color: white;
}

.upload-controls .el-button--warning:hover {
  background: #ebb563;
  border-color: #ebb563;
}

.upload-controls .el-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-progress {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.upload-progress h4 {
  margin-bottom: 15px;
  color: #333;
}

.progress-details {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.progress-details p {
  color: #666;
  font-size: 0.9rem;
}

.upload-result {
  background: #e8f5e8;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #67c23a;
}

.upload-result h4 {
  margin-bottom: 10px;
  color: #333;
}

.upload-result a {
  color: #409EFF;
  text-decoration: none;
  word-break: break-all;
}

.upload-result a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .upload-controls {
    flex-direction: column;
  }
  
  .progress-details {
    flex-direction: column;
  }
}
</style>
