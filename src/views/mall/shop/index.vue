<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="商家" prop="mchId">
        <el-select
          v-model="queryParams.mchId"
          filterable
          remote
          reserve-keyword
          clearable
          placeholder="请选择商家"
          :remote-method="remoteMchQuery"
          :loading="mchLoading"
          style="width: 200px"
          @scroll="handleMchScroll"
          :popper-append-to-body="false"
          @visible-change="onMchDropdownVisible"
        >
          <el-option v-for="item in mchList" :key="item.id" :label="item.loginAccount || item.name || item.id" :value="item.id" />
          <div v-if="mchHasMore" style="text-align:center;padding:8px;color:#999;">下拉加载更多...</div>
        </el-select>
      </el-form-item>
      <el-form-item label="店铺名称" prop="shopName">
        <el-input
          v-model="queryParams.shopName"
          placeholder="请输入店铺名称"
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
      <el-table-column prop="shopNo" label="店铺编号" align="center" />
      <el-table-column prop="shopName" label="店铺名称" align="center" />
      <el-table-column prop="mchName" label="商家名称" align="center" />
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

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getList"
    />

    <el-dialog v-model="createDialogVisible" title="创建店铺" width="400px" @close="createDialogVisible = false">
      <el-form :model="createForm" :rules="createFormRules" label-width="90px">
        <el-form-item label="商户" prop="mchId">
          <el-select v-model="createForm.mchId" placeholder="请选择商户">
            <el-option v-for="item in mchList" :key="item.id" :label="item.loginAccount || item.name || item.id" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="店铺名称" prop="shopName">
          <el-input v-model="createForm.shopName" placeholder="请输入店铺名称" />
        </el-form-item>
        <el-form-item label="店铺编号" prop="shopNo">
          <el-input v-model="createForm.shopNo" placeholder="不填自动生成" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCreateConfirm">确 定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editDialogVisible" title="编辑店铺" width="400px" @close="editDialogVisible = false">
      <el-form :model="editForm" :rules="editFormRules" label-width="90px">
        <el-form-item label="商户" prop="mchId">
          <el-select v-model="editForm.mchId" placeholder="请选择商户" disabled>
            <el-option v-for="item in mchList" :key="item.id" :label="item.loginAccount || item.name || item.id" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="店铺名称" prop="shopName">
          <el-input v-model="editForm.shopName" placeholder="请输入店铺名称" />
        </el-form-item>
        <el-form-item label="店铺编号" prop="shopNo">
          <el-input v-model="editForm.shopNo" disabled />
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
import { listShop, createShop, getShopDetail, updateShop, deleteShop } from '@/api/mall/shop'
import { listMerchant } from '@/api/mall/merchant'
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
const mchLoading = ref(false)
const mchList = ref([])
const mchPage = ref(1)
const mchHasMore = ref(true)
const mchQuery = ref('')

const queryParams = ref({
  mchId: '',
  shopName: '',
  current: 1,
  size: 10
})

const createDialogVisible = ref(false)

const createForm = ref({ mchId: '', shopName: '', shopNo: '' })
const createFormRules = {
  mchId: [ { required: true, message: '请选择商户', trigger: 'change' } ],
  shopName: [ { required: true, message: '请输入店铺名称', trigger: 'blur' } ]
  // shopNo 可选，不做校验
}

const editDialogVisible = ref(false)
const editForm = ref({ id: '', mchId: '', shopName: '', shopNo: '' })
const editFormRules = {
  mchId: [ { required: true, message: '请选择商户', trigger: 'change' } ],
  shopName: [ { required: true, message: '请输入店铺名称', trigger: 'blur' } ]
  // shopNo 可选，不做校验
}

const filteredTableData = computed(() => tableData.value)

function handleQuery() {
  queryParams.value.current = 1
  getList()
}
function resetQuery() {
  queryParams.value.mchId = ''
  queryParams.value.shopName = ''
  handleQuery()
}
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  selectedRows.value = selection
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
function handleAdd() {
  createForm.value = { mchId: '', shopName: '', shopNo: '' }
  createDialogVisible.value = true
}
function handleCreateConfirm() {
  if (!createForm.value.mchId || !createForm.value.shopName) {
    ElMessage.warning('请填写完整信息')
    return
  }
  createShop(createForm.value).then(() => {
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
      ElMessage.warning('请选择一个要编辑的店铺')
      return
    }
    target = selectedRows.value[0]
  }
  getShopDetail(target.id).then(res => {
    editForm.value = { ...res.data }
    editDialogVisible.value = true
  })
}
function handleEditConfirm() {
  if (!editForm.value.mchId || !editForm.value.shopName) {
    ElMessage.warning('请填写完整信息')
    return
  }
  updateShop(editForm.value).then(() => {
    ElMessage.success('修改成功')
    editDialogVisible.value = false
    getList()
  }).catch(() => {
    ElMessage.error('修改失败')
  })
}
function handleDelete(row) {
  let targets = []
  if (row && row.id) {
    targets = [row.id]
  } else {
    if (!ids.value.length) {
      ElMessage.warning('请选择要删除的店铺')
      return
    }
    targets = ids.value
  }
  ElMessageBox.confirm(
    `确认要删除选中的店铺吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    deleteShop(targets).then(() => {
      ElMessage.success('删除成功')
      getList()
    }).catch(() => {
    //   ElMessage.error('删除失败')
    })
  }).catch(() => {})
}
function getList() {
  loading.value = true
  // 构造 conditions_ 参数
  let conditions = []
  if (queryParams.value.shopName) {
    conditions.push(`shopName:like:${queryParams.value.shopName}`)
  }
  const params = {
    size: queryParams.value.size,
    current: queryParams.value.current
  }
  if (conditions.length) {
    params['conditions_'] = conditions.join(',')
  }
  if (queryParams.value.mchId) {
    params.mchId = queryParams.value.mchId
  }
  listShop(params).then(res => {
    tableData.value = res.data?.records || []
    total.value = res.data?.total || 0
    loading.value = false
    selectedRows.value = []
    ids.value = []
  }).catch(() => {
    loading.value = false
  })
}
function getMchList() {
  mchQuery.value = ''
  mchPage.value = 1
  mchList.value = []
  mchHasMore.value = true
  loadMchList()
}
function remoteMchQuery(query) {
  mchQuery.value = query
  mchPage.value = 1
  mchList.value = []
  mchHasMore.value = true
  loadMchList()
}
function loadMchList() {
  if (!mchHasMore.value) return
  mchLoading.value = true
  const params = {
    size: 20,
    current: mchPage.value
  }
  if (mchQuery.value) {
    params['conditions_'] = `loginAccount:like:${mchQuery.value}`
  }
  listMerchant(params).then(res => {
    const records = res.data?.records || []
    if (mchPage.value === 1) {
      mchList.value = records
    } else {
      mchList.value = mchList.value.concat(records)
    }
    mchHasMore.value = records.length === 20
    mchLoading.value = false
  }).catch(() => {
    mchLoading.value = false
  })
}
function handleMchScroll(e) {
  const dropdown = e.target
  if (dropdown.scrollTop + dropdown.clientHeight >= dropdown.scrollHeight - 10 && mchHasMore.value && !mchLoading.value) {
    mchPage.value++
    loadMchList()
  }
}
function onMchDropdownVisible(visible) {
  if (visible && mchList.value.length === 0) {
    remoteMchQuery('')
  }
}
onMounted(() => {
  getList()
  getMchList()
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
