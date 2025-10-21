<template>
  <el-card class="config-panel" header="上传配置">
    <div class="config-content">
      <!-- 模式切换 -->
      <div class="config-item">
        <label class="config-label">上传模式</label>
        <el-radio-group v-model="localConfig.mode" @change="handleModeChange">
          <el-radio value="mock">
            <span class="radio-text">
              <el-icon><Monitor /></el-icon>
              前端模拟
            </span>
          </el-radio>
          <el-radio value="api">
            <span class="radio-text">
              <el-icon><Connection /></el-icon>
              后端API
            </span>
          </el-radio>
        </el-radio-group>
      </div>

      <!-- API配置 -->
      <div v-if="localConfig.mode === 'api'" class="config-item">
        <label class="config-label">API地址</label>
        <el-input
          v-model="localConfig.apiBaseUrl"
          placeholder="http://localhost:3000"
          @blur="handleConfigChange"
        >
          <template #prepend>
            <el-icon><Link /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 分片大小配置 -->
      <div class="config-item">
        <label class="config-label">分片大小</label>
        <el-select v-model="chunkSizeOption" @change="handleChunkSizeChange">
          <el-option label="1MB" value="1MB" />
          <el-option label="2MB" value="2MB" />
          <el-option label="5MB" value="5MB" />
          <el-option label="10MB" value="10MB" />
          <el-option label="自定义" value="custom" />
        </el-select>
        <el-input
          v-if="chunkSizeOption === 'custom'"
          v-model.number="localConfig.chunkSize"
          type="number"
          placeholder="字节数"
          @blur="handleConfigChange"
          style="margin-top: 8px;"
        />
      </div>

      <!-- 并发数配置 -->
      <div class="config-item">
        <label class="config-label">并发数</label>
        <el-slider
          v-model="localConfig.concurrency"
          :min="1"
          :max="8"
          :marks="{ 1: '1', 4: '4', 8: '8' }"
          @change="handleConfigChange"
        />
      </div>

      <!-- 功能开关 -->
      <div class="config-item">
        <label class="config-label">功能选项</label>
        <div class="switch-group">
          <el-switch
            v-model="localConfig.enableWebWorker"
            @change="handleConfigChange"
          />
          <span class="switch-label">Web Worker</span>
        </div>
        <div class="switch-group">
          <el-switch
            v-model="localConfig.enableProgress"
            @change="handleConfigChange"
          />
          <span class="switch-label">进度显示</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="config-actions">
        <el-button @click="resetConfig" size="small">
          <el-icon><Refresh /></el-icon>
          重置配置
        </el-button>
        <el-button type="primary" @click="applyConfig" size="small">
          <el-icon><Check /></el-icon>
          应用配置
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Monitor, Connection, Link, Refresh, Check } from '@element-plus/icons-vue';
import { configManager, type UploadConfig } from '../config/uploadConfig';

// 响应式配置
const localConfig = reactive<UploadConfig>({
  mode: 'mock',
  apiBaseUrl: 'http://localhost:3000',
  chunkSize: 5 * 1024 * 1024,
  concurrency: 4,
  enableWebWorker: true,
  enableProgress: true
});

// 分片大小选项
const chunkSizeOption = ref('5MB');

// 分片大小映射
const chunkSizeMap = {
  '1MB': 1 * 1024 * 1024,
  '2MB': 2 * 1024 * 1024,
  '5MB': 5 * 1024 * 1024,
  '10MB': 10 * 1024 * 1024
};

// 加载配置
const loadConfig = () => {
  const config = configManager.getConfig();
  Object.assign(localConfig, config);
  
  // 设置分片大小选项
  const sizeInMB = config.chunkSize / (1024 * 1024);
  if (sizeInMB === 1) chunkSizeOption.value = '1MB';
  else if (sizeInMB === 2) chunkSizeOption.value = '2MB';
  else if (sizeInMB === 5) chunkSizeOption.value = '5MB';
  else if (sizeInMB === 10) chunkSizeOption.value = '10MB';
  else chunkSizeOption.value = 'custom';
};

// 处理模式变化
const handleModeChange = () => {
  console.log('🔧 模式切换:', localConfig.mode);
  handleConfigChange();
};

// 处理分片大小变化
const handleChunkSizeChange = () => {
  if (chunkSizeOption.value !== 'custom') {
    localConfig.chunkSize = chunkSizeMap[chunkSizeOption.value as keyof typeof chunkSizeMap];
  }
  handleConfigChange();
};

// 处理配置变化
const handleConfigChange = () => {
  console.log('🔧 配置变化:', localConfig);
};

// 应用配置
const applyConfig = () => {
  configManager.updateConfig(localConfig);
  ElMessage.success('配置已应用');
  console.log('🔧 配置已应用:', localConfig);
};

// 重置配置
const resetConfig = () => {
  configManager.resetToDefault();
  loadConfig();
  ElMessage.info('配置已重置为默认值');
  console.log('🔧 配置已重置');
};

// 监听配置变化
watch(localConfig, (newConfig) => {
  console.log('🔧 配置监听变化:', newConfig);
}, { deep: true });

// 组件挂载时加载配置
onMounted(() => {
  loadConfig();
  console.log('🔧 ConfigPanel 已加载');
});
</script>

<style scoped>
.config-panel {
  margin-bottom: 20px;
  border-radius: 12px;
}

.config-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.radio-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.switch-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.switch-label {
  font-size: 14px;
  color: #666;
}

.config-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 10px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .config-actions {
    flex-direction: column;
  }
  
  .config-actions .el-button {
    width: 100%;
  }
}
</style>

