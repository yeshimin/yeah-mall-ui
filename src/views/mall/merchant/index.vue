<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="商家账号" prop="loginAccount">
        <el-input
          v-model="queryParams.loginAccount"
          placeholder="请输入商家账号"
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
      <el-table-column prop="loginAccount" label="商家账号" align="center" />
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

    <el-dialog v-model="createDialogVisible" title="创建商家" width="400px" @close="createDialogVisible = false">
      <el-form :model="createForm" :rules="createFormRules" label-width="90px">
        <el-form-item label="商家账号" prop="loginAccount">
          <el-input v-model="createForm.loginAccount" placeholder="请输入商家账号" />
        </el-form-item>
        <el-form-item label="登录密码" prop="loginPassword">
          <el-input v-model="createForm.loginPassword" placeholder="请输入登录密码" type="password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCreateConfirm">确 定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editDialogVisible" title="编辑商家" width="400px" @close="editDialogVisible = false">
      <el-form :model="editForm" :rules="editFormRules" label-width="90px">
        <el-form-item label="商家账号" prop="loginAccount">
          <el-input v-model="editForm.loginAccount" placeholder="请输入商家账号" />
        </el-form-item>
        <el-form-item label="登录密码" prop="loginPassword">
          <el-input v-model="editForm.loginPassword" placeholder="如需重置请填写新密码" type="password" />
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
import { listMerchant, createMerchant, getMerchantDetail, updateMerchant, deleteMerchant } from '@/api/mall/merchant'
import RightToolbar from '@/components/RightToolbar/index.vue'
import Pagination from '@/components/Pagination/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SHA256 from 'crypto-js/sha256'

const tableData = ref([])
const loading = ref(false)
const showSearch = ref(true)
const ids = ref([])
const selectedRows = ref([]) // 新增，保存选中行对象
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const queryParams = ref({
  loginAccount: '',
  current: 1,
  size: 10
})

const createDialogVisible = ref(false)
const createForm = ref({ loginAccount: '', loginPassword: '' })
const createFormRules = {
  loginAccount: [ { required: true, message: '请输入商家账号', trigger: 'blur' } ],
  loginPassword: [ { required: true, message: '请输入登录密码', trigger: 'blur' } ]
}

const editDialogVisible = ref(false)
const editForm = ref({ id: '', loginAccount: '', loginPassword: '' })
const editFormRules = {
  loginAccount: [ { required: true, message: '请输入商家账号', trigger: 'blur' } ]
}

const filteredTableData = computed(() => tableData.value)

function handleQuery() {
  queryParams.value.current = 1
  getList()
}
function resetQuery() {
  queryParams.value.loginAccount = ''
  handleQuery()
}
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  selectedRows.value = selection // 新增，保存选中对象
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
function handleAdd() {
  createForm.value = { loginAccount: '', loginPassword: '' }
  createDialogVisible.value = true
}
function handleCreateConfirm() {
  if (!createForm.value.loginAccount || !createForm.value.loginPassword) {
    ElMessage.warning('请填写完整信息')
    return
  }
  const data = {
    ...createForm.value,
    loginPassword: SHA256(createForm.value.loginPassword.trim()).toString()
  }
  createMerchant(data).then(res => {
    ElMessage.success('创建成功')
    createDialogVisible.value = false
    getList()
  }).catch(() => {
    ElMessage.error('创建失败')
  })
}
function handleUpdate(row) {
  let target = row
  // 如果是点击表格上方按钮，row为undefined，取选中的唯一一条
  if (!target) {
    if (selectedRows.value.length !== 1) {
      ElMessage.warning('请选择一个要编辑的商家')
      return
    }
    target = selectedRows.value[0]
  }
  // if (!target || !target.id) {
  //   ElMessage.warning('请选择要编辑的商家')
  //   return
  // }
  getMerchantDetail(ids.value[0]).then(res => {
    editForm.value = { ...res.data, loginPassword: '' }
    editDialogVisible.value = true
  })
}
function handleEditConfirm() {
  if (!editForm.value.loginAccount) {
    ElMessage.warning('请输入商家账号')
    return
  }
  const data = { ...editForm.value }
  if (data.loginPassword) {
    data.loginPassword = SHA256(data.loginPassword.trim()).toString()
  } else {
    delete data.loginPassword // 不修改密码时不传
  }
  updateMerchant(data).then(() => {
    ElMessage.success('修改成功')
    editDialogVisible.value = false
    getList()
  }).catch(() => ElMessage.error('修改失败'))
}
function handleDelete(row) {
  let targets = []
  // 操作列删除
  if (row && row.id) {
    targets = [row.id]
  } else {
    if (!ids.value.length) {
      ElMessage.warning('请选择要删除的商家')
      return
    }
    targets = ids.value
  }
  ElMessageBox.confirm(
    `确认要删除选中的商家吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    deleteMerchant(targets).then(() => {
      ElMessage.success('删除成功')
      getList()
    }).catch((err) => {
    })
  }).catch(() => {})
}
function getList() {
  loading.value = true
  // 构造 conditions_ 参数
  let conditions = []
  if (queryParams.value.loginAccount) {
    conditions.push(`loginAccount:like:${queryParams.value.loginAccount}`)
  }
  const params = {
    size: queryParams.value.size,
    current: queryParams.value.current
  }
  if (conditions.length) {
    params['conditions_'] = conditions.join(',')
  }
  listMerchant(params).then(res => {
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
