<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" @submit.prevent>
      <el-form-item label="SPU名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入SPU名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属分类" prop="category">
        <el-input
          v-model="queryParams.category"
          placeholder="请输入所属分类"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
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
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="filteredTableData" @selection-change="handleSelectionChange" row-key="id">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="id" label="ID" align="center" />
      <el-table-column prop="name" label="SPU名称" align="center" />
      <el-table-column prop="category" label="所属分类" align="center" />
      <el-table-column prop="price" label="价格" align="center" />
      <el-table-column prop="createTime" label="创建时间" align="center" />
      <el-table-column prop="status" label="状态" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === '1' ? 'success' : 'info'">
            {{ scope.row.status === '1' ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getList"
    />

    <el-dialog v-model="createDialogVisible" title="创建SPU" width="400px" @close="createDialogVisible = false">
      <el-form :model="createForm" :rules="createFormRules" label-width="90px">
        <el-form-item label="SPU名称" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入SPU名称" />
        </el-form-item>
        <el-form-item label="所属分类" prop="category">
          <el-input v-model="createForm.category" placeholder="请输入所属分类" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model="createForm.price" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="createForm.status" placeholder="请选择状态">
            <el-option label="上架" value="1" />
            <el-option label="下架" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCreateConfirm">确 定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editDialogVisible" title="编辑SPU" width="400px" @close="editDialogVisible = false">
      <el-form :model="editForm" :rules="editFormRules" label-width="90px">
        <el-form-item label="SPU名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入SPU名称" />
        </el-form-item>
        <el-form-item label="所属分类" prop="category">
          <el-input v-model="editForm.category" placeholder="请输入所属分类" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model="editForm.price" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择状态">
            <el-option label="上架" value="1" />
            <el-option label="下架" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleEditConfirm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { listSpu, createSpu, getSpuDetail, updateSpu, deleteSpu } from '@/api/mall/spu'
import RightToolbar from '@/components/RightToolbar/index.vue'
import Pagination from '@/components/Pagination/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])
const loading = ref(false)
const showSearch = ref(true)
const ids = ref([])
const selectedRows = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const queryParams = ref({
  name: '',
  category: '',
  current: 1,
  size: 10
})

const createDialogVisible = ref(false)
const createForm = ref({ name: '', category: '', price: '', status: '1' })
const createFormRules = {
  name: [ { required: true, message: '请输入SPU名称', trigger: 'blur' } ],
  category: [ { required: true, message: '请输入所属分类', trigger: 'blur' } ],
  price: [ { required: true, message: '请输入价格', trigger: 'blur' } ],
  status: [ { required: true, message: '请选择状态', trigger: 'change' } ]
}

const editDialogVisible = ref(false)
const editForm = ref({ id: '', name: '', category: '', price: '', status: '1' })
const editFormRules = {
  name: [ { required: true, message: '请输入SPU名称', trigger: 'blur' } ],
  category: [ { required: true, message: '请输入所属分类', trigger: 'blur' } ],
  price: [ { required: true, message: '请输入价格', trigger: 'blur' } ],
  status: [ { required: true, message: '请选择状态', trigger: 'change' } ]
}

const filteredTableData = computed(() => tableData.value)

function handleQuery() {
  queryParams.value.current = 1
  getList()
}
function resetQuery() {
  queryParams.value.name = ''
  queryParams.value.category = ''
  handleQuery()
}
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  selectedRows.value = selection
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
function handleAdd() {
  createForm.value = { name: '', category: '', price: '', status: '1' }
  createDialogVisible.value = true
}
function handleCreateConfirm() {
  if (!createForm.value.name || !createForm.value.category || !createForm.value.price) {
    ElMessage.warning('请填写完整信息')
    return
  }
  createSpu(createForm.value).then(res => {
    ElMessage.success('创建成功')
    createDialogVisible.value = false
    getList()
  }).catch(() => {
    ElMessage.error('创建失败')
  })
}
function handleUpdate(row) {
  let target = row
  if (!target) {
    if (selectedRows.value.length !== 1) {
      ElMessage.warning('请选择一个要编辑的SPU')
      return
    }
    target = selectedRows.value[0]
  }
  getSpuDetail(target.id).then(res => {
    editForm.value = { ...res.data }
    editDialogVisible.value = true
  })
}
function handleEditConfirm() {
  if (!editForm.value.name || !editForm.value.category || !editForm.value.price) {
    ElMessage.warning('请填写完整信息')
    return
  }
  updateSpu(editForm.value).then(() => {
    ElMessage.success('修改成功')
    editDialogVisible.value = false
    getList()
  }).catch(() => ElMessage.error('修改失败'))
}
function handleDelete(row) {
  let targets = []
  if (row && row.id) {
    targets = [row.id]
  } else {
    if (!ids.value.length) {
      ElMessage.warning('请选择要删除的SPU')
      return
    }
    targets = ids.value
  }
  ElMessageBox.confirm(
    `确认要删除选中的SPU吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    deleteSpu(targets).then(() => {
      ElMessage.success('删除成功')
      getList()
    }).catch(() => {})
  }).catch(() => {})
}
function getList() {
  loading.value = true
  let conditions = []
  if (queryParams.value.name) {
    conditions.push(`name:like:${queryParams.value.name}`)
  }
  if (queryParams.value.category) {
    conditions.push(`category:like:${queryParams.value.category}`)
  }
  const params = {
    size: queryParams.value.size,
    current: queryParams.value.current
  }
  if (conditions.length) {
    params['conditions_'] = conditions.join(',')
  }
  listSpu(params).then(res => {
    tableData.value = res.data?.records || []
    total.value = res.data?.total || 0
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}
onMounted(() => {
  getList()
})
</script>

<style scoped>
.app-container {
  padding: 24px;
}
.mb8 {
  margin-bottom: 8px;
}
</style>
