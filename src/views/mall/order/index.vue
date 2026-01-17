<template>
  <div class="order-management">
    <!-- 页面头部 -->
    <div class="page-header">
    </div>

    <!-- 搜索条件 -->
    <el-card class="search-card">
      <div class="search-container">
        <el-form :model="searchForm" label-width="80px" class="search-form">
          <div class="search-items">
            <div class="search-item">
              <el-form-item label="订单编号" style="margin-bottom: 0;">
                <el-input v-model="searchForm.orderNo" placeholder="订单编号" style="width: 180px;"></el-input>
              </el-form-item>
            </div>
            
            <div class="search-item">
              <el-form-item label="订单状态" style="margin-bottom: 0;">
                <el-select v-model="searchForm.status" placeholder="订单状态" style="width: 140px;">
                  <el-option label="全部" value=""></el-option>
                  <el-option label="待付款" value="1"></el-option>
                  <el-option label="已付款" value="2"></el-option>
                  <el-option label="已发货" value="3"></el-option>
                  <el-option label="已完成" value="4"></el-option>
                  <el-option label="已取消" value="5"></el-option>
                </el-select>
              </el-form-item>
            </div>
            
            <div class="search-item">
              <el-form-item label="日期范围" style="margin-bottom: 0;">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  style="width: 320px;"
                ></el-date-picker>
              </el-form-item>
            </div>
            
            <div class="search-buttons">
              <el-button type="primary" @click="handleSearch" style="margin-right: 10px;">搜索</el-button>
              <el-button @click="resetForm">重置</el-button>
            </div>
          </div>
        </el-form>
      </div>
    </el-card>
    <!-- 订单列表 -->
    <div style="width: 100%; margin-bottom: 20px;">
      <el-table :data="orderList" style="width: 100%;" fit border @sort-change="handleSortChange">
        <el-table-column prop="orderNo" label="订单编号" min-width="180"></el-table-column>
        <el-table-column prop="totalAmount" label="订单金额" width="120">
          <template #default="scope">
            <span>¥{{ scope.row.totalAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="120">
          <template #default="scope">
            <span :class="['status-tag', getStatusClass(scope.row.status)]">
              {{ getStatusText(scope.row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="180" sortable="true"></el-table-column>
        <el-table-column prop="paySuccessTime" label="支付时间" min-width="180" sortable="true">
          <template #default="scope">
            <span>{{ scope.row.paySuccessTime || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="收货人" width="100">
          <template #default="scope">
            <span>{{ scope.row.receiverName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="收货电话" width="120">
          <template #default="scope">
            <span>{{ scope.row.receiverContact || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="收货地址" min-width="250">
          <template #default="scope">
            <span>{{ scope.row.receiverFullAddress || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleOrderDetail(scope.row)">查看详情</el-button>
            <el-button size="small" type="primary" v-if="scope.row.status === '2' && !scope.row.trackingNo" @click="handleDeliver(scope.row)">发货</el-button>
            <el-button size="small" type="primary" v-else-if="(scope.row.status === '2' && scope.row.trackingNo) || scope.row.status === '3'" @click="handleDeliver(scope.row)">更新发货信息</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

    </div>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="1000px" destroy-on-close>
      <div v-if="currentOrder" class="order-detail">
        <!-- 订单基本信息 -->
        <el-card class="detail-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h4>订单基本信息</h4>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="订单状态">{{ getStatusText(currentOrder.status) }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentOrder.createTime }}</el-descriptions-item>
            <el-descriptions-item label="支付时间">{{ currentOrder.paySuccessTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="支付方式">微信支付</el-descriptions-item>
            <el-descriptions-item label="订单金额">¥{{ currentOrder.totalAmount.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="实付金额" :span="2">¥{{ currentOrder.totalAmount.toFixed(2) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 收货信息 -->
        <el-card class="detail-card" shadow="hover" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <h4>收货信息</h4>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="收货人">{{ currentOrder.receiverName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ currentOrder.receiverContact || '-' }}</el-descriptions-item>
            <el-descriptions-item label="收货地址">{{ currentOrder.receiverFullAddress || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 商品信息 -->
        <el-card class="detail-card" shadow="hover" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <h4>商品信息</h4>
            </div>
          </template>
          <el-table :data="orderItems" style="width: 100%;">
            <el-table-column label="商品图片" width="100" align="center">
              <template #default="scope">
                <ImagePreview 
                  :src="getFullImageUrl(scope.row.spuMainImage)" 
                  :width="80" 
                  :height="80" 
                />
              </template>
            </el-table-column>
            <el-table-column label="商品名称" min-width="200">
              <template #default="scope">
                <div class="product-info">
                  <div class="product-name">{{ scope.row.spuName || scope.row.productName }}</div>
                  <div class="product-sku">{{ scope.row.skuName }}</div>
                  <div class="product-specs" v-if="scope.row.specs && scope.row.specs.length">
                    <span v-for="(spec, index) in scope.row.specs" :key="spec.specId" class="spec-item">
                      {{ spec.specName }}: {{ spec.optName }}
                      <span v-if="index < scope.row.specs.length - 1" class="spec-separator">|</span>
                    </span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" align="center"></el-table-column>
            <el-table-column prop="price" label="单价" width="100" align="right">
              <template #default="scope">
                <span>¥{{ scope.row.price.toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="小计" width="100" align="right">
              <template #default="scope">
                <span>¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}</span>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="order-summary" style="margin-top: 10px; text-align: right;">
            <div class="summary-item">
              <span>商品总价：</span>
              <span class="amount">¥{{ currentOrder.totalAmount.toFixed(2) }}</span>
            </div>
            <div class="summary-item">
              <span>运费：</span>
              <span class="amount">¥0.00</span>
            </div>
            <div class="summary-item total">
              <span>实付金额：</span>
              <span class="amount">¥{{ currentOrder.totalAmount.toFixed(2) }}</span>
            </div>
          </div>
        </el-card>

        <!-- 快递信息 -->
        <el-card class="detail-card" shadow="hover" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <h4>快递信息</h4>
            </div>
          </template>
          <div v-if="currentOrder.status === '3' || currentOrder.status === 3" class="delivery-info">
            <div class="delivery-item">
              <span class="label">快递单号：</span>
              <span class="value">{{ currentOrder.trackingNo || '-' }}</span>
            </div>
            <div class="delivery-item">
              <span class="label">快递公司：</span>
              <span class="value">
                {{ (deliveryList.find(item => item.code === currentOrder.deliveryProviderCode?.toUpperCase())?.name || currentOrder.deliveryProviderCode || '-') }}
              </span>
            </div>
            <div class="delivery-item">
              <span class="label">发货时间：</span>
              <span class="value">{{ currentOrder.shipTime || '-' }}</span>
            </div>
            <div class="delivery-item">
              <span class="label">查询状态：</span>
              <el-tag :type="getQueryStatusType(currentOrder.deliveryQueryStatus)" size="small">
                {{ getQueryStatusText(currentOrder.deliveryQueryStatus) }}
              </el-tag>
            </div>
            <div class="delivery-item">
              <span class="label">最后查询：</span>
              <span class="value">{{ currentOrder.lastQueryTime || '未查询' }}</span>
            </div>
            <div class="delivery-item" style="margin-top: 10px;">
              <el-button 
                type="primary" 
                size="small" 
                @click="handleManualQueryDelivery"
                :loading="queryDeliveryLoading"
              >
                手动查询快递
              </el-button>
            </div>
            
            <!-- 快递轨迹 -->
            <div class="delivery-tracking" style="margin-top: 20px;">
              <h5>快递轨迹</h5>
              <div v-if="deliveryTracking.length > 0" class="tracking-list">
                <div v-for="(track, index) in deliveryTracking" :key="index" class="tracking-item">
                  <div class="tracking-time">{{ track.time }}</div>
                  <div class="tracking-content">{{ track.content }}</div>
                </div>
              </div>
              <div v-else class="no-tracking">
                <span>暂无物流轨迹信息</span>
              </div>
            </div>
          </div>
          <div v-else class="no-delivery">
            <span>暂无快递信息</span>
          </div>
        </el-card>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 发货对话框 -->
    <el-dialog v-model="deliverDialogVisible" :title="currentDeliverAction === 'deliver' ? '订单发货' : '更新发货信息'" width="600px">
      <el-form ref="deliverFormRef" :model="deliverForm" label-width="100px">
        <el-form-item label="订单编号">
          <el-input v-model="deliverForm.orderNo" disabled></el-input>
        </el-form-item>
        <el-form-item label="快递公司" prop="deliveryCompany" required>
          <el-select v-model="deliverForm.deliveryCompany" placeholder="请选择快递公司">
            <el-option v-for="delivery in deliveryList" :key="delivery.code" :label="delivery.name" :value="delivery.code"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号" prop="deliveryNo" required>
          <el-input v-model="deliverForm.deliveryNo" placeholder="请输入快递单号"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deliverDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitDeliver" :loading="deliverLoading">{{ currentDeliverAction === 'deliver' ? '确认发货' : '更新发货信息' }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { queryOrderList, getOrderDetail, deliverOrder, updateShipInfo } from '@/api/mall/order';
import { queryDeliveryProviderList } from '@/api/mall/shipping';
import ImagePreview from '@/components/ImagePreview/index.vue';

// 构造完整的图片URL
function getFullImageUrl(fileKey) {
  if (!fileKey) return '';
  
  // 根据当前激活的环境获取相应的基础地址配置
  const env = import.meta.env.VITE_APP_ENV;
  const baseApi = import.meta.env.VITE_APP_BASE_API || '';
  
  // 根据不同环境构造图片URL
  if (env === 'development') {
    // 开发环境从环境变量中获取目标地址
    const proxyTarget = import.meta.env.VITE_APP_DEV_BACKEND_URL || 'http://localhost:8080';
    return `${proxyTarget}/public/storage/preview?fileKey=${fileKey}`;
  } else {
    // 其他环境(生产、测试等)使用配置的基础API路径
    return `${baseApi}/public/storage/preview?fileKey=${fileKey}`;
  }
}

// 加载状态
const loading = ref(false);
const deliverLoading = ref(false);

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  status: '',
  startDate: '',
  endDate: ''
});

// 日期范围
const dateRange = ref([]);

// 分页数据
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
});

// 排序数据
const sortConfig = reactive({
  prop: 'createTime',
  order: 'desc' // 默认降序
});

// 订单列表
const orderList = ref([]);

// 订单详情
const detailDialogVisible = ref(false);
const currentOrder = ref(null);
const orderItems = ref([]);

// 发货
const deliverDialogVisible = ref(false);
const deliverFormRef = ref(null);
const deliverForm = reactive({
  orderId: '',
  orderNo: '',
  deliveryCompany: '',
  deliveryNo: ''
});
// 当前操作类型：'deliver' 发货，'update' 更新发货信息
const currentDeliverAction = ref('deliver');

// 快递公司列表
const deliveryList = ref([]);

// 快递查询相关
const queryDeliveryLoading = ref(false);
const deliveryTracking = ref([]);

// 获取物流商列表
const getLogisticsList = async () => {
  try {
    const response = await queryDeliveryProviderList({});
    if (response.code === 0 && response.data) {
      deliveryList.value = response.data.records || [];
    }
  } catch (error) {
    console.error('获取物流商列表失败:', error);
  }
};

// 处理排序变化
const handleSortChange = ({ prop, order }) => {
  console.log('排序变化:', { prop, order });
  if ((prop === 'createTime' || prop === 'paySuccessTime') && order) {
    sortConfig.prop = prop;
    sortConfig.order = order === 'ascending' ? 'asc' : 'desc';
    console.log('更新排序配置:', sortConfig);
    // 重新获取订单列表
    getOrderList();
  }
};

// 获取订单列表
const getOrderList = async () => {
  try {
    loading.value = true;
    
    // 构建排序条件
    const sortField = sortConfig.prop;
    const sortOrder = sortConfig.order;
    const conditions_ = `${sortField}:sort:${sortOrder}`;
    
    const params = {
      ...searchForm,
      current: pagination.current,
      size: pagination.pageSize,
      conditions_ // 添加排序条件
    };
    
    console.log('queryOrderList params:', params);
    const response = await queryOrderList(params);
    if (response.code === 0 && response.data) {
      orderList.value = response.data.records || [];
      pagination.total = response.data.total || 0;
    }
  } catch (error) {
    console.error('获取订单列表失败:', error);
    ElMessage.error('获取订单列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  // 处理日期范围
  if (dateRange.value && dateRange.value.length === 2) {
    searchForm.startDate = dateRange.value[0];
    searchForm.endDate = dateRange.value[1];
  } else {
    searchForm.startDate = '';
    searchForm.endDate = '';
  }
  pagination.current = 1;
  getOrderList();
};

// 重置
const resetForm = () => {
  Object.assign(searchForm, {
    orderNo: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  // 重置日期范围
  dateRange.value = [];
  pagination.current = 1;
  getOrderList();
};

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.pageSize = size;
  getOrderList();
};

// 当前页变化
const handleCurrentChange = (current) => {
  pagination.current = current;
  getOrderList();
};

// 订单详情
const handleOrderDetail = async (row) => {
  try {
    // 先尝试从API获取数据
    let orderData = null;
    let itemsData = [];
    
    try {
      const response = await getOrderDetail(row.id);
      if (response.code === 0 && response.data) {
        // 解析新的API返回格式
        orderData = response.data.order;
        itemsData = response.data.shopProducts || [];
      }
    } catch (apiError) {
      console.log('API调用失败，使用mock数据:', apiError);
    }
    
    // 如果API调用失败或没有数据，使用mock数据
    if (!orderData) {
      // Mock订单数据
      orderData = {
        ...row,
        paySuccessTime: row.paySuccessTime || '2026-01-16 14:30:00',
        receiverName: row.receiverName || '张三',
        receiverContact: row.receiverContact || '13800138000',
        receiverFullAddress: row.receiverFullAddress || '北京市朝阳区建国路88号',
        deliveryNo: row.status >= '3' ? 'SF1234567890' : '',
        deliveryCompany: row.status >= '3' ? '顺丰速运' : '',
        deliverTime: row.status >= '3' ? '2026-01-16 15:00:00' : ''
      };
      
      // Mock商品数据（使用新的格式）
      itemsData = [
        {
          id: 1,
          spuId: 35,
          spuName: '叶牌挖掘机',
          spuMainImage: '2ddcc6e552cd4107a9aa3186e8241bb3',
          skuId: 29,
          skuName: 'C型挖掘机',
          specs: [
            {
              specId: 1,
              specName: '颜色',
              optId: 2,
              optName: '黄色',
              sort: 1
            },
            {
              specId: 3,
              specName: '尺寸',
              optId: 5,
              optName: '大杯',
              sort: 2
            }
          ],
          price: 2222.00,
          quantity: 2
        },
        {
          id: 2,
          spuId: 1,
          spuName: '红米k20',
          spuMainImage: 'd86b9521bed1459c84b81bca3a8a2ed6',
          skuId: 36,
          skuName: '4个规格',
          specs: [
            {
              specId: 1,
              specName: '颜色',
              optId: 1,
              optName: '红色',
              sort: 1
            },
            {
              specId: 9,
              specName: '重量',
              optId: 21,
              optName: '很重',
              sort: 2
            }
          ],
          price: 111.00,
          quantity: 1
        }
      ];
    }
    
    currentOrder.value = orderData;
    orderItems.value = itemsData;
    detailDialogVisible.value = true;
  } catch (error) {
    console.error('获取订单详情失败:', error);
    ElMessage.error('获取订单详情失败');
  }
};

// 发货
const handleDeliver = (row) => {
  // 设置当前操作类型
  currentDeliverAction.value = row.trackingNo || row.status === '3' ? 'update' : 'deliver';
  
  // 使用订单的deliveryProviderCode作为快递公司code，转换为大写以便忽略大小写匹配
  const deliveryProviderCode = row.deliveryProviderCode || '';
  
  Object.assign(deliverForm, {
    orderId: row.id,
    orderNo: row.orderNo,
    deliveryCompany: deliveryProviderCode.toUpperCase(),
    deliveryNo: row.trackingNo || ''
  });
  deliverDialogVisible.value = true;
};

// 提交发货
const handleSubmitDeliver = async () => {
  try {
    const valid = await deliverFormRef.value.validate();
    if (valid) {
      deliverLoading.value = true;
      
      // 查找当前订单
      const currentRow = orderList.value.find(item => item.id === deliverForm.orderId);
      // 根据订单是否有trackingNo决定调用哪个接口
      const apiMethod = currentRow?.trackingNo ? updateShipInfo : deliverOrder;
      const successMessage = currentRow?.trackingNo ? '更新发货信息成功' : '发货成功';
      
      const response = await apiMethod({
        orderId: deliverForm.orderId,
        deliveryProviderCode: deliverForm.deliveryCompany,
        trackingNo: deliverForm.deliveryNo
      });
      
      if (response.code === 0) {
        deliverDialogVisible.value = false;
        deliverLoading.value = false;
        ElMessage.success(successMessage);
        // 重新获取订单列表
        getOrderList();
      } else {
        deliverLoading.value = false;
        ElMessage.error(response.message || '操作失败');
      }
    }
  } catch (error) {
    deliverLoading.value = false;
    console.error('操作失败:', error);
    ElMessage.error('操作失败，请重试');
  }
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    '0': '待审核',
    '1': '待付款',
    '2': '已付款',
    '3': '已发货',
    '4': '已完成',
    '5': '已取消'
  };
  return statusMap[status] || '未知状态';
};

// 获取状态样式
const getStatusClass = (status) => {
  const statusClassMap = {
    '0': 'status-pending',
    '1': 'status-unpaid',
    '2': 'status-paid',
    '3': 'status-delivered',
    '4': 'status-completed',
    '5': 'status-canceled'
  };
  return statusClassMap[status] || '';
};

// 获取快递查询状态文本
const getQueryStatusText = (status) => {
  const statusMap = {
    '0': '未查询',
    '1': '查询中',
    '2': '查询成功',
    '3': '查询失败',
    '4': '快递异常'
  };
  return statusMap[status] || statusMap['0'];
};

// 获取快递查询状态标签类型
const getQueryStatusType = (status) => {
  const typeMap = {
    '0': 'info',
    '1': 'warning',
    '2': 'success',
    '3': 'danger',
    '4': 'danger'
  };
  return typeMap[status] || typeMap['0'];
};

// 手动查询快递
const handleManualQueryDelivery = async () => {
  try {
    queryDeliveryLoading.value = true;
    // TODO: 调用快递查询API
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟快递轨迹数据
    deliveryTracking.value = [
      {
        time: '2026-01-17 15:30:00',
        content: '【北京市】快递已到达【北京朝阳区营业部】'
      },
      {
        time: '2026-01-17 14:20:00',
        content: '【北京市】快递已离开【北京转运中心】，正在发往【北京朝阳区营业部】'
      },
      {
        time: '2026-01-17 12:10:00',
        content: '【北京市】快递已到达【北京转运中心】'
      },
      {
        time: '2026-01-17 10:00:00',
        content: '【北京市】商家已发货，快递正在揽收中'
      }
    ];
    
    // 更新订单信息
    currentOrder.value.deliveryQueryStatus = '2';
    currentOrder.value.lastQueryTime = new Date().toLocaleString();
    
    ElMessage.success('快递查询成功');
  } catch (error) {
    console.error('快递查询失败:', error);
    ElMessage.error('快递查询失败，请稍后重试');
  } finally {
    queryDeliveryLoading.value = false;
  }
};

// 初始化
const initData = async () => {
  await getLogisticsList();
  await getOrderList();
};

// 生命周期
onMounted(() => {
  initData();
});
</script>

<style lang="scss" scoped>
.order-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    color: #303133;
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
}

.search-card {
  margin-bottom: 20px;
}

.search-container {
  width: 100%;
}

.search-form {
  width: 100%;
}

.search-items {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.search-item {
  display: flex;
  align-items: center;
}

.search-buttons {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.order-card {
  margin-bottom: 20px;
  width: 100%;
  
  >>> .el-card__body {
    padding: 15px;
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 订单详情样式 */
.order-detail {
  padding: 10px 0;
}

.detail-card {
  margin-bottom: 20px;
}

.detail-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-card .card-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.order-summary {
  margin-top: 15px;
  text-align: right;
}

.summary-item {
  margin-bottom: 5px;
}

.summary-item.total {
  margin-top: 10px;
  font-weight: bold;
  font-size: 16px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.summary-item .amount {
  font-weight: bold;
  color: #f56c6c;
}

/* 物流信息样式 */
.delivery-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.delivery-item {
  display: flex;
  align-items: center;
}

.delivery-item .label {
  width: 80px;
  color: #606266;
}

.no-delivery {
  color: #909399;
  text-align: center;
  padding: 20px 0;
}

/* 快递轨迹样式 */
.delivery-tracking {
  margin-top: 20px;
}

.delivery-tracking h5 {
  margin: 0 0 15px 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.tracking-list {
  padding-left: 20px;
  position: relative;
}

.tracking-list::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e4e7ed;
}

.tracking-item {
  position: relative;
  padding-bottom: 20px;
  padding-left: 15px;
}

.tracking-item::before {
  content: '';
  position: absolute;
  left: -25px;
  top: 6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #fff;
  border: 2px solid #409eff;
  z-index: 1;
}

.tracking-item:last-child::before {
  background-color: #409eff;
}

.tracking-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.tracking-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

.no-tracking {
  color: #909399;
  text-align: center;
  padding: 20px 0;
}

/* 商品信息样式 */
.product-info {
  .product-name {
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .product-sku {
    font-size: 13px;
    color: #606266;
    margin-bottom: 4px;
  }
  
  .product-specs {
    font-size: 12px;
    color: #909399;
    
    .spec-item {
      margin-right: 8px;
    }
    
    .spec-separator {
      margin-right: 8px;
    }
  }
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background-color: #e6a23c;
  color: #fff;
}

.status-unpaid {
  background-color: #f56c6c;
  color: #fff;
}

.status-paid {
  background-color: #409eff;
  color: #fff;
}

.status-delivered {
  background-color: #67c23a;
  color: #fff;
}

.status-completed {
  background-color: #909399;
  color: #fff;
}

.status-canceled {
  background-color: #c0c4cc;
  color: #fff;
}

.order-detail {
  padding: 10px 0;
}

.dialog-footer {
  text-align: right;
}
</style>