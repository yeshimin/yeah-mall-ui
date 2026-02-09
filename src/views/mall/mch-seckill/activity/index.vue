<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="queryParams" class="mb-4">
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
        <el-button type="success" icon="Plus" @click="handleAdd">
          新增活动
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
      <el-table-column prop="remark" label="活动备注" min-width="200" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            icon="Edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['mall:seckill:edit']"
          >
            编辑
          </el-button>
          <el-button
            size="small"
            type="danger"
            icon="Delete"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['mall:seckill:delete']"
          >
            删除
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
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="活动名称" prop="activityName">
          <el-input
            v-model="form.activityName"
            placeholder="请输入活动名称"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="请选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="请选择结束时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="活动状态" prop="status">
          <el-select
            v-model="form.status"
            placeholder="请选择活动状态"
            style="width: 100%"
          >
            <el-option label="未开始" value="0" />
            <el-option label="进行中" value="1" />
            <el-option label="已结束" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入活动备注"
            :rows="3"
            maxlength="200"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
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

// 表单数据
const form = reactive({
  id: '',
  activityName: '',
  startTime: '',
  endTime: '',
  status: 0,
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
    remark: '春季限时秒杀，全场商品低至5折'
  },
  {
    id: 2,
    activityName: '情人节秒杀',
    startTime: '2026-02-14 00:00:00',
    endTime: '2026-02-14 23:59:59',
    status: 1,
    remark: '情人节特别秒杀活动'
  },
  {
    id: 3,
    activityName: '春节秒杀',
    startTime: '2026-02-01 00:00:00',
    endTime: '2026-02-07 23:59:59',
    status: 2,
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

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增活动'
  Object.assign(form, {
    id: '',
    activityName: '',
    startTime: '',
    endTime: '',
    status: 0,
    remark: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑活动'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = (id) => {
  ElMessage.success('删除成功')
  getActivityList()
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

.dialog-footer {
  text-align: right;
}
</style>