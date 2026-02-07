<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="入口名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入入口名称"
          clearable
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
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
      <el-table-column prop="name" label="入口名称" align="center" />
      <el-table-column prop="icon" label="图标" align="center">
        <template #default="scope">
          <ImagePreview :src="getFullImageUrl(scope.row.icon)" :width="40" :height="40" />
        </template>
      </el-table-column>
      <el-table-column prop="linkUrl" label="链接地址" align="center" />
      <el-table-column prop="sort" label="排序" align="center" />
      <el-table-column prop="status" label="状态" align="center">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="1"
            inactive-value="0"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" align="center" />
      <el-table-column prop="updateTime" label="更新时间" align="center" />
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

    <el-dialog :title="'新增金刚区入口'" v-model="createDialogVisible" width="500px" append-to-body>
      <el-form ref="createFormRef" :model="createForm" :rules="createFormRules" label-width="80px">
        <el-form-item label="入口名称" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入入口名称" />
        </el-form-item>
        <el-form-item label="链接地址" prop="linkUrl">
          <el-input v-model="createForm.linkUrl" placeholder="请输入链接地址" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="createForm.sort" :min="0" :max="999" placeholder="请输入排序" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="createForm.status" active-value="1" inactive-value="0" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <input type="file" ref="fileInputRef" @change="handleFileSelect" accept="image/*" />
          <div class="el-upload__tip">
            只能上传jpg/png文件，且不超过2MB
          </div>
          <div v-if="fileList.length > 0" class="file-list">
            <span>{{ fileList[0].name }}</span>
            <el-button type="danger" link @click="handleFileRemove">删除</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCreateConfirm">确 定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editDialogVisible" title="编辑金刚区入口" width="500px" append-to-body>
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
        <el-form-item label="入口名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入入口名称" />
        </el-form-item>
        <el-form-item label="链接地址" prop="linkUrl">
          <el-input v-model="editForm.linkUrl" placeholder="请输入链接地址" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="editForm.sort" :min="0" :max="999" placeholder="请输入排序" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="editForm.status" active-value="1" inactive-value="0" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <input type="file" ref="editFileInputRef" @change="handleEditFileSelect" accept="image/*" />
          <div class="el-upload__tip">
            只能上传jpg/png文件，且不超过2MB
          </div>
          <div v-if="editFileList.length > 0" class="file-list">
            <span>{{ editFileList[0].name }}</span>
            <el-button type="danger" link @click="handleEditFileRemove">删除</el-button>
          </div>
          <div v-else-if="editForm.icon" class="current-icon">
            <ImagePreview :src="getFullImageUrl(editForm.icon)" :width="60" :height="60" />
            <el-button type="text" @click="clearCurrentIcon">清除当前图标</el-button>
          </div>
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
import RightToolbar from '@/components/RightToolbar/index.vue'
import Pagination from '@/components/Pagination/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 模拟数据
const mockQuickEntries = [
  {
    id: 1,
    name: '商品分类',
    icon: 'category_icon',
    linkUrl: '/category',
    sort: 1,
    status: '1',
    createTime: '2026-02-01 10:00:00',
    updateTime: '2026-02-01 10:00:00'
  },
  {
    id: 2,
    name: '热门商品',
    icon: 'hot_icon',
    linkUrl: '/hot',
    sort: 2,
    status: '1',
    createTime: '2026-02-01 10:00:00',
    updateTime: '2026-02-01 10:00:00'
  },
  {
    id: 3,
    name: '优惠活动',
    icon: 'activity_icon',
    linkUrl: '/activity',
    sort: 3,
    status: '1',
    createTime: '2026-02-01 10:00:00',
    updateTime: '2026-02-01 10:00:00'
  },
  {
    id: 4,
    name: '个人中心',
    icon: 'user_icon',
    linkUrl: '/user',
    sort: 4,
    status: '0',
    createTime: '2026-02-01 10:00:00',
    updateTime: '2026-02-01 10:00:00'
  },
  {
    id: 5,
    name: '购物车',
    icon: 'cart_icon',
    linkUrl: '/cart',
    sort: 5,
    status: '1',
    createTime: '2026-02-01 10:00:00',
    updateTime: '2026-02-01 10:00:00'
  },
  {
    id: 6,
    name: '订单管理',
    icon: 'order_icon',
    linkUrl: '/order',
    sort: 6,
    status: '1',
    createTime: '2026-02-01 10:00:00',
    updateTime: '2026-02-01 10:00:00'
  },
  {
    id: 7,
    name: '客服中心',
    icon: 'service_icon',
    linkUrl: '/service',
    sort: 7,
    status: '0',
    createTime: '2026-02-01 10:00:00',
    updateTime: '2026-02-01 10:00:00'
  },
  {
    id: 8,
    name: '设置',
    icon: 'setting_icon',
    linkUrl: '/setting',
    sort: 8,
    status: '1',
    createTime: '2026-02-01 10:00:00',
    updateTime: '2026-02-01 10:00:00'
  }
]

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
  status: '',
  current: 1,
  size: 10
})

const createDialogVisible = ref(false)
const createForm = ref({ name: '', linkUrl: '', sort: 0, status: '1' })
const createFormRules = {
  name: [ { required: true, message: '请输入入口名称', trigger: 'blur' } ],
  linkUrl: [ { required: true, message: '请输入链接地址', trigger: 'blur' } ],
  sort: [ { required: true, message: '请输入排序', trigger: 'blur' } ]
}

// 文件上传相关
const fileInputRef = ref()
const fileList = ref([])

const editDialogVisible = ref(false)
const editForm = ref({ id: '', name: '', linkUrl: '', sort: 0, status: '1', icon: '' })
const editFormRules = {
  name: [ { required: true, message: '请输入入口名称', trigger: 'blur' } ],
  linkUrl: [ { required: true, message: '请输入链接地址', trigger: 'blur' } ],
  sort: [ { required: true, message: '请输入排序', trigger: 'blur' } ]
}

// 编辑文件上传相关
const editFileInputRef = ref()
const editFileList = ref([])

const filteredTableData = computed(() => tableData.value)

// 构造完整的图片URL
function getFullImageUrl(fileKey) {
  if (!fileKey) return ''
  
  // 模拟图片URL，使用占位符图片
  return `https://via.placeholder.com/40?text=${fileKey}`
}

function handleQuery() {
  queryParams.value.current = 1
  getList()
}
function resetQuery() {
  queryParams.value.name = ''
  queryParams.value.status = ''
  handleQuery()
}
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  selectedRows.value = selection
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// 文件上传处理函数
function handleFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return
  
  // 验证文件类型和大小
  const isImage = file.type.startsWith('image/')
  // 支持的图片格式扩展名
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  const fileExtension = file.name.split('.').pop().toLowerCase()
  const isAllowedExtension = allowedExtensions.includes(fileExtension)
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isImage && !isAllowedExtension) {
    ElMessage.error('只能上传图片文件(JPG, JPEG, PNG, GIF, BMP, WebP, SVG)!')
    return false
  }
  
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  
  // 保存文件到列表
  fileList.value = [file]
}

function handleFileRemove() {
  fileList.value = []
  // 清空文件输入框
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// 编辑文件上传处理函数
function handleEditFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return
  
  // 验证文件类型和大小
  const isImage = file.type.startsWith('image/')
  // 支持的图片格式扩展名
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  const fileExtension = file.name.split('.').pop().toLowerCase()
  const isAllowedExtension = allowedExtensions.includes(fileExtension)
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isImage && !isAllowedExtension) {
    ElMessage.error('只能上传图片文件(JPG, JPEG, PNG, GIF, BMP, WebP, SVG)!')
    return false
  }
  
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  
  // 保存文件到列表
  editFileList.value = [file]
}

function handleEditFileRemove() {
  editFileList.value = []
  // 清空文件输入框
  if (editFileInputRef.value) {
    editFileInputRef.value.value = ''
  }
}

function clearCurrentIcon() {
  editForm.value.icon = ''
}

function handleAdd() {
  createForm.value = { name: '', linkUrl: '', sort: 0, status: '1' }
  fileList.value = []
  // 清空文件输入框
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  createDialogVisible.value = true
}

// 模拟创建金刚区入口
function createQuickEntry(file, data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true } })
    }, 500)
  })
}

function handleCreateConfirm() {
  if (fileList.value.length === 0) {
    ElMessage.warning('请上传图标')
    return
  }
  
  // 使用模拟接口
  createQuickEntry(fileList.value[0], createForm.value).then(res => {
    ElMessage.success('创建成功')
    createDialogVisible.value = false
    getList()
  }).catch(() => {
    ElMessage.error('创建失败')
  })
}

// 模拟获取金刚区入口详情
function getQuickEntryDetail(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const entry = mockQuickEntries.find(item => item.id === id)
      resolve({ data: entry })
    }, 300)
  })
}

function handleUpdate(row) {
  let target = row
  if (!target) {
    if (selectedRows.value.length !== 1) {
      ElMessage.warning('请选择一个要编辑的金刚区入口')
      return
    }
    target = selectedRows.value[0]
  }
  getQuickEntryDetail(target.id).then(res => {
    editForm.value = { ...res.data }
    // 清空编辑文件列表
    editFileList.value = []
    // 清空文件输入框
    if (editFileInputRef.value) {
      editFileInputRef.value.value = ''
    }
    editDialogVisible.value = true
  })
}

// 模拟更新金刚区入口
function updateQuickEntry(id, file, data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true } })
    }, 500)
  })
}

function handleEditConfirm() {
  // 检查editForm.value.id是否存在
  if (!editForm.value.id) {
    ElMessage.error('金刚区入口ID不存在')
    return
  }
  
  // 使用模拟接口
  const file = editFileList.value.length > 0 ? editFileList.value[0] : null
  updateQuickEntry(editForm.value.id, file, editForm.value).then(() => {
    ElMessage.success('修改成功')
    editDialogVisible.value = false
    getList()
  }).catch(() => ElMessage.error('修改失败'))
}

// 模拟删除金刚区入口
function deleteQuickEntry(ids) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true } })
    }, 500)
  })
}

function handleDelete(row) {
  let targets = []
  if (row && row.id) {
    targets = [row.id]
  } else {
    if (!ids.value.length) {
      ElMessage.warning('请选择要删除的金刚区入口')
      return
    }
    targets = ids.value
  }
  ElMessageBox.confirm(
    `确认要删除选中的金刚区入口吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    deleteQuickEntry(targets).then(() => {
      ElMessage.success('删除成功')
      getList()
    }).catch(() => {})
  }).catch(() => {})
}

// 模拟更新金刚区入口状态
function updateQuickEntryStatus(id, status) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true } })
    }, 300)
  })
}

function handleStatusChange(row) {
  updateQuickEntryStatus(row.id, row.status).then(() => {
    ElMessage.success('状态更新成功')
  }).catch(() => {
    ElMessage.error('状态更新失败')
    // 恢复原状态
    row.status = row.status === '1' ? '0' : '1'
  })
}

// 模拟获取金刚区入口列表
function queryQuickEntryList(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...mockQuickEntries]
      
      // 模拟搜索
      if (params.conditions_) {
        const conditions = params.conditions_.split(';')
        conditions.forEach(condition => {
          const [key, operator, value] = condition.split(':')
          if (key === 'name' && operator === 'like') {
            filteredData = filteredData.filter(item => item.name.includes(value))
          }
          if (key === 'status' && operator === 'eq') {
            filteredData = filteredData.filter(item => item.status === value)
          }
        })
      }
      
      // 模拟排序
      filteredData.sort((a, b) => a.sort - b.sort)
      
      // 模拟分页
      const total = filteredData.length
      const page = params.current || 1
      const size = params.size || 10
      const start = (page - 1) * size
      const end = start + size
      const records = filteredData.slice(start, end)
      
      resolve({ data: { records, total } })
    }, 500)
  })
}

function getList() {
  loading.value = true
  let conditions = []
  // 使用name字段进行搜索
  if (queryParams.value.name) {
    conditions.push(`name:like:${queryParams.value.name}`)
  }
  // 使用status字段进行搜索
  if (queryParams.value.status) {
    conditions.push(`status:eq:${queryParams.value.status}`)
  }
  // 添加按sort升序排序
  conditions.push('sort:sort:asc')
  
  const params = {
    size: queryParams.value.size,
    current: queryParams.value.current
  }
  
  if (conditions.length) {
    params['conditions_'] = conditions.join(';') // 使用分号分隔
  }
  
  // 使用模拟接口
  queryQuickEntryList(params).then(res => {
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

.file-list {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.current-icon {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>