<template>
  <el-config-provider :locale="zhCn">
    <div id="app">
      <div class="app-header">
        <h1>大文件分片上传示例</h1>
        <p>基于Vue3 + ElementPlus实现的大文件分片上传功能</p>
      </div>
      <FileUpload />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import FileUpload from './components/FileUpload.vue';

console.log('🎯 App组件已加载');
</script>

<style>
#app {
  min-height: 100vh;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.app-header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.app-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.app-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}
</style>
