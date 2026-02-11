<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="queryParams" class="mb8">
      <el-form-item label="活动名称" prop="activityName">
        <el-input
          v-model="queryParams.activityName"
          placeholder="请输入活动名称"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="活动状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择活动状态"
          clearable
          style="width: 200px"
        >
          <el-option label="未开始" value="0" />
          <el-option label="进行中" value="1" />
          <el-option label="已结束" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="RefreshLeft" @click="resetQuery">
          重置
        </el-button>
        <el-button type="success" icon="Plus" @click="handleApply">
          申请参加活动
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 活动列表 -->
    <el-table
      v-loading="loading"
      :data="activityList"
      style="width: 100%"
    >
      <el-table-column type="index" label="序号" width="80" />
      <el-table-column prop="activityName" label="活动名称" min-width="200" />
      <el-table-column prop="startTime" label="开始时间" min-width="180" />
      <el-table-column prop="endTime" label="结束时间" min-width="180" />
      <el-table-column prop="status" label="活动状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : scope.row.status === 0 ? 'warning' : 'info'">
            {{ scope.row.status === 1 ? '进行中' : scope.row.status === 0 ? '未开始' : '已结束' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="applyStatus" label="申请状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.applyStatus === 1 ? 'success' : scope.row.applyStatus === 0 ? 'warning' : 'info'">
              {{ scope.row.applyStatus === 1 ? '已申请' : scope.row.applyStatus === 2 ? '已通过' : '未申请' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hasSession" label="场次设置" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.hasSession === 1 ? 'success' : 'info'">
              {{ scope.row.hasSession === 1 ? '多场次' : '单场次' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sessionCount" label="场次数量" width="100">
          <template #default="scope">
            {{ scope.row.sessionCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="活动备注" min-width="200" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button
            v-if="scope.row.applyStatus === 0"
            size="small"
            type="primary"
            icon="Edit"
            @click="handleApply(scope.row)"
            v-hasPermi="['mall:seckill:apply']"
          >
            申请
          </el-button>
          <el-button
            v-else-if="scope.row.applyStatus === 1"
            size="small"
            type="info"
            icon="View"
            @click="handleView(scope.row)"
            v-hasPermi="['mall:seckill:view']"
          >
            查看
          </el-button>
          <el-button
            v-else
            size="small"
            type="success"
            icon="Check"
            @click="handleView(scope.row)"
            v-hasPermi="['mall:seckill:view']"
          >
            已通过
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :page-sizes="[10, 20, 30, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="Number(total)"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 活动详情对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        label-width="100px"
      >
        <el-form-item label="活动名称">
          <el-input
            v-model="form.activityName"
            placeholder="请输入活动名称"
            maxlength="50"
            readonly
          />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="请选择开始时间"
            style="width: 100%"
            readonly
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="请选择结束时间"
            style="width: 100%"
            readonly
          />
        </el-form-item>
        <el-form-item label="活动状态">
          <el-select
            v-model="form.status"
            placeholder="请选择活动状态"
            style="width: 100%"
            disabled
          >
            <el-option label="未开始" value="0" />
            <el-option label="进行中" value="1" />
            <el-option label="已结束" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请状态">
          <el-select
            v-model="form.applyStatus"
            placeholder="请选择申请状态"
            style="width: 100%"
            disabled
          >
            <el-option label="未申请" value="0" />
            <el-option label="已申请" value="1" />
            <el-option label="已通过" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="场次设置">
          <el-select
            v-model="form.hasSession"
            placeholder="请选择场次设置"
            style="width: 100%"
            disabled
          >
            <el-option label="单场次" value="0" />
            <el-option label="多场次" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="场次数量">
          <el-input
            v-model="form.sessionCount"
            placeholder="场次数量"
            style="width: 100%"
            disabled
          />
        </el-form-item>
        <el-form-item label="活动备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入活动备注"
            :rows="3"
            maxlength="200"
            readonly
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 场次选择对话框 -->
    <el-dialog
      title="选择秒杀场次"
      v-model="sessionDialogVisible"
      width="600px"
    >
      <div v-if="selectedActivity.hasSession === 1">
        <el-checkbox v-model="selectAllSessions" @change="handleSelectAllSessions">全选所有场次</el-checkbox>
        <el-divider />
        <el-checkbox-group v-model="selectedSessions" class="session-list">
          <el-checkbox
            v-for="session in sessionList"
            :key="session.id"
            :label="session.id"
            style="display: block; margin-bottom: 10px"
          >
            <div class="session-item">
              <div class="session-name">{{ session.name }}</div>
              <div class="session-time">{{ session.startTime }} 至 {{ session.endTime }}</div>
              <div class="session-status">
                <el-tag :type="session.status === 1 ? 'success' : 'danger'">
                  {{ session.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </div>
            </div>
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <div v-else class="no-session">
        <el-empty description="该活动为单场次，无需选择场次" />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="sessionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSessionSelection">确定选择</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 表格数据
const loading = ref(false)
const activityList = ref([])
const total = ref(0)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  activityName: '',
  status: ''
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

// 场次选择相关
const sessionDialogVisible = ref(false)
const selectedActivity = ref({})
const sessionList = ref([])
const selectedSessions = ref([])
const selectAllSessions = ref(false)

// 表单数据
const form = reactive({
  id: '',
  activityName: '',
  startTime: '',
  endTime: '',
  status: 0,
  applyStatus: 0,
  hasSession: 0,
  sessionCount: 0,
  remark: ''
})

// 表单验证规则
const rules = reactive({
  activityName: [
    { required: true, message: '请输入活动名称', trigger: 'blur' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'blur' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择活动状态', trigger: 'blur' }
  ]
})

// 模拟数据
const mockActivityList = [
  {
    id: 1,
    activityName: '春季秒杀活动',
    startTime: '2026-02-10 10:00:00',
    endTime: '2026-02-15 23:59:59',
    status: 0,
    applyStatus: 0,
    hasSession: 1,
    sessionCount: 3,
    remark: '春季限时秒杀，全场商品低至5折'
  },
  {
    id: 2,
    activityName: '情人节秒杀',
    startTime: '2026-02-14 00:00:00',
    endTime: '2026-02-14 23:59:59',
    status: 1,
    applyStatus: 1,
    hasSession: 1,
    sessionCount: 2,
    remark: '情人节特别秒杀活动'
  },
  {
    id: 3,
    activityName: '春节秒杀',
    startTime: '2026-02-01 00:00:00',
    endTime: '2026-02-07 23:59:59',
    status: 2,
    applyStatus: 2,
    hasSession: 0,
    sessionCount: 0,
    remark: '春节期间限时秒杀'
  }
]

// 加载活动列表
const getActivityList = () => {
  loading.value = true
  // 模拟API请求
  setTimeout(() => {
    activityList.value = mockActivityList
    total.value = mockActivityList.length
    loading.value = false
  }, 500)
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  getActivityList()
}

// 重置
const resetQuery = () => {
  Object.assign(queryParams, {
    activityName: '',
    status: ''
  })
  handleQuery()
}

// 分页
const handleSizeChange = (size) => {
  queryParams.pageSize = size
  handleQuery()
}

const handleCurrentChange = (current) => {
  queryParams.pageNum = current
  handleQuery()
}

// 申请参加活动
const handleApply = (row) => {
  if (row && row.hasSession === 1) {
    // 多场次活动，显示场次选择对话框
    selectedActivity.value = row
    loadSessionList(row.id)
    sessionDialogVisible.value = true
  } else {
    // 单场次活动，直接申请
    confirmApply(row)
  }
}

// 加载场次列表
const loadSessionList = (activityId) => {
  // 模拟API请求
  setTimeout(() => {
    sessionList.value = [
      {
        id: 1,
        activityId: activityId,
        name: '上午场',
        startTime: '2026-02-14 10:00:00',
        endTime: '2026-02-14 12:00:00',
        status: 1
      },
      {
        id: 2,
        activityId: activityId,
        name: '下午场',
        startTime: '2026-02-14 14:00:00',
        endTime: '2026-02-14 16:00:00',
        status: 1
      },
      {
        id: 3,
        activityId: activityId,
        name: '晚上场',
        startTime: '2026-02-14 19:00:00',
        endTime: '2026-02-14 21:00:00',
        status: 0
      }
    ]
    selectedSessions.value = []
    selectAllSessions.value = false
  }, 300)
}

// 全选场次
const handleSelectAllSessions = (value) => {
  if (value) {
    // 只选择启用的场次
    selectedSessions.value = sessionList.value
      .filter(session => session.status === 1)
      .map(session => session.id)
  } else {
    selectedSessions.value = []
  }
}

// 确认选择场次
const confirmSessionSelection = () => {
  if (selectedSessions.value.length === 0) {
    ElMessage.warning('请至少选择一个场次')
    return
  }
  
  sessionDialogVisible.value = false
  confirmApply(selectedActivity.value, selectedSessions.value)
}

// 确认申请
const confirmApply = (row, selectedSessionIds = []) => {
  ElMessageBox.confirm('确定要申请参加该活动吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟申请操作
    setTimeout(() => {
      if (selectedSessionIds.length > 0) {
        ElMessage.success(`申请成功，已选择 ${selectedSessionIds.length} 个场次，请等待管理员审核`)
      } else {
        ElMessage.success('申请成功，请等待管理员审核')
      }
      getActivityList()
    }, 500)
  }).catch(() => {
    // 取消申请
  })
}

// 查看活动详情
const handleView = (row) => {
  dialogTitle.value = '活动详情'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 提交
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('操作成功')
      dialogVisible.value = false
      getActivityList()
    }
  })
}

// 初始化
onMounted(() => {
  getActivityList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.mb8 {
  margin-bottom: 8px;
}

.dialog-footer {
  text-align: right;
}

.session-list {
  margin-top: 10px;
}

.session-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-left: 20px;
}

.session-name {
  font-weight: bold;
  color: #333;
}

.session-time {
  font-size: 12px;
  color: #666;
}

.session-status {
  margin-top: 4px;
}

.no-session {
  padding: 40px 0;
  text-align: center;
}
</style>