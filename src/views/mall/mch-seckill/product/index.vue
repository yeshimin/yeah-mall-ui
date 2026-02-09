<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="queryParams" class="mb-4">
      <el-form-item label="商品名称" prop="productName">
        <el-input
          v-model="queryParams.productName"
          placeholder="请输入商品名称"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="商品状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择商品状态"
          clearable
          style="width: 200px"
        >
          <el-option label="未上架" value="0" />
          <el-option label="已上架" value="1" />
          <el-option label="已下架" value="2" />
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
          新增商品
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 商品列表 -->
    <el-table
      v-loading="loading"
      :data="productList"
      style="width: 100%"
    >
      <el-table-column type="index" label="序号" width="80" />
      <el-table-column prop="productName" label="商品名称" min-width="200" />
      <el-table-column prop="productSn" label="商品编号" min-width="150" />
      <el-table-column prop="price" label="秒杀价格" width="100">
        <template #default="scope">
          ¥{{ scope.row.price.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="originalPrice" label="原价" width="100">
        <template #default="scope">
          ¥{{ scope.row.originalPrice.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="100" />
      <el-table-column prop="sales" label="销量" width="100" />
      <el-table-column prop="status" label="商品状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : scope.row.status === 0 ? 'warning' : 'info'">
            {{ scope.row.status === 1 ? '已上架' : scope.row.status === 0 ? '未上架' : '已下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            icon="Edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['mall:seckill:product:edit']"
          >
            编辑
          </el-button>
          <el-button
            size="small"
            type="danger"
            icon="Delete"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['mall:seckill:product:delete']"
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
        <el-form-item label="商品名称" prop="productName">
          <el-input
            v-model="form.productName"
            placeholder="请输入商品名称"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="商品编号" prop="productSn">
          <el-input
            v-model="form.productSn"
            placeholder="请输入商品编号"
            maxlength="30"
          />
        </el-form-item>
        <el-form-item label="秒杀价格" prop="price">
          <el-input-number
            v-model="form.price"
            :min="0"
            :step="0.01"
            :precision="2"
            placeholder="请输入秒杀价格"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="原价" prop="originalPrice">
          <el-input-number
            v-model="form.originalPrice"
            :min="0"
            :step="0.01"
            :precision="2"
            placeholder="请输入原价"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number
            v-model="form.stock"
            :min="0"
            :step="1"
            placeholder="请输入库存"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="商品状态" prop="status">
          <el-select
            v-model="form.status"
            placeholder="请选择商品状态"
            style="width: 100%"
          >
            <el-option label="未上架" value="0" />
            <el-option label="已上架" value="1" />
            <el-option label="已下架" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入商品描述"
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
const productList = ref([])
const total = ref(0)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  productName: '',
  status: ''
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

// 表单数据
const form = reactive({
  id: '',
  productName: '',
  productSn: '',
  price: 0,
  originalPrice: 0,
  stock: 0,
  sales: 0,
  status: 0,
  description: ''
})

// 表单验证规则
const rules = reactive({
  productName: [
    { required: true, message: '请输入商品名称', trigger: 'blur' }
  ],
  productSn: [
    { required: true, message: '请输入商品编号', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入秒杀价格', trigger: 'blur' }
  ],
  originalPrice: [
    { required: true, message: '请输入原价', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择商品状态', trigger: 'blur' }
  ]
})

// 模拟数据
const mockProductList = [
  {
    id: 1,
    productName: 'iPhone 15 Pro',
    productSn: 'IP15PRO2026',
    price: 6999,
    originalPrice: 7999,
    stock: 100,
    sales: 50,
    status: 1,
    description: '苹果最新旗舰手机，搭载A17 Pro芯片'
  },
  {
    id: 2,
    productName: 'MacBook Air M3',
    productSn: 'MBAIRM32026',
    price: 7999,
    originalPrice: 8999,
    stock: 50,
    sales: 20,
    status: 1,
    description: '轻薄笔记本电脑，搭载M3芯片'
  },
  {
    id: 3,
    productName: 'AirPods Pro 2',
    productSn: 'APP22026',
    price: 1299,
    originalPrice: 1899,
    stock: 200,
    sales: 100,
    status: 1,
    description: '主动降噪耳机，支持空间音频'
  },
  {
    id: 4,
    productName: 'iPad Pro 12.9',
    productSn: 'IPPRO1292026',
    price: 8999,
    originalPrice: 9999,
    stock: 30,
    sales: 10,
    status: 0,
    description: '高端平板电脑，搭载M2芯片'
  }
]

// 加载商品列表
const getProductList = () => {
  loading.value = true
  // 模拟API请求
  setTimeout(() => {
    productList.value = mockProductList
    total.value = mockProductList.length
    loading.value = false
  }, 500)
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  getProductList()
}

// 重置
const resetQuery = () => {
  Object.assign(queryParams, {
    productName: '',
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
  dialogTitle.value = '新增商品'
  Object.assign(form, {
    id: '',
    productName: '',
    productSn: '',
    price: 0,
    originalPrice: 0,
    stock: 0,
    sales: 0,
    status: 0,
    description: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑商品'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = (id) => {
  ElMessage.success('删除成功')
  getProductList()
}

// 提交
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('操作成功')
      dialogVisible.value = false
      getProductList()
    }
  })
}

// 初始化
onMounted(() => {
  getProductList()
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