<template>
  <div class="seckill-manage">
    <el-form ref="searchFormRef" :model="queryParams" label-position="left" label-width="80px" inline class="mb8">
      <el-form-item label="活动名称">
        <el-input 
          v-model="queryParams.name" 
          placeholder="请输入活动名称" 
          clearable 
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="活动状态">
        <el-select 
          v-model="queryParams.status" 
          placeholder="请选择活动状态" 
          clearable 
          style="width: 120px"
        >
          <el-option label="启用" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间">
        <el-date-picker 
          v-model="queryParams.startTime" 
          type="date" 
          placeholder="选择开始日期" 
          style="width: 180px" 
        />
      </el-form-item>
      <el-form-item label="结束时间">
        <el-date-picker 
          v-model="queryParams.endTime" 
          type="date" 
          placeholder="选择结束日期" 
          style="width: 180px" 
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">
          <el-icon><Search /></el-icon>
          查询
        </el-button>
        <el-button @click="resetQuery">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增活动
        </el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="activityList" style="width: 100%">
      <el-table-column label="序号" type="index" width="80" />
      <el-table-column prop="name" label="活动名称" width="200" />
      <el-table-column prop="startTime" label="开始时间" width="180" />
      <el-table-column prop="endTime" label="结束时间" width="180" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-switch 
            v-model="scope.row.status" 
            :active-value="1" 
            :inactive-value="0"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="description" label="活动描述" />
      <el-table-column label="操作" width="300" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)" plain>
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button type="success" size="small" @click="handleSession(scope.row)" plain>
            <el-icon><Timer /></el-icon>
            场次管理
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row.id)" plain>
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container" style="margin-top: 20px; text-align: right;">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="Number(pagination.total)"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择开始时间" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="form.endTime" type="datetime" placeholder="选择结束时间" style="width: 100%" />
        </el-form-item>
        <el-form-item label="活动状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="活动描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入活动描述" rows="3" />
        </el-form-item>
        <el-form-item label="场次设置" prop="hasSession">
          <el-switch v-model="form.hasSession" :active-value="1" :inactive-value="0" />
          <span style="margin-left: 10px; color: #999;">启用后可设置多个秒杀场次</span>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete, Timer } from '@element-plus/icons-vue'
import { querySeckillActivityList, createSeckillActivity, updateSeckillActivity, deleteSeckillActivity } from '@/api/mall/seckill'
import { useRouter } from 'vue-router'

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增活动')
const formRef = ref(null)
const router = useRouter()

// 查询参数
const queryParams = reactive({
  name: '',
  status: '',
  startTime: '',
  endTime: ''
})

// 分页参数
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 表单数据
const form = reactive({
  id: '',
  name: '',
  startTime: '',
  endTime: '',
  status: 1,
  hasSession: 1,
  description: ''
})

// 表单规则
const rules = reactive({
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
})

// 活动列表
const activityList = ref([])

// 模拟数据
const mockActivityList = [
  {
    id: 1,
    name: '春节秒杀活动',
    startTime: '2026-02-01 00:00:00',
    endTime: '2026-02-15 23:59:59',
    status: 1,
    hasSession: 1,
    description: '春节期间限时秒杀活动，全场商品低至5折'
  },
  {
    id: 2,
    name: '情人节秒杀',
    startTime: '2026-02-10 00:00:00',
    endTime: '2026-02-14 23:59:59',
    status: 1,
    hasSession: 1,
    description: '情人节特别秒杀活动，为心爱的TA准备惊喜'
  },
  {
    id: 3,
    name: '元宵节秒杀',
    startTime: '2026-02-14 00:00:00',
    endTime: '2026-02-17 23:59:59',
    status: 0,
    hasSession: 0,
    description: '元宵节限时秒杀，传统美食特惠'
  }
]

// 初始化
onMounted(() => {
  getList()
})

// 获取活动列表
function getList() {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    activityList.value = mockActivityList
    pagination.total = mockActivityList.length
    loading.value = false
  }, 500)
}

// 新增活动
function handleAdd() {
  dialogTitle.value = '新增活动'
  form.id = ''
  form.name = ''
  form.startTime = ''
  form.endTime = ''
  form.status = 1
  form.hasSession = 1
  form.description = ''
  dialogVisible.value = true
}

// 编辑活动
function handleEdit(row) {
  dialogTitle.value = '编辑活动'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 提交表单
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      // 模拟API调用
      setTimeout(() => {
        if (form.id) {
          // 编辑
          const index = mockActivityList.findIndex(item => item.id === form.id)
          if (index !== -1) {
            mockActivityList[index] = { ...form }
          }
          ElMessage.success('编辑成功')
        } else {
          // 新增
          const newActivity = {
            ...form,
            id: mockActivityList.length + 1
          }
          mockActivityList.unshift(newActivity)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        getList()
        loading.value = false
      }, 500)
    }
  })
}

// 删除活动
function handleDelete(id) {
  ElMessageBox.confirm('确定要删除该活动吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    // 模拟API调用
    setTimeout(() => {
      const index = mockActivityList.findIndex(item => item.id === id)
      if (index !== -1) {
        mockActivityList.splice(index, 1)
      }
      ElMessage.success('删除成功')
      getList()
      loading.value = false
    }, 500)
  })
}

// 状态变更
function handleStatusChange(row) {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    const index = mockActivityList.findIndex(item => item.id === row.id)
    if (index !== -1) {
      mockActivityList[index].status = row.status
    }
    ElMessage.success('状态更新成功')
    loading.value = false
  }, 500)
}

// 查询
function handleQuery() {
  pagination.current = 1
  getList()
}

// 重置
function resetQuery() {
  Object.assign(queryParams, {
    name: '',
    status: '',
    startTime: '',
    endTime: ''
  })
  handleQuery()
}

// 分页大小变化
function handleSizeChange(size) {
  pagination.size = size
  getList()
}

// 当前页码变化
function handleCurrentChange(current) {
  pagination.current = current
  getList()
}

// 场次管理
function handleSession(row) {
  router.push(`/mall/seckill/session?activityId=${row.id}&activityName=${encodeURIComponent(row.name)}`)
}
</script>

<style lang="scss" scoped>
.seckill-manage {
  padding: 20px;
}

.mb8 {
  margin-bottom: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  text-align: right;
}
</style>