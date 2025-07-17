<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" @submit.prevent>
      <el-form-item label="Banner标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入Banner标题"
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
      <el-table-column prop="title" label="Banner标题" align="center" />
      <el-table-column prop="image" label="图片" align="center">
        <template #default="scope">
          <img :src="scope.row.image" alt="banner" style="height:40px;" />
        </template>
      </el-table-column>
      <el-table-column prop="link" label="跳转链接" align="center" />
      <el-table-column prop="status" label="状态" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === '1' ? 'success' : 'info'">
            {{ scope.row.status === '1' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" align="center" />
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

    <el-dialog v-model="createDialogVisible" title="创建Banner" width="400px" @close="createDialogVisible = false">
      <el-form :model="createForm" :rules="createFormRules" label-width="90px">
        <el-form-item label="Banner标题" prop="title">
          <el-input v-model="createForm.title" placeholder="请输入Banner标题" />
        </el-form-item>
        <el-form-item label="图片" prop="image">
          <el-input v-model="createForm.image" placeholder="请输入图片链接" />
        </el-form-item>
        <el-form-item label="跳转链接" prop="link">
          <el-input v-model="createForm.link" placeholder="请输入跳转链接" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="createForm.status" placeholder="请选择状态">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCreateConfirm">确 定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editDialogVisible" title="编辑Banner" width="400px" @close="editDialogVisible = false">
      <el-form :model="editForm" :rules="editFormRules" label-width="90px">
        <el-form-item label="Banner标题" prop="title">
          <el-input v-model="editForm.title" placeholder="请输入Banner标题" />
        </el-form-item>
        <el-form-item label="图片" prop="image">
          <el-input v-model="editForm.image" placeholder="请输入图片链接" />
        </el-form-item>
        <el-form-item label="跳转链接" prop="link">
          <el-input v-model="editForm.link" placeholder="请输入跳转链接" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择状态">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
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
import { listBanner, createBanner, getBannerDetail, updateBanner, deleteBanner } from '@/api/mall/banner'
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
  title: '',
  current: 1,
  size: 10
})

const createDialogVisible = ref(false)
const createForm = ref({ title: '', image: '', link: '', status: '1' })
const createFormRules = {
  title: [ { required: true, message: '请输入Banner标题', trigger: 'blur' } ],
  image: [ { required: true, message: '请输入图片链接', trigger: 'blur' } ],
  link: [ { required: true, message: '请输入跳转链接', trigger: 'blur' } ],
  status: [ { required: true, message: '请选择状态', trigger: 'change' } ]
}

const editDialogVisible = ref(false)
const editForm = ref({ id: '', title: '', image: '', link: '', status: '1' })
const editFormRules = {
  title: [ { required: true, message: '请输入Banner标题', trigger: 'blur' } ],
  image: [ { required: true, message: '请输入图片链接', trigger: 'blur' } ],
  link: [ { required: true, message: '请输入跳转链接', trigger: 'blur' } ],
  status: [ { required: true, message: '请选择状态', trigger: 'change' } ]
}

const filteredTableData = computed(() => tableData.value)

function handleQuery() {
  queryParams.value.current = 1
  getList()
}
function resetQuery() {
  queryParams.value.title = ''
  handleQuery()
}
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  selectedRows.value = selection
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
function handleAdd() {
  createForm.value = { title: '', image: '', link: '', status: '1' }
  createDialogVisible.value = true
}
function handleCreateConfirm() {
  if (!createForm.value.title || !createForm.value.image || !createForm.value.link) {
    ElMessage.warning('请填写完整信息')
    return
  }
  createBanner(createForm.value).then(res => {
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
      ElMessage.warning('请选择一个要编辑的Banner')
      return
    }
    target = selectedRows.value[0]
  }
  getBannerDetail(target.id).then(res => {
    editForm.value = { ...res.data }
    editDialogVisible.value = true
  })
}
function handleEditConfirm() {
  if (!editForm.value.title || !editForm.value.image || !editForm.value.link) {
    ElMessage.warning('请填写完整信息')
    return
  }
  updateBanner(editForm.value).then(() => {
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
      ElMessage.warning('请选择要删除的Banner')
      return
    }
    targets = ids.value
  }
  ElMessageBox.confirm(
    `确认要删除选中的Banner吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    deleteBanner(targets).then(() => {
      ElMessage.success('删除成功')
      getList()
    }).catch(() => {})
  }).catch(() => {})
}
function getList() {
  loading.value = true
  let conditions = []
  if (queryParams.value.title) {
    conditions.push(`title:like:${queryParams.value.title}`)
  }
  const params = {
    size: queryParams.value.size,
    current: queryParams.value.current
  }
  if (conditions.length) {
    params['conditions_'] = conditions.join(',')
  }
  listBanner(params).then(res => {
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
