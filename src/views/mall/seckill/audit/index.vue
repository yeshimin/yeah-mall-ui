<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>秒杀申请审核</span>
        </div>
      </template>
      
      <!-- 查询条件 -->
      <el-form :inline="true" :model="queryParams" class="mb-4">
        <el-form-item label="申请商家" prop="merchantName">
          <el-input v-model="queryParams.merchantName" placeholder="请输入商家名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="审核状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择审核状态" clearable style="width: 120px">
            <el-option label="待审核" value="0" />
            <el-option label="审核通过" value="1" />
            <el-option label="审核拒绝" value="2" />
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
        </el-form-item>
      </el-form>
      
      <!-- 审核列表 -->
      <el-table v-loading="loading" :data="auditList" style="width: 100%">
        <el-table-column label="序号" type="index" width="80" />
        <el-table-column prop="merchantName" label="商家名称" width="150" />
        <el-table-column prop="merchantContact" label="联系人" width="120" />
        <el-table-column prop="merchantPhone" label="联系电话" width="150" />
        <el-table-column prop="productName" label="商品名称" width="200" />
        <el-table-column prop="activityName" label="活动名称" width="150" />
        <el-table-column prop="applyTime" label="申请时间" width="180" />
        <el-table-column prop="status" label="审核状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <template v-if="scope.row.status === 0">
              <el-button type="success" size="small" @click="handleApprove(scope.row)" plain>
                <el-icon><Check /></el-icon>
                通过
              </el-button>
              <el-button type="danger" size="small" @click="handleReject(scope.row)" plain>
                <el-icon><Close /></el-icon>
                拒绝
              </el-button>
            </template>
            <template v-else>
              <el-button type="primary" size="small" @click="handleView(scope.row)" plain>
                <el-icon><View /></el-icon>
                查看
              </el-button>
            </template>
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
    </el-card>
    
    <!-- 审核对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="审核结果" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="1">通过</el-radio>
            <el-radio label="2">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见" prop="auditRemark">
          <el-input v-model="form.auditRemark" type="textarea" placeholder="请输入审核意见" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAuditSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 查看详情对话框 -->
    <el-dialog title="申请详情" v-model="viewDialogVisible" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="商家名称">{{ viewForm.merchantName }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ viewForm.merchantContact }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ viewForm.merchantPhone }}</el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ viewForm.productName }}</el-descriptions-item>
        <el-descriptions-item label="商品价格">{{ viewForm.productPrice }}</el-descriptions-item>
        <el-descriptions-item label="申请数量">{{ viewForm.applyCount }}</el-descriptions-item>
        <el-descriptions-item label="活动名称">{{ viewForm.activityName }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ viewForm.applyTime }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ getStatusText(viewForm.status) }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ viewForm.auditTime }}</el-descriptions-item>
        <el-descriptions-item label="审核意见">{{ viewForm.auditRemark }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ viewForm.remark }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Check, Close, View } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const dialogTitle = ref('审核')
const formRef = ref(null)

// 查询参数
const queryParams = reactive({
  merchantName: '',
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
  status: '',
  auditRemark: ''
})

// 查看表单数据
const viewForm = reactive({})

// 表单规则
const rules = reactive({
  status: [{ required: true, message: '请选择审核结果', trigger: 'change' }],
  auditRemark: [{ required: true, message: '请输入审核意见', trigger: 'blur' }]
})

// 活动列表
const activityList = ref([
  { id: 1, name: '春节秒杀活动' },
  { id: 2, name: '情人节秒杀' },
  { id: 3, name: '元宵节秒杀' }
])

// 审核列表
const auditList = ref([])

// 模拟数据
const mockAuditList = [
  {
    id: 1,
    merchantName: '苹果官方旗舰店',
    merchantContact: '张三',
    merchantPhone: '13800138001',
    productName: 'iPhone 15 Pro',
    productPrice: '9999',
    applyCount: 50,
    activityId: 1,
    activityName: '春节秒杀活动',
    applyTime: '2026-02-01 10:00:00',
    status: 0,
    remark: '申请参加春节秒杀活动'
  },
  {
    id: 2,
    merchantName: '华为官方旗舰店',
    merchantContact: '李四',
    merchantPhone: '13900139002',
    productName: '华为 Mate 60 Pro',
    productPrice: '8999',
    applyCount: 30,
    activityId: 1,
    activityName: '春节秒杀活动',
    applyTime: '2026-02-01 11:00:00',
    status: 1,
    auditTime: '2026-02-02 09:00:00',
    auditRemark: '审核通过',
    remark: '申请参加春节秒杀活动'
  },
  {
    id: 3,
    merchantName: '小米官方旗舰店',
    merchantContact: '王五',
    merchantPhone: '13700137003',
    productName: '小米 14 Pro',
    productPrice: '4999',
    applyCount: 100,
    activityId: 2,
    activityName: '情人节秒杀',
    applyTime: '2026-02-05 14:00:00',
    status: 2,
    auditTime: '2026-02-06 10:00:00',
    auditRemark: '库存过多，建议减少申请数量',
    remark: '申请参加情人节秒杀活动'
  },
  {
    id: 4,
    merchantName: 'OPPO官方旗舰店',
    merchantContact: '赵六',
    merchantPhone: '13600136004',
    productName: 'OPPO Find X7',
    productPrice: '5999',
    applyCount: 40,
    activityId: 2,
    activityName: '情人节秒杀',
    applyTime: '2026-02-05 15:00:00',
    status: 0,
    remark: '申请参加情人节秒杀活动'
  }
]

// 初始化
onMounted(() => {
  getList()
})

// 获取审核列表
function getList() {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    auditList.value = mockAuditList
    pagination.total = mockAuditList.length
    loading.value = false
  }, 500)
}

// 审核通过
function handleApprove(row) {
  dialogTitle.value = '审核通过'
  form.id = row.id
  form.status = '1'
  form.auditRemark = ''
  dialogVisible.value = true
}

// 审核拒绝
function handleReject(row) {
  dialogTitle.value = '审核拒绝'
  form.id = row.id
  form.status = '2'
  form.auditRemark = ''
  dialogVisible.value = true
}

// 提交审核
function handleAuditSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      // 模拟API调用
      setTimeout(() => {
        const index = mockAuditList.findIndex(item => item.id === form.id)
        if (index !== -1) {
          mockAuditList[index] = {
            ...mockAuditList[index],
            status: parseInt(form.status),
            auditTime: new Date().toLocaleString(),
            auditRemark: form.auditRemark
          }
        }
        ElMessage.success('审核成功')
        dialogVisible.value = false
        getList()
        loading.value = false
      }, 500)
    }
  })
}

// 查看详情
function handleView(row) {
  Object.assign(viewForm, row)
  viewDialogVisible.value = true
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    0: '待审核',
    1: '审核通过',
    2: '审核拒绝'
  }
  return statusMap[status] || ''
}

// 获取状态标签类型
function getStatusTagType(status) {
  const typeMap = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }
  return typeMap[status] || ''
}

// 查询
function handleQuery() {
  pagination.current = 1
  getList()
}

// 重置
function resetQuery() {
  Object.assign(queryParams, {
    merchantName: '',
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

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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