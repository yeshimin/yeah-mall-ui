<template>
  <div class="chat-manage">
    <div class="page-header">
      <h2>客服消息</h2>
    </div>

    <el-card class="search-card">
      <el-form ref="searchFormRef" :model="searchForm" label-position="left" label-width="80px" inline>
        <el-form-item label="会话状态">
          <el-select v-model="searchForm.status" placeholder="请选择会话状态" clearable style="width: 200px;">
            <el-option label="全部" value=""></el-option>
            <el-option label="活跃" value="active"></el-option>
            <el-option label="已结束" value="ended"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="请输入用户昵称或会话内容" clearable style="width: 300px;"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <h3>会话列表</h3>
        </div>
      </template>
      <el-table v-loading="loading" :data="conversationList" style="width: 100%" @sort-change="handleSortChange">
        <el-table-column prop="id" label="会话ID" min-width="180" sortable="custom"></el-table-column>
        <el-table-column prop="memberId" label="用户ID" min-width="120" sortable="custom"></el-table-column>
        <el-table-column label="用户信息" min-width="200">
          <template #default="scope">
            <div class="user-info">
              <div class="user-name">用户 {{ scope.row.memberId }}</div>
              <div class="user-avatar">
                <el-image
                  src="https://via.placeholder.com/40"
                  fit="cover"
                  style="width: 40px; height: 40px; border-radius: 50%;"
                ></el-image>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="会话信息" min-width="300">
          <template #default="scope">
            <div class="last-message">
              <div class="message-content">创建时间：{{ formatTime(scope.row.createTime) }}</div>
              <div class="message-time">更新时间：{{ formatTime(scope.row.updateTime) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="180" sortable="custom"></el-table-column>
        <el-table-column label="操作" min-width="120" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleViewConversation(scope.row)">查看聊天</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container" style="margin-top: 20px; text-align: right;">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 聊天对话框 -->
    <el-dialog v-model="chatDialogVisible" :title="chatTitle" width="800px" height="70vh">
      <div class="chat-dialog">
        <!-- 聊天记录 -->
        <div class="chat-messages" ref="chatMessagesRef" v-loading="messagesLoading">
          <div v-for="(message, index) in chatMessages" :key="index" :class="['message-item', message.type === 'send' ? 'send' : 'receive']">
            <div class="message-avatar" v-if="message.avatar">
              <el-image
                :src="message.avatar"
                fit="cover"
                style="width: 36px; height: 36px; border-radius: 50%;"
              ></el-image>
            </div>
            <div class="message-content">
              <div class="message-bubble" :class="message.type === 'send' ? 'send' : 'receive'">
                <template v-if="message.type === 'image'">
                  <el-image
                    :src="message.content"
                    fit="cover"
                    style="max-width: 200px; max-height: 200px;"
                  ></el-image>
                </template>
                <template v-else>
                  {{ message.content }}
                </template>
              </div>
              <div class="message-time">{{ formatTime(message.createTime) }}</div>
            </div>
          </div>
          <div v-if="chatMessages.length === 0" class="no-messages">
            <span>暂无消息</span>
          </div>
        </div>

        <!-- 消息输入 -->
        <div class="chat-input">
          <el-upload
            class="image-upload"
            action="#"
            :auto-upload="false"
            :on-change="handleImageUpload"
            :show-file-list="false"
            accept="image/*"
          >
            <el-button size="small" type="primary" icon="el-icon-picture-outline"></el-button>
          </el-upload>
          <el-input
            v-model="messageInput"
            type="textarea"
            placeholder="请输入消息内容"
            :rows="3"
            @keyup.enter.exact="handleSendMessage"
          ></el-input>
          <el-button type="primary" @click="handleSendMessage" :loading="sending">发送</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import wsService from '@/utils/websocket';
import { queryConversationList, queryConversationMessages } from '@/api/mall/cschat';

const loading = ref(false);
const messagesLoading = ref(false);
const sending = ref(false);
const chatMessagesRef = ref(null);

const searchForm = reactive({
  status: '',
  keyword: ''
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
});

const sortConfig = reactive({
  prop: 'createTime',
  order: 'desc'
});

const conversationList = ref([]);
const chatDialogVisible = ref(false);
const chatTitle = ref('');
const currentConversation = ref(null);
const chatMessages = ref([]);
const messageInput = ref('');

// 格式化时间
const formatTime = (time) => {
  if (!time) return '';
  const date = new Date(time);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
    }
  });
};

// 获取会话列表
const getConversationList = async () => {
  try {
    loading.value = true;
    
    const sortField = sortConfig.prop;
    const sortOrder = sortConfig.order;
    const conditions_ = `${sortField}:sort:${sortOrder}`;
    
    const params = {
      current: pagination.current,
      size: pagination.pageSize,
      conditions_
    };
    
    const response = await queryConversationList(params);
    if (response.code === 0 && response.data) {
      conversationList.value = response.data.records || [];
      pagination.total = parseInt(response.data.total) || 0;
    } else {
      conversationList.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error('获取会话列表失败:', error);
    ElMessage.error('获取会话列表失败');
    conversationList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 获取聊天消息
const getChatMessages = async (conversationId) => {
  try {
    messagesLoading.value = true;
    
    const params = {
      conversationId,
      current: 1,
      size: 50
    };
    
    const response = await queryConversationMessages(params);
    if (response.code === 0 && response.data) {
      // 转换消息格式并倒序，确保最新的消息在下面
      chatMessages.value = (response.data.records || []).map(msg => ({
        id: msg.id,
        conversationId: msg.conversationId,
        content: msg.msgContent,
        type: msg.msgDirection === 1 ? 'receive' : 'send', // 1-买家到商家（接收），2-商家到买家（发送）
        createTime: msg.createTime,
        avatar: 'https://via.placeholder.com/40'
      })).reverse();
    } else {
      chatMessages.value = [];
    }
  } catch (error) {
    console.error('获取聊天消息失败:', error);
    ElMessage.error('获取聊天消息失败');
    chatMessages.value = [];
  } finally {
    messagesLoading.value = false;
    scrollToBottom();
  }
};

// 查看聊天
const handleViewConversation = (row) => {
  currentConversation.value = row;
  chatTitle.value = `与用户 ${row.memberId} 的聊天`;
  chatMessages.value = [];
  getChatMessages(row.id);
  chatDialogVisible.value = true;
};

// 发送消息
const handleSendMessage = () => {
  if (!messageInput.value.trim()) {
    return;
  }

  sending.value = true;

  try {
    // 构造WebSocket消息
    const wsMessage = {
      category: 'biz-handle',
      command: 'cs-chat.mch',
      subCmd: 'msg.mch2mem',
      payload: {
        shopId: localStorage.getItem('shopId') || '',
        from: '1', // 当前商家的id
        to: currentConversation.value.memberId, // 买家的id
        content: messageInput.value,
        type: 1 // 1表示文本消息
      }
    };

    // 通过WebSocket发送消息
    const success = wsService.send(wsMessage);
    
    if (success) {
      // 本地添加消息
      const newMessage = {
        id: Date.now().toString(),
        conversationId: currentConversation.value.id,
        content: messageInput.value,
        type: 'send',
        createTime: new Date().toISOString(),
        avatar: 'https://via.placeholder.com/40'
      };

      chatMessages.value.push(newMessage);
      messageInput.value = '';
      scrollToBottom();
    } else {
      ElMessage.error('发送消息失败，请检查网络连接');
    }
  } catch (error) {
    console.error('发送消息失败:', error);
    ElMessage.error('发送消息失败');
  } finally {
    sending.value = false;
  }
};

// 处理图片上传
const handleImageUpload = (file) => {
  // 模拟图片上传
  const imageUrl = URL.createObjectURL(file.raw);
  
  const newMessage = {
    id: Date.now().toString(),
    conversationId: currentConversation.value.id,
    content: imageUrl,
    type: 'send',
    createTime: new Date().toISOString(),
    avatar: 'https://via.placeholder.com/40'
  };

  chatMessages.value.push(newMessage);
  scrollToBottom();

  // 通过WebSocket发送图片消息
  const wsMessage = {
    category: 'biz-handle',
    command: 'cs-chat.mch',
    subCmd: 'msg.mch2mem',
    payload: {
      shopId: localStorage.getItem('shopId') || '',
      from: '1', // 当前商家的id
      to: currentConversation.value.memberId, // 买家的id
      content: imageUrl, // 图片URL
      type: 2 // 2表示图片消息
    }
  };
  wsService.send(wsMessage);
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  getConversationList();
};

// 重置
const resetForm = () => {
  searchForm.status = '';
  searchForm.keyword = '';
  pagination.current = 1;
  getConversationList();
};

// 排序
const handleSortChange = ({ prop, order }) => {
  if (prop && order) {
    sortConfig.prop = prop;
    sortConfig.order = order === 'ascending' ? 'asc' : 'desc';
    getConversationList();
  }
};

// 分页
const handleSizeChange = (size) => {
  pagination.pageSize = size;
  getConversationList();
};

const handleCurrentChange = (current) => {
  pagination.current = current;
  getConversationList();
};

// 注册WebSocket消息处理器
const handleWebSocketMessage = (message) => {
  console.log('收到WebSocket消息:', message);
  
  // 处理买家发送给商家的消息
  if (message.category === 'biz-handle' && message.command === 'cs-chat.mem' && message.subCmd === 'msg.mem2mch') {
    const payload = message.payload;
    console.log('处理买家消息，payload:', payload);
    console.log('当前会话:', currentConversation.value);
    console.log('本地shopId:', localStorage.getItem('shopId'));
    
    if (payload && currentConversation.value) {
      console.log('payload.shopId:', payload.shopId);
      console.log('localStorage.shopId:', localStorage.getItem('shopId'));
      console.log('payload.from:', payload.from);
      console.log('currentConversation.memberId:', currentConversation.value.memberId);
      
      // 检查shopId是否匹配（注意类型转换）
      if (String(payload.shopId) === String(localStorage.getItem('shopId'))) {
        console.log('店铺ID匹配');
        // 检查是否是当前会话的消息（通过买家ID匹配，注意类型转换）
        if (String(payload.from) === String(currentConversation.value.memberId)) {
          console.log('买家ID匹配，添加消息到对话框');
          // 本地添加消息
          const newMessage = {
            id: Date.now().toString(),
            conversationId: currentConversation.value.id,
            content: payload.content,
            type: 'receive', // 买家发送的消息，显示为接收
            createTime: new Date().toISOString(),
            avatar: 'https://via.placeholder.com/40'
          };
          
          chatMessages.value.push(newMessage);
          scrollToBottom();
        } else {
          console.log('买家ID不匹配，忽略消息');
        }
      } else {
        console.log('店铺ID不匹配，忽略消息');
      }
    } else {
      console.log('payload或currentConversation为空，忽略消息');
    }
  }
  
  // 处理其他类型的消息...
};

onMounted(() => {
  getConversationList();
  // 注册WebSocket消息处理器
  wsService.onMessage(handleWebSocketMessage);
});
</script>

<style lang="scss" scoped>
.chat-manage {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  font-weight: bold;
}

.last-message {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-content {
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-time {
  font-size: 12px;
  color: #909399;
}

/* 聊天对话框样式 */
.chat-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f7fa;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
  gap: 10px;
  align-items: flex-start;

  &.send {
    flex-direction: row-reverse;
  }
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &.send {
    align-items: flex-end;
  }

  &.receive {
    align-items: flex-start;
  }
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 18px;
  word-break: break-word;

  &.send {
    background-color: #409eff;
    color: white;
    border-bottom-right-radius: 4px;
  }

  &.receive {
    background-color: white;
    color: #303133;
    border-bottom-left-radius: 4px;
  }
}

.no-messages {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

.chat-input {
  padding: 20px;
  border-top: 1px solid #ebeef5;
  background-color: white;
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.image-upload {
  flex-shrink: 0;
}

.el-input {
  flex: 1;
  min-height: 80px;
}

.el-textarea__inner {
  resize: none;
  min-height: 80px;
}

.no-messages {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}
</style>