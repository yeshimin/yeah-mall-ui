<template>
  <div class="seckill-manage">
    <!-- 查询条件 -->
    <el-form :inline="true" :model="queryParams" class="mb8">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="queryParams.name" placeholder="请输入商品名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="商品状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择商品状态" clearable style="width: 120px">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动名称" prop="activityId">
          <el-select v-model="queryParams.activityId" placeholder="请选择活动" clearable style="width: 180px">
            <el-option v-for="activity in activityList" :key="activity.id" :label="activity.name" :value="activity.id" />
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
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增商品
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 商品列表 -->
      <el-table v-loading="loading" :data="productList" style="width: 100%">
        <el-table-column label="序号" type="index" width="80" />
        <el-table-column prop="name" label="商品名称" width="200" />
        <el-table-column prop="activityName" label="所属活动" width="180" />
        <el-table-column prop="originalPrice" label="原价" width="100">
          <template #default="scope">
            ¥{{ scope.row.originalPrice.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="seckillPrice" label="秒杀价" width="100">
          <template #default="scope">
            ¥{{ scope.row.seckillPrice.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column prop="soldCount" label="已售" width="80" />
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
        <el-table-column prop="description" label="商品描述" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)" plain>
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row.id)" plain>
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
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
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="所属活动" prop="activityId">
          <el-select v-model="form.activityId" placeholder="请选择活动" style="width: 100%">
            <el-option v-for="activity in activityList" :key="activity.id" :label="activity.name" :value="activity.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="原价" prop="originalPrice">
          <el-input-number v-model="form.originalPrice" :min="0" :step="0.01" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="秒杀价" prop="seckillPrice">
          <el-input-number v-model="form.seckillPrice" :min="0" :step="0.01" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" :step="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="商品状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入商品描述" rows="3" />
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
import { Plus, Search, Refresh, Edit, Delete } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增商品')
const formRef = ref(null)

// 查询参数
const queryParams = reactive({
  name: '',
  status: '',
  activityId: ''
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
  activityId: '',
  originalPrice: 0,
  seckillPrice: 0,
  stock: 0,
  soldCount: 0,
  status: 1,
  description: ''
})

// 表单规则
const rules = reactive({
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  activityId: [{ required: true, message: '请选择所属活动', trigger: 'change' }],
  originalPrice: [{ required: true, message: '请输入原价', trigger: 'blur' }],
  seckillPrice: [{ required: true, message: '请输入秒杀价', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
})

// 活动列表
const activityList = ref([
  { id: 1, name: '春节秒杀活动' },
  { id: 2, name: '情人节秒杀' },
  { id: 3, name: '元宵节秒杀' }
])

// 商品列表
const productList = ref([])

// 模拟数据
const mockProductList = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    activityId: 1,
    activityName: '春节秒杀活动',
    originalPrice: 9999,
    seckillPrice: 7999,
    stock: 100,
    soldCount: 32,
    status: 1,
    description: '全新iPhone 15 Pro，搭载A17 Pro芯片'
  },
  {
    id: 2,
    name: 'MacBook Air M3',
    activityId: 1,
    activityName: '春节秒杀活动',
    originalPrice: 8999,
    seckillPrice: 7499,
    stock: 50,
    soldCount: 15,
    status: 1,
    description: '轻薄便携，性能强劲'
  },
  {
    id: 3,
    name: 'AirPods Pro 2',
    activityId: 2,
    activityName: '情人节秒杀',
    originalPrice: 1899,
    seckillPrice: 1299,
    stock: 200,
    soldCount: 88,
    status: 1,
    description: '主动降噪，通透模式'
  },
  {
    id: 4,
    name: 'Apple Watch Series 9',
    activityId: 2,
    activityName: '情人节秒杀',
    originalPrice: 2999,
    seckillPrice: 2499,
    stock: 80,
    soldCount: 25,
    status: 0,
    description: '健康监测，运动追踪'
  }
]

// 初始化
onMounted(() => {
  getList()
})

// 获取商品列表
function getList() {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    productList.value = mockProductList
    pagination.total = mockProductList.length
    loading.value = false
  }, 500)
}

// 新增商品
function handleAdd() {
  dialogTitle.value = '新增商品'
  form.id = ''
  form.name = ''
  form.activityId = ''
  form.originalPrice = 0
  form.seckillPrice = 0
  form.stock = 0
  form.soldCount = 0
  form.status = 1
  form.description = ''
  dialogVisible.value = true
}

// 编辑商品
function handleEdit(row) {
  dialogTitle.value = '编辑商品'
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
          const index = mockProductList.findIndex(item => item.id === form.id)
          if (index !== -1) {
            mockProductList[index] = {
              ...form,
              activityName: activityList.value.find(a => a.id === form.activityId)?.name || ''
            }
          }
          ElMessage.success('编辑成功')
        } else {
          // 新增
          const newProduct = {
            ...form,
            id: mockProductList.length + 1,
            soldCount: 0,
            activityName: activityList.value.find(a => a.id === form.activityId)?.name || ''
          }
          mockProductList.unshift(newProduct)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        getList()
        loading.value = false
      }, 500)
    }
  })
}

// 删除商品
function handleDelete(id) {
  ElMessageBox.confirm('确定要删除该商品吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    // 模拟API调用
    setTimeout(() => {
      const index = mockProductList.findIndex(item => item.id === id)
      if (index !== -1) {
        mockProductList.splice(index, 1)
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
    const index = mockProductList.findIndex(item => item.id === row.id)
    if (index !== -1) {
      mockProductList[index].status = row.status
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
    activityId: ''
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