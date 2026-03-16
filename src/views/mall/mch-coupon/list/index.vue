<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="searchFormRef" :inline="true" v-show="showSearch">
      <el-form-item label="优惠券名称">
        <el-input 
          v-model="queryParams.name" 
          placeholder="请输入优惠券名称" 
          clearable 
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="优惠券类型">
        <el-select 
          v-model="queryParams.type" 
          placeholder="请选择优惠券类型" 
          clearable 
          style="width: 120px"
        >
          <el-option label="满减券" value="1" />
          <el-option label="折扣券" value="2" />
          <el-option label="无门槛券" value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select 
          v-model="queryParams.status" 
          placeholder="请选择状态" 
          clearable 
          style="width: 120px"
        >
          <el-option label="启用" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
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
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增优惠券</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="couponList" style="width: 100%">
      <el-table-column label="序号" type="index" width="80" />
      <el-table-column prop="name" label="优惠券名称" min-width="150" />
      <el-table-column prop="type" label="优惠券类型" width="100">
        <template #default="scope">
          {{ getTypeText(scope.row.type) }}
        </template>
      </el-table-column>
      <el-table-column prop="value" label="优惠金额/折扣" width="120">
        <template #default="scope">
          {{ scope.row.type === '2' ? scope.row.value + '折' : '¥' + scope.row.value }}
        </template>
      </el-table-column>
      <el-table-column prop="minAmount" label="使用条件" width="120">
        <template #default="scope">
          {{ scope.row.minAmount > 0 ? '满¥' + scope.row.minAmount : '无门槛' }}
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="180" />
      <el-table-column prop="endTime" label="结束时间" width="180" />
      <el-table-column prop="totalCount" label="总数量" width="100" />
      <el-table-column prop="usedCount" label="已使用" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
            {{ scope.row.status === '1' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)" plain>
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button type="success" size="small" @click="handleStatusChange(scope.row)" plain>
            <el-icon><Check /></el-icon>
            {{ scope.row.status === '1' ? '禁用' : '启用' }}
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
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="800px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="优惠券名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入优惠券名称" />
        </el-form-item>
        <el-form-item label="优惠券类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="1">满减券</el-radio>
            <el-radio label="2">折扣券</el-radio>
            <el-radio label="3">无门槛券</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="优惠金额" prop="value" v-if="form.type === '1' || form.type === '3'">
          <el-input-number v-model="form.value" :min="0.01" :step="0.01" style="width: 100%" placeholder="请输入优惠金额" />
        </el-form-item>
        <el-form-item label="折扣比例" prop="value" v-if="form.type === '2'">
          <el-input-number v-model="form.value" :min="0.1" :max="9.9" :step="0.1" style="width: 100%" placeholder="请输入折扣比例" />
          <div class="text-xs text-gray-400 mt-1">例如：8.5表示8.5折</div>
        </el-form-item>
        <el-form-item label="使用条件" prop="minAmount">
          <el-input-number v-model="form.minAmount" :min="0" style="width: 100%" placeholder="请输入最低消费金额，0表示无门槛" />
        </el-form-item>
        <el-form-item label="总数量" prop="totalCount">
          <el-input-number v-model="form.totalCount" :min="1" style="width: 100%" placeholder="请输入优惠券总数量" />
        </el-form-item>
        <el-form-item label="每人限领" prop="perLimit">
          <el-input-number v-model="form.perLimit" :min="1" style="width: 100%" placeholder="请输入每人限领数量" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择开始时间" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="form.endTime" type="datetime" placeholder="选择结束时间" style="width: 100%" />
        </el-form-item>
        <el-form-item label="使用范围" prop="useScope">
          <el-radio-group v-model="form.useScope">
            <el-radio label="1">全场通用</el-radio>
            <el-radio label="2">指定商品</el-radio>
            <el-radio label="3">指定分类</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="1">启用</el-radio>
            <el-radio label="0">禁用</el-radio>
          </el-radio-group>
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
import { Plus, Search, Refresh, Edit, Delete, Check } from '@element-plus/icons-vue'
import { getCouponList, createCoupon, updateCoupon, deleteCoupon, updateCouponStatus } from '@/api/mall/coupon'
import RightToolbar from '@/components/RightToolbar/index.vue'

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增优惠券')
const formRef = ref(null)
const showSearch = ref(true)

// 查询参数
const queryParams = reactive({
  name: '',
  type: '',
  status: ''
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
  type: '1',
  value: 0,
  minAmount: 0,
  totalCount: 100,
  perLimit: 1,
  startTime: '',
  endTime: '',
  useScope: '1',
  status: '1'
})

// 表单规则
const rules = reactive({
  name: [{ required: true, message: '请输入优惠券名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择优惠券类型', trigger: 'change' }],
  value: [{ required: true, message: '请输入优惠金额/折扣', trigger: 'blur' }],
  totalCount: [{ required: true, message: '请输入总数量', trigger: 'blur' }],
  perLimit: [{ required: true, message: '请输入每人限领数量', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
})

// 优惠券列表
const couponList = ref([])

// 模拟数据
const mockCouponList = [
  {
    id: 1,
    name: '满100减20优惠券',
    type: '1',
    value: 20,
    minAmount: 100,
    startTime: '2026-03-01 00:00:00',
    endTime: '2026-03-31 23:59:59',
    totalCount: 100,
    usedCount: 30,
    status: '1'
  },
  {
    id: 2,
    name: '全场8折优惠券',
    type: '2',
    value: 8,
    minAmount: 0,
    startTime: '2026-03-01 00:00:00',
    endTime: '2026-03-31 23:59:59',
    totalCount: 50,
    usedCount: 15,
    status: '1'
  },
  {
    id: 3,
    name: '无门槛10元优惠券',
    type: '3',
    value: 10,
    minAmount: 0,
    startTime: '2026-03-01 00:00:00',
    endTime: '2026-03-31 23:59:59',
    totalCount: 200,
    usedCount: 80,
    status: '0'
  }
]

// 初始化
onMounted(() => {
  getList()
})

// 获取优惠券列表
function getList() {
  loading.value = true
  const params = {
    conditions_: `sort:createTime:desc`,
    size: pagination.size,
    current: pagination.current
  }
  
  // 合并查询参数
  if (queryParams.name) {
    params.conditions_ += `,name:${queryParams.name}:like`
  }
  if (queryParams.type) {
    params.conditions_ += `,type:${queryParams.type}:eq`
  }
  if (queryParams.status) {
    params.conditions_ += `,status:${queryParams.status}:eq`
  }
  
  // 模拟API调用
  setTimeout(() => {
    couponList.value = mockCouponList
    pagination.total = mockCouponList.length
    loading.value = false
  }, 500)
}

// 新增优惠券
function handleAdd() {
  dialogTitle.value = '新增优惠券'
  form.id = ''
  form.name = ''
  form.type = '1'
  form.value = 0
  form.minAmount = 0
  form.totalCount = 100
  form.perLimit = 1
  form.startTime = ''
  form.endTime = ''
  form.useScope = '1'
  form.status = '1'
  dialogVisible.value = true
}

// 编辑优惠券
function handleEdit(row) {
  dialogTitle.value = '编辑优惠券'
  // 复制所有字段
  form.id = row.id
  form.name = row.name
  form.type = row.type
  form.value = row.value
  form.minAmount = row.minAmount
  form.totalCount = row.totalCount
  form.perLimit = row.perLimit
  form.startTime = row.startTime
  form.endTime = row.endTime
  form.useScope = row.useScope || '1'
  form.status = row.status
  dialogVisible.value = true
}

// 提交表单
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      const submitData = {
        name: form.name,
        type: form.type,
        value: form.value,
        minAmount: form.minAmount,
        totalCount: form.totalCount,
        perLimit: form.perLimit,
        startTime: form.startTime,
        endTime: form.endTime,
        useScope: form.useScope,
        status: form.status
      }
      
      if (form.id) {
        // 编辑
        submitData.id = form.id
        setTimeout(() => {
          ElMessage.success('编辑成功')
          dialogVisible.value = false
          getList()
          loading.value = false
        }, 500)
      } else {
        // 新增
        setTimeout(() => {
          ElMessage.success('新增成功')
          dialogVisible.value = false
          getList()
          loading.value = false
        }, 500)
      }
    }
  })
}

// 删除优惠券
function handleDelete(id) {
  ElMessageBox.confirm('确定要删除该优惠券吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    // 模拟删除
    setTimeout(() => {
      ElMessage.success('删除成功')
      getList()
      loading.value = false
    }, 500)
  })
}

// 状态变更
function handleStatusChange(row) {
  const newStatus = row.status === '1' ? '0' : '1'
  ElMessageBox.confirm(`确定要${newStatus === '1' ? '启用' : '禁用'}该优惠券吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    // 模拟状态更新
    setTimeout(() => {
      ElMessage.success('状态更新成功')
      getList()
      loading.value = false
    }, 500)
  })
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
    type: '',
    status: ''
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

// 获取优惠券类型文本
function getTypeText(type) {
  const typeMap = {
    '1': '满减券',
    '2': '折扣券',
    '3': '无门槛券'
  }
  return typeMap[type] || '未知'
}
</script>

<style scoped>
.app-container {
  padding: 24px;
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

.text-xs {
  font-size: 12px;
}

.text-gray-400 {
  color: #909399;
}

.mt-1 {
  margin-top: 4px;
}
</style>
