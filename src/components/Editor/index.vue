<template>
  <div>
    <el-upload
      :action="uploadUrl"
      :before-upload="handleBeforeUpload"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      name="file"
      :show-file-list="false"
      :headers="headers"
      class="editor-img-uploader"
      v-if="type == 'url'"
    >
      <i ref="uploadRef" class="editor-img-uploader"></i>
    </el-upload>
  </div>
  <div class="editor">
    <quill-editor
      ref="quillEditorRef"
      v-model:content="content"
      contentType="html"
      @textChange="(e) => $emit('update:modelValue', content)"
      :options="options"
      :style="styles"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, getCurrentInstance, toRaw } from 'vue'
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { getToken } from "@/utils/auth";
import { ElMessage } from 'element-plus';

const quillEditorRef = ref();
const uploadRef = ref();
const uploadUrl = ref(import.meta.env.VITE_APP_BASE_API + "/mch/storage/upload"); // 上传的图片服务器地址
const headers = ref({
  Authorization: "Bearer " + getToken()
});

const props = defineProps({
  /* 编辑器的内容 */
  modelValue: {
    type: String,
  },
  /* 高度 */
  height: {
    type: Number,
    default: null,
  },
  /* 最小高度 */
  minHeight: {
    type: Number,
    default: null,
  },
  /* 只读 */
  readOnly: {
    type: Boolean,
    default: false,
  },
  /* 上传文件大小限制(MB) */
  fileSize: {
    type: Number,
    default: 5,
  },
  /* 类型（base64格式、url格式） */
  type: {
    type: String,
    default: "url",
  }
});

const options = ref({
  theme: "snow",
  bounds: document.body,
  debug: "warn",
  modules: {
    // 工具栏配置
    toolbar: [
      ["bold", "italic", "underline", "strike"],      // 加粗 斜体 下划线 删除线
      ["blockquote", "code-block"],                   // 引用  代码块
      [{ list: "ordered" }, { list: "bullet" }],      // 有序、无序列表
      [{ indent: "-1" }, { indent: "+1" }],           // 缩进
      [{ size: ["small", false, "large", "huge"] }],  // 字体大小
      [{ header: [1, 2, 3, 4, 5, 6, false] }],        // 标题
      [{ color: [] }, { background: [] }],            // 字体颜色、字体背景颜色
      [{ align: [] }],                                // 对齐方式
      ["clean"],                                      // 清除文本格式
      ["link", "image", "video"],                   // 链接、图片、视频
      ["custom-fullscreen"]                         // 全屏按钮
    ],
  },
  placeholder: "请输入内容",
  readOnly: props.readOnly
});

const styles = computed(() => {
  let style = {};
  if (props.minHeight) {
    style.minHeight = `${props.minHeight}px`;
  }
  if (props.height) {
    style.height = `${props.height}px`;
  }
  return style;
});

const content = ref("");
const isFullscreen = ref(false);

watch(() => props.modelValue, (v) => {
  if (v !== content.value) {
    content.value = v === undefined || v === null ? "<p></p>" : v;
  }
}, { immediate: true });

// 全屏切换函数
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
  
  // 获取编辑器容器元素
  const editorContainer = document.querySelector('.editor');
  
  if (isFullscreen.value) {
    // 进入全屏
    if (editorContainer.requestFullscreen) {
      editorContainer.requestFullscreen();
    } else if (editorContainer.webkitRequestFullscreen) { // Safari
      editorContainer.webkitRequestFullscreen();
    } else if (editorContainer.msRequestFullscreen) { // IE11
      editorContainer.msRequestFullscreen();
    }
  } else {
    // 退出全屏
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { // Safari
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE11
      document.msExitFullscreen();
    }
  }
}

// 自定义图片上传事件
onMounted(() => {
  let quill = quillEditorRef.value.getQuill();
  let toolbar = quill.getModule("toolbar");
  
  // 图片上传处理
  toolbar.addHandler("image", (value) => {
    if (value) {
      if (props.type == 'url') {
        uploadRef.value.click();
      } else if (props.type == 'base64') {
        // 创建文件选择输入
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            // 校验文件格式和大小
            if (handleBeforeUpload(file)) {
              // 转换为base64
              const reader = new FileReader();
              reader.onload = (event) => {
                const base64Url = event.target.result;
                // 获取光标位置
                const selection = quill.getSelection();
                if (selection) {
                  const length = selection.index;
                  // 插入图片
                  quill.insertEmbed(length, "image", base64Url);
                  // 调整光标到最后
                  quill.setSelection(length + 1);
                }
              };
              reader.readAsDataURL(file);
            }
          }
        };
        input.click();
      }
    } else {
      quill.format("image", false);
    }
  });
  
  // 添加全屏按钮处理函数
  toolbar.addHandler("custom-fullscreen", () => {
    toggleFullscreen();
  });
});

// 上传前校检格式和大小
function handleBeforeUpload(file) {
  const type = ["image/jpeg", "image/jpg", "image/png", "image/svg"];
  const isJPG = type.includes(file.type);
  //检验文件格式
  if (!isJPG) {
    ElMessage.error(`图片格式错误!`);
    return false;
  }
  // 校检文件大小
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize;
    if (!isLt) {
      ElMessage.error(`上传文件大小不能超过 ${props.fileSize} MB!`);
      return false;
    }
  }
  return true;
}

// 构造完整的图片URL
function getFullImageUrl(fileKey) {
  if (!fileKey) return '';
  
  // 根据当前激活的环境获取相应的基础地址配置
  const env = import.meta.env.VITE_APP_ENV;
  
  // 根据不同环境构造图片URL
  if (env === 'development') {
    // 开发环境从环境变量中获取目标地址
    const proxyTarget = import.meta.env.VITE_APP_DEV_BACKEND_URL || 'http://localhost:8080';
    return `${proxyTarget}/public/storage/preview?fileKey=${fileKey}`;
  } else {
    // 其他环境(生产、测试等)使用配置的基础API路径
    const baseApi = import.meta.env.VITE_APP_BASE_API || '';
    return `${baseApi}/public/storage/preview?fileKey=${fileKey}`;
  }
}

// 上传成功处理
function handleUploadSuccess(res, file) {
  // 确保res是对象
  const response = typeof res === 'string' ? JSON.parse(res) : res;
  // 如果上传成功
  if (response.code === 0) {
    // 获取富文本实例
    let quill = quillEditorRef.value.getQuill();
    // 获取光标位置
    let selection = quill.getSelection();
    if (!selection) return;
    let length = selection.index;
    // 插入图片，使用构造的完整图片URL
    const fileKey = response.data ? response.data.fileKey : '';
    if (fileKey) {
      const imageUrl = getFullImageUrl(fileKey);
      quill.insertEmbed(length, "image", imageUrl);
      // 调整光标到最后
      quill.setSelection(length + 1);
    } else {
      ElMessage.error("图片插入失败：未返回文件key");
    }
  } else {
    ElMessage.error(response.message || "图片插入失败");
  }
}

// 上传失败处理
function handleUploadError(error) {
  ElMessage.error("图片插入失败");
  console.error('图片上传失败:', error);
}
</script>

<style>
.editor-img-uploader {
  display: none;
}
.editor, .ql-toolbar {
  white-space: pre-wrap !important;
  line-height: normal !important;
}
.quill-img {
  display: none;
}
.ql-snow .ql-tooltip[data-mode="link"]::before {
  content: "请输入链接地址:";
}
.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
  border-right: 0px;
  content: "保存";
  padding-right: 0px;
}
.ql-snow .ql-tooltip[data-mode="video"]::before {
  content: "请输入视频地址:";
}
.ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
  content: "14px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="small"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
  content: "10px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="large"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="large"]::before {
  content: "18px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="huge"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before {
  content: "32px";
}
.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: "文本";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
  content: "标题1";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
  content: "标题2";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
  content: "标题3";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
  content: "标题4";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="5"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="5"]::before {
  content: "标题5";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="6"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="6"]::before {
  content: "标题6";
}
.ql-snow .ql-picker.ql-font .ql-picker-label::before,
.ql-snow .ql-picker.ql-font .ql-picker-item::before {
  content: "标准字体";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before {
  content: "衬线字体";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before {
  content: "等宽字体";
}

/* 全屏按钮样式 */
.ql-snow .ql-toolbar .ql-formats button.ql-custom-fullscreen::before {
  content: "全屏";
}
</style>
