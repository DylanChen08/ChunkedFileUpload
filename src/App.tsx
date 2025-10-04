// @ts-nocheck
import { defineComponent, h } from 'vue';
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import FileUpload from './components/FileUpload.vue';

// @ts-ignore
export default defineComponent({
  name: 'App',
  components: {
    ElConfigProvider,
    FileUpload
  },
  setup() {
    console.log('🎯 App组件已加载');
    return () => h(ElConfigProvider, { locale: zhCn as any }, {
      default: () => h('div', { 
        id: 'app',
        style: {
          minHeight: '100vh',
          padding: '20px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }
      }, [
        h('div', { 
          class: 'app-header',
          style: {
            textAlign: 'center',
            color: 'white',
            marginBottom: '30px'
          }
        }, [
          h('h1', {
            style: {
              fontSize: '2.5rem',
              marginBottom: '10px',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }
          }, '大文件分片上传示例'),
          h('p', {
            style: {
              fontSize: '1.1rem',
              opacity: '0.9'
            }
          }, '基于Vue3 + ElementPlus实现的大文件分片上传功能')
        ]),
        h(FileUpload)
      ])
    });
  }
});
