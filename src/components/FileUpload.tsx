import { defineComponent, ref, reactive, onMounted, onUnmounted } from 'vue';
import { ElUpload, ElButton, ElProgress, ElMessage, ElCard, ElIcon } from 'element-plus';
import { Upload, Delete, Play, Pause } from '@element-plus/icons-vue';
import { UploadController, UploadProgress } from '../core/UploadController';
import { MockRequestStrategy } from '../core/MockRequestStrategy';

export default defineComponent({
  name: 'FileUpload',
  components: {
    ElUpload,
    ElButton,
    ElProgress,
    ElCard,
    ElIcon,
    Upload,
    Delete,
    Play,
    Pause
  },
  setup() {
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

    // 处理文件选择
    const handleFileChange = (file: File) => {
      selectedFile.value = file;
      progress.loaded = 0;
      progress.total = file.size;
      progress.percentage = 0;
      progress.uploadedChunks = 0;
      progress.totalChunks = 0;
      fileUrl.value = '';
    };

    // 开始上传
    const startUpload = async () => {
      if (!selectedFile.value) {
        ElMessage.warning('请先选择文件');
        return;
      }

      try {
        // 创建请求策略（这里使用模拟实现）
        const requestStrategy = new MockRequestStrategy();
        
        // 创建上传控制器
        uploadController.value = new UploadController(
          selectedFile.value,
          requestStrategy
        );

        // 设置事件监听
        setupEventListeners();

        // 开始上传
        await uploadController.value.init();
        isUploading.value = true;
        isPaused.value = false;
      } catch (error) {
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
      if (!uploadController.value) return;

      uploadController.value.on('progress', (newProgress: UploadProgress) => {
        Object.assign(progress, newProgress);
      });

      uploadController.value.on('end', (url: string) => {
        fileUrl.value = url;
        isUploading.value = false;
        isPaused.value = false;
        ElMessage.success('上传完成！');
      });

      uploadController.value.on('error', (error: Error) => {
        isUploading.value = false;
        isPaused.value = false;
        ElMessage.error('上传失败: ' + error.message);
      });
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

    return () => (
      <div class="file-upload-container">
        <ElCard header="大文件分片上传示例" class="upload-card">
          <div class="upload-content">
            {/* 文件选择区域 */}
            <div class="file-selector">
              <ElUpload
                class="upload-dragger"
                drag
                showFileList={false}
                beforeUpload={(file: File) => {
                  handleFileChange(file);
                  return false; // 阻止自动上传
                }}
                accept="*/*"
              >
                <div class="upload-area">
                  <ElIcon size="48" color="#409EFF">
                    <Upload />
                  </ElIcon>
                  <div class="upload-text">
                    <p>点击或拖拽文件到此区域上传</p>
                    <p class="upload-hint">支持任意格式文件，推荐大文件测试分片上传效果</p>
                  </div>
                </div>
              </ElUpload>
            </div>

            {/* 文件信息 */}
            {selectedFile.value && (
              <div class="file-info">
                <h4>文件信息</h4>
                <p><strong>文件名:</strong> {selectedFile.value.name}</p>
                <p><strong>文件大小:</strong> {formatFileSize(selectedFile.value.size)}</p>
                <p><strong>文件类型:</strong> {selectedFile.value.type || '未知'}</p>
              </div>
            )}

            {/* 上传控制按钮 */}
            <div class="upload-controls">
              <ElButton
                type="primary"
                size="large"
                disabled={!selectedFile.value || isUploading.value}
                onClick={startUpload}
              >
                {isUploading.value ? '上传中...' : '开始上传'}
              </ElButton>
              
              {isUploading.value && (
                <ElButton
                  type={isPaused.value ? 'success' : 'warning'}
                  size="large"
                  onClick={togglePause}
                >
                  <ElIcon>
                    {isPaused.value ? <Play /> : <Pause />}
                  </ElIcon>
                  {isPaused.value ? '恢复上传' : '暂停上传'}
                </ElButton>
              )}
            </div>

            {/* 上传进度 */}
            {isUploading.value && (
              <div class="upload-progress">
                <h4>上传进度</h4>
                <ElProgress
                  percentage={progress.percentage}
                  status={isPaused.value ? 'warning' : 'success'}
                  strokeWidth={8}
                />
                <div class="progress-details">
                  <p>已上传: {formatFileSize(progress.loaded)} / {formatFileSize(progress.total)}</p>
                  <p>分片进度: {progress.uploadedChunks} / {progress.totalChunks}</p>
                </div>
              </div>
            )}

            {/* 完成信息 */}
            {fileUrl.value && (
              <div class="upload-result">
                <h4>上传完成</h4>
                <p>文件访问地址: <a href={fileUrl.value} target="_blank">{fileUrl.value}</a></p>
              </div>
            )}
          </div>
        </ElCard>
      </div>
    );
  }
});
