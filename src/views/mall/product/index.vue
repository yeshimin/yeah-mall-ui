// 迁移自 spu/index.vue，风格与 banner/specDef 保持一致
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" @submit.prevent>
      <el-form-item label="商品名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入商品名称" clearable style="width: 200px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="所属分类" prop="categoryId">
        <el-tree-select v-model="queryParams.categoryId" :data="categoryTree"
          :props="{ label: 'name', value: 'id', children: 'children' }" placeholder="请选择商品分类" check-strictly
          :render-after-expand="false" style="width: 200px" />
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
      <el-table-column prop="name" label="商品名称" align="center" />
      <el-table-column prop="categoryName" label="分类名称" align="center" />
      <el-table-column prop="createBy" label="创建人" align="center" />
      <el-table-column prop="createTime" label="创建时间" align="center" />
      <el-table-column prop="updateBy" label="更新人" align="center" />
      <el-table-column prop="updateTime" label="更新时间" align="center" />
      <el-table-column label="操作" width="180" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.current" v-model:limit="queryParams.size"
      @pagination="getList" />

    <el-dialog v-model="createDialogVisible" title="创建商品" width="600px" @close="createDialogVisible = false">
      <el-form :model="createForm" :rules="createFormRules" label-width="90px">
        <el-form-item label="商品分类" prop="categoryId">
          <el-tree-select v-model="createForm.categoryId" :data="categoryTree"
            :props="{ label: 'name', value: 'id', children: 'children' }" placeholder="请选择商品分类" check-strictly
            :render-after-expand="false" style="width: 100%" />
        </el-form-item>
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="规格">
          <div class="spec-container">
            <div style="margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 8px;">
              <el-tag v-for="spec in specList" :key="spec.id"
                :class="activeSpecId === spec.id ? 'active-spec-tag' : 'default-spec-tag'"
                style="cursor: pointer; user-select: none; display: inline-flex; align-items: center; justify-content: center; padding: 6px 12px !important; margin: 0 8px 8px 0 !important; border-radius: 6px; transition: all 0.2s ease; font-weight: 400; font-size: 14px; line-height: normal; height: auto; transform: none; vertical-align: middle; overflow: visible; position: relative; top: 0;"
                @click="() => handleSpecTagClickOnly(spec.id)">
                {{ spec.specName }}
              </el-tag>
            </div>
            <el-divider style="margin: 10px 0 20px 0;" />
            <div v-if="activeSpecId">
              <el-check-tag v-for="opt in specOptMap[activeSpecId] || []" :key="opt.id"
                :checked="isOptSelected(activeSpecId, opt.id)" @change="checked => toggleOpt(activeSpecId, opt.id)"
                style="margin: 0 8px 8px 0; padding: 6px 12px; border-radius: 6px; font-size: 14px; transition: all 0.2s ease;">
                {{ opt.optName }}
              </el-check-tag>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCreateConfirm">确 定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editDialogVisible" title="编辑商品" width="600px" @close="editDialogVisible = false">
      <el-form :model="editForm" :rules="editFormRules" label-width="90px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="所属分类" prop="categoryId">
          <el-tree-select v-model="editForm.categoryId" :data="categoryTree"
            :props="{ label: 'name', value: 'id', children: 'children' }" placeholder="请选择商品分类" check-strictly
            :render-after-expand="false" style="width: 100%" />
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
import { listSpu, createSpu, updateSpu, deleteSpu } from '@/api/mall/spu'
import { getCategoryTree } from '@/api/mall/category'
import { listSpecDef, listSpecOptDef } from '@/api/mall/specDef'
import RightToolbar from '@/components/RightToolbar/index.vue'
import Pagination from '@/components/Pagination/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close, CircleCheck } from '@element-plus/icons-vue'

const tableData = ref([])
const loading = ref(false)
const showSearch = ref(true)
const ids = ref([])
const selectedRows = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0
)
const queryParams = ref({
  name: '',
  categoryId: '',
  current: 1,
  size: 10
})

const createDialogVisible = ref(false)
const createForm = ref({ name: '', categoryId: '', specs: [] })
const createFormRules = {
  name: [ { required: true, message: '请输入商品名称', trigger: 'blur' } ],
  categoryId: [ { required: true, message: '请输入所属分类', trigger: 'blur' } ]
}

const editDialogVisible = ref(false)
const editForm = ref({ id: '', name: '', categoryId: '' })
const editFormRules = {
  name: [ { required: true, message: '请输入商品名称', trigger: 'blur' } ],
  categoryId: [ { required: true, message: '请选择所属分类', trigger: 'blur' } ]
}

const categoryTree = ref([])
const specList = ref([])
const specOptMap = ref({}) // {specId: [选项列表]}
const activeSpecId = ref(null)
const selectedSpecs = ref([]) // [{specId, optIds: []}]

const filteredTableData = computed(() => tableData.value)

fetchCategoryTree()

// 获取分类树
async function fetchCategoryTree() {
  const res = await getCategoryTree({ shopId: getShopId() })
  categoryTree.value = res.data || []
}
// 获取所有规格及选项
async function fetchSpecs() {
  const res = await listSpecDef({ shopId: getShopId() })
  specList.value = res.data?.records || []
  // 获取每个规格的选项
  for (const spec of specList.value) {
    const optRes = await listSpecOptDef({ shopId: getShopId(), specId: spec.id })
    specOptMap.value[spec.id] = optRes.data || []
  }
  if (specList.value.length) activeSpecId.value = specList.value[0].id
}

// 规格选项选择逻辑
function toggleOpt(specId, optId) {
  let spec = selectedSpecs.value.find(s => s.specId === specId)
  if (!spec) {
    spec = { specId, optIds: [] }
    selectedSpecs.value.push(spec)
  }
  const idx = spec.optIds.indexOf(optId)
  if (idx > -1) {
    spec.optIds.splice(idx, 1)
  } else {
    spec.optIds.push(optId)
  }
}
function isOptSelected(specId, optId) {
  const spec = selectedSpecs.value.find(s => s.specId === specId)
  return spec && spec.optIds.includes(optId)
}
function handleSpecTagClickOnly(specId) {
  activeSpecId.value = specId;
}
// 删除规格全选相关函数
// function isSpecAllSelected(specId) {
//   const opts = specOptMap.value[specId] || []
//   const spec = selectedSpecs.value.find(s => s.specId === specId)
//   return spec && spec.optIds.length === opts.length
// }
// function handleSpecAllSelect(specId, checked) {
//   const opts = specOptMap.value[specId] || []
//   let spec = selectedSpecs.value.find(s => s.specId === specId)
//   if (!spec) {
//     spec = { specId, optIds: [] }
//     selectedSpecs.value.push(spec)
//   }
//   if (checked) {
//     spec.optIds = opts.map(opt => opt.id)
//   } else {
//     spec.optIds = []
//   }
// }
function handleSpecClear(specId) {
  const spec = selectedSpecs.value.find(s => s.specId === specId)
  if (spec) spec.optIds = []
}

function handleQuery() {
  queryParams.value.current = 1
  getList()
}
function resetQuery() {
  queryParams.value.name = ''
  queryParams.value.categoryId = ''
  handleQuery()
}
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  selectedRows.value = selection
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
function handleAdd() {
  createForm.value = { name: '', categoryId: '', specs: [] }
  selectedSpecs.value = []
  fetchSpecs()
  createDialogVisible.value = true
}
function handleCreateConfirm() {
  if (!createForm.value.name || !createForm.value.categoryId) {
    ElMessage.warning('请填写完整信息')
    return
  }
  createForm.value.specs = selectedSpecs.value.filter(s => s.optIds.length)
  createSpu({
    shopId: getShopId(),
    name: createForm.value.name,
    categoryId: createForm.value.categoryId,
    specs: createForm.value.specs
  }).then(res => {
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
      ElMessage.warning('请选择一个要编辑的商品')
      return
    }
    target = selectedRows.value[0]
  }
  // TODO: 获取详情接口
  editForm.value = { ...target }
  editDialogVisible.value = true
}
function handleEditConfirm() {
  if (!editForm.value.name || !editForm.value.categoryId) {
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
      ElMessage.warning('请选择要删除的商品')
      return
    }
    targets = ids.value
  }
  ElMessageBox.confirm(
    `确认要删除选中的商品吗？`,
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
function getShopId() {
  return localStorage.getItem('shopId') || ''
}
function getList() {
  loading.value = true
  let conditions = []
  if (queryParams.value.name) {
    conditions.push(`name:like:${queryParams.value.name}`)
  }
  // 分类可根据实际接口调整
  const params = {
    shopId: getShopId(),
    size: queryParams.value.size,
    current: queryParams.value.current
  }
  if (conditions.length) {
    params['conditions_'] = conditions.join(',')
  }
  // categoryId
  if (queryParams.value.categoryId) {
    params['categoryId'] = queryParams.value.categoryId
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
/* 规格样式优化 */
.el-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}
.el-tag--primary {
  background-color: #2d62ed;
  color: #ffffff;
  box-shadow: 0 3px 12px rgba(45, 98, 237, 0.35);
}
.el-tag--info {
  background-color: #f2f3f5;
  color: #4e5969;
  border: 1px solid #e5e6eb;
}
.el-tag:hover:not(.el-tag--primary) {
  border-color: #dcdfe6;
  background-color: #eef0f3;
  transform: translateY(-2px);
}
.el-check-tag {
  border: 1px solid #e0e0e0;
}
.el-check-tag:hover {
  border-color: #409eff;
}
.el-check-tag.is-checked {
  background-color: #f0f7ff;
  border-color: #409eff;
  color: #409eff;
}
.spec-container { max-height: 300px; overflow-y: auto; padding: 10px; }
.active-spec-tag { background: #e6f0ff; color: #1890ff; border: 1px solid #b3d8ff; box-sizing: border-box; }
.default-spec-tag { background: #f5f5f5; color: #333; border: 1px solid #e0e0e0; box-sizing: border-box; }
.active-spec-tag:hover, .default-spec-tag:hover { transform: none !important; padding: 6px 16px !important; border-width: 1px !important; box-shadow: none !important; outline: none !important; }
.spec-title {
  margin-bottom: 12px;
  font-weight: 500;
  color: #333;
}
</style>

function handleSpecTagClickOnly(specId) {
  activeSpecId.value = specId;
}
