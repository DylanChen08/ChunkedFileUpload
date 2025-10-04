import { defineComponent } from 'vue';
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import FileUpload from './components/FileUpload';

export default defineComponent({
  name: 'App',
  components: {
    ElConfigProvider,
    FileUpload
  },
  setup() {
    return () => (
      <ElConfigProvider locale={zhCn}>
        <div id="app">
          <div class="app-header">
            <h1>大文件分片上传示例</h1>
            <p>基于Vue3 + TSX + ElementPlus实现的大文件分片上传功能</p>
          </div>
          <FileUpload />
        </div>
      </ElConfigProvider>
    );
  }
});
