<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" @submit.prevent>
      <el-form-item label="SKU编码" prop="skuCode">
        <el-input v-model="queryParams.skuCode" placeholder="请输入SKU编码" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="tableData" @selection-change="handleSelectionChange" row-key="id">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="id" label="ID" align="center" />
      <el-table-column prop="name" label="商品名称" align="center" />
      <el-table-column prop="specCode" label="规格编码" align="center" />
      <el-table-column prop="price" label="销售价格" align="center" />
      <el-table-column prop="stock" label="库存数量" align="center" />
      <el-table-column label="操作" width="200" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.current" v-model:limit="queryParams.size" @pagination="getList" />

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="handleClose">
      <el-form :model="skuForm" :rules="formRules" label-width="90px">
        <el-form-item label="商品ID" prop="spuId">
          <el-input v-model="skuForm.spuId" disabled />
        </el-form-item>
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="skuForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="规格编码" prop="specCode">
          <el-input v-model="skuForm.specCode" placeholder="请输入规格编码" />
        </el-form-item>
        <el-form-item label="销售价格" prop="price">
          <el-input v-model="skuForm.price" type="number" placeholder="请输入销售价格" />
        </el-form-item>
        <el-form-item label="库存数量" prop="stock">
          <el-input v-model="skuForm.stock" type="number" placeholder="请输入库存数量" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import RightToolbar from '@/components/RightToolbar/index.vue'
import Pagination from '@/components/Pagination/index.vue'
import { getSkuList, saveSku, deleteSku } from '@/api/mall/sku'

const route = useRoute()
const router = useRouter()
const tableData = ref([])
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const queryParams = ref({
  current: 1,
  size: 10,
  skuCode: '',
  spuId: ''
})
const dialogVisible = ref(false)
const dialogTitle = ref('')
const skuForm = ref({
  id: '',
  spuId: '',
  name: '',
  specCode: '',
  price: 0,
  stock: 0
})
const formRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  specCode: [{ required: true, message: '请输入规格编码', trigger: 'blur' }],
  price: [{ required: true, message: '请输入销售价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存数量', trigger: 'blur' }]
}
const ids = ref([])
const selectedRows = ref([])
const queryRef = ref(null)

onMounted(() => {
  const spuId = route.query.spuId
  if (spuId) {
    queryParams.value.spuId = spuId
    skuForm.value.spuId = spuId
    getList()
  }
})

const getList = () => {
  loading.value = true
  getSkuList({ ...queryParams.value, shopId: getShopId() }).then(res => {
    tableData.value = res.data.records
    total.value = res.data.total
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

const handleQuery = () => {
  queryParams.value.current = 1
  getList()
}

const resetQuery = () => {
  queryRef.value.resetFields()
  handleQuery()
}

const handleAdd = () => {
  dialogTitle.value = '新增SKU'
  skuForm.value = { id: '', spuId: queryParams.value.spuId, name: '', specCode: '', price: 0, stock: 0 }
  dialogVisible.value = true
}

const handleUpdate = (row) => {
  dialogTitle.value = '编辑SKU'
  skuForm.value = { ...row }
  dialogVisible.value = true
}

const handleSubmit = () => {
  saveSku({ ...skuForm.value, shopId: getShopId() }).then(() => {
    ElMessage.success('保存成功')
    dialogVisible.value = false
    getList()
  }).catch(() => {
    ElMessage.error('保存失败')
  })
}

const handleClose = () => {
  dialogVisible.value = false
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
  ids.value = selection.map(item => item.id)
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该SKU吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteSku({ id: row.id, shopId: getShopId() }).then(() => {
      ElMessage.success('删除成功')
      getList()
    }).catch(() => {
      ElMessage.error('删除失败')
    })
  })
}

// Replace any watch(fn) with watchEffect if present
// Example fix if there was a watch like:
// watch(() => queryParams.value, handleQuery)
// Changed to:
watchEffect(() => {
  if (queryParams.value.spuId) {
    getList()
  }
})

function getShopId() {
  return localStorage.getItem('shopId') || ''
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}
</style>