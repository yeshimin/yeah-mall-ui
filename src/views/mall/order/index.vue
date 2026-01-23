<template>
  <div class="order-manage">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>订单管理</h2>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form ref="searchFormRef" :model="searchForm" label-position="left" label-width="80px" inline>
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单编号" clearable style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择订单状态" clearable style="width: 200px;">
            <el-option label="待审核" value="0"></el-option>
            <el-option label="待付款" value="1"></el-option>
            <el-option label="待发货" value="2"></el-option>
            <el-option label="已发货" value="3"></el-option>
            <el-option label="已完成" value="4"></el-option>
            <el-option label="已取消" value="5"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 300px;"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订单列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <h3>订单列表</h3>
        </div>
      </template>
      <el-table v-loading="loading" :data="orderList" style="width: 100%" @sort-change="handleSortChange">
        <el-table-column prop="orderNo" label="订单编号" min-width="180"></el-table-column>
        <el-table-column prop="createTime" label="下单时间" min-width="180" sortable="custom"></el-table-column>
        <el-table-column prop="paySuccessTime" label="支付时间" min-width="180" sortable="custom"></el-table-column>
        <el-table-column prop="totalAmount" label="订单金额" min-width="120" align="right">
          <template #default="scope">
            <span>¥{{ scope.row.totalAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" min-width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="买家信息" min-width="200">
          <template #default="scope">
            <div class="buyer-info">
              <div class="buyer-name">{{ scope.row.receiverName }}</div>
              <div class="buyer-contact">{{ scope.row.receiverContact }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="收货地址" min-width="250">
          <template #default="scope">
            <div class="address-info">
              {{ scope.row.receiverFullAddress }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="180" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleOrderDetail(scope.row)">详情</el-button>
            <el-button size="small" type="primary" v-if="scope.row.status === '2' || scope.row.status === 2" @click="handleDeliver(scope.row)">发货</el-button>
            <el-button size="small" type="primary" v-if="scope.row.status === '3' || scope.row.status === 3" @click="handleDeliver(scope.row)">更新发货信息</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container" style="margin-top: 20px; text-align: right;">
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
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="800px">
      <div class="order-detail">
        <!-- 基本信息 -->
        <el-card class="detail-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h4>基本信息</h4>
            </div>
          </template>
          <div class="detail-content">
            <div class="detail-item">
              <span class="label">订单编号：</span>
              <span class="value">{{ currentOrder.orderNo }}</span>
            </div>
            <div class="detail-item">
              <span class="label">订单状态：</span>
              <el-tag :type="getStatusType(currentOrder.status)">{{ getStatusText(currentOrder.status) }}</el-tag>
            </div>
            <div class="detail-item">
              <span class="label">下单时间：</span>
              <span class="value">{{ currentOrder.createTime }}</span>
            </div>
            <div class="detail-item">
              <span class="label">支付时间：</span>
              <span class="value">{{ currentOrder.paySuccessTime || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">订单金额：</span>
              <span class="value">¥{{ currentOrder.totalAmount.toFixed(2) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">收货人：</span>
              <span class="value">{{ currentOrder.receiverName }} {{ currentOrder.receiverContact }}</span>
            </div>
            <div class="detail-item">
              <span class="label">收货地址：</span>
              <span class="value">{{ currentOrder.receiverFullAddress }}</span>
            </div>
          </div>
        </el-card>

        <!-- 商品信息 -->
        <el-card class="detail-card" shadow="hover" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <h4>商品信息</h4>
            </div>
          </template>
          <el-table :data="orderItems" style="width: 100%">
            <el-table-column label="商品图片" width="80">
              <template #default="scope">
                <image-preview :image-list="[{ url: getFullImageUrl(scope.row.spuMainImage) }]">
                  <el-image
                    :src="getFullImageUrl(scope.row.spuMainImage)"
                    fit="cover"
                    style="width: 60px; height: 60px; cursor: pointer;"
                  ></el-image>
                </image-preview>
              </template>
            </el-table-column>
            <el-table-column label="商品信息" min-width="300">
              <template #default="scope">
                <div class="product-info">
                  <div class="product-name">{{ scope.row.spuName }}</div>
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
                {{ (deliveryList.find(item => item.code === currentOrder.deliveryProviderCode)?.name || currentOrder.deliveryProviderCode || '-') }}
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
              <span class="label">快递状态：</span>
              <el-tag :type="getTrackingStatusType(currentOrder.trackingStatusDetail)" size="small">
                {{ getTrackingStatusText(currentOrder.trackingStatusDetail) }}
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
                <div v-for="(track, index) in deliveryTracking" :key="index" :class="['tracking-item', { 'current-node': index === 0 }]">
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
          <el-select v-model="deliverForm.deliveryCompany" placeholder="请选择快递公司" filterable :filter-method="handleDeliveryFilter">
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
import { queryOrderList, getOrderDetail, deliverOrder, updateShipInfo, queryTracking } from '@/api/mall/order';
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
const getLogisticsList = async (searchKeyword = '') => {
  try {
    // 构建搜索条件
    const conditions = [];
    
    // 添加名称模糊查询
    if (searchKeyword) {
      conditions.push(`name:like:${searchKeyword}`);
    }
    
    // 添加排序条件：主流的优先排序
    conditions.push('isPopular:sort:desc');
    // 添加默认排序
    conditions.push('updateTime:sort:desc');
    
    const response = await queryDeliveryProviderList({
      size: 100, // 一次加载100条
      conditions_: conditions.join(';')
    });
    if (response.code === 0 && response.data) {
      // 保持快递公司的code默认格式，不转换为大写
      deliveryList.value = (response.data.records || []).map(delivery => ({
        ...delivery
      }));
    }
  } catch (error) {
    console.error('获取物流商列表失败:', error);
  }
};

// 防抖定时器
let deliverySearchTimer = null;

// 处理快递公司搜索（带防抖）
const handleDeliveryFilter = (value) => {
  // 清除之前的定时器
  if (deliverySearchTimer) {
    clearTimeout(deliverySearchTimer);
  }
  
  // 设置新的定时器，300ms后执行搜索
  deliverySearchTimer = setTimeout(() => {
    getLogisticsList(value);
  }, 300);
};

// 处理排序变化
const handleSortChange = ({ prop, order }) => {
  if ((prop === 'createTime' || prop === 'paySuccessTime') && order) {
    sortConfig.prop = prop;
    sortConfig.order = order === 'ascending' ? 'asc' : 'desc';
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
    
    const response = await queryOrderList(params);
    if (response.code === 0 && response.data) {
      orderList.value = response.data.records || [];
      pagination.total = parseInt(response.data.total) || 0;
    } else {
      // 接口调用失败时，清空订单列表并设置total为0
      orderList.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error('获取订单列表失败:', error);
    ElMessage.error('获取订单列表失败');
    // 异常时，清空订单列表并设置total为0
    orderList.value = [];
    pagination.total = 0;
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
    // 清空之前的快递轨迹数据，避免信息残留
    deliveryTracking.value = [];
    
    // 先尝试从API获取数据
    let orderData = null;
    let itemsData = [];
    
    try {
      const response = await getOrderDetail(row.id);
      if (response.code === 0 && response.data) {
        // 解析新的API返回格式
        orderData = response.data.order;
        itemsData = response.data.shopProducts || [];
        
        // 直接使用接口返回的deliveryTracking字段
        if (response.data.deliveryTracking) {
          // 检查error_code是否为0，只有为0时才处理数据
          if (response.data.deliveryTracking.error_code === 0 && response.data.deliveryTracking.result) {
            // 转换轨迹数据格式
            deliveryTracking.value = (response.data.deliveryTracking.result.list || []).map(track => ({
              time: track.datetime || '',
              content: track.remark || ''
            })).reverse(); // 倒序排列，最新的轨迹在最前面
            
            // 更新订单的快递状态信息
            if (orderData) {
              orderData.deliveryQueryStatus = '2'; // 查询成功
              orderData.trackingStatusDetail = response.data.deliveryTracking.result.status_detail || 'UNKNOWN';
            }
          } else {
            // 清空之前的快递轨迹数据
            deliveryTracking.value = [];
            // 更新订单的快递状态信息为查询失败
            if (orderData) {
              orderData.deliveryQueryStatus = '3'; // 查询失败
            }
          }
        }
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
const handleDeliver = async (row) => {
  // 设置当前操作类型
  currentDeliverAction.value = row.trackingNo || row.status === '3' ? 'update' : 'deliver';
  
  // 使用订单的deliveryProviderCode作为快递公司code，保持默认格式
  const deliveryProviderCode = row.deliveryProviderCode || '';
  
  Object.assign(deliverForm, {
    orderId: row.id,
    orderNo: row.orderNo,
    deliveryCompany: deliveryProviderCode,
    deliveryNo: row.trackingNo || ''
  });
  
  // 在打开对话框前获取物流商列表
  await getLogisticsList();
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
    '2': '待发货',
    '3': '已发货',
    '4': '已完成',
    '5': '已取消'
  };
  return statusMap[status] || '-';
};

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    '0': 'info',
    '1': 'warning',
    '2': 'primary',
    '3': 'success',
    '4': 'success',
    '5': 'danger'
  };
  return typeMap[status] || 'info';
};

// 获取快递查询状态文本
const getQueryStatusText = (status) => {
  const statusMap = {
    '0': '未查询',
    '1': '查询中',
    '2': '查询成功',
    '3': '查询失败',
    '4': '无轨迹',
    '5': '已签收'
  };
  return statusMap[status] || '-';
};

// 获取快递查询状态标签类型
const getQueryStatusType = (status) => {
  const typeMap = {
    '0': 'info',
    '1': 'warning',
    '2': 'success',
    '3': 'danger',
    '4': 'info',
    '5': 'success'
  };
  return typeMap[status] || 'info';
};

// 获取快递轨迹状态文本
const getTrackingStatusText = (status) => {
  const statusMap = {
    'WAIT_ACCEPT': '待揽收',
    'IN_TRANSIT': '运输中',
    'DELIVERING': '派送中',
    'SIGNED': '已签收',
    'EXCEPTION': '异常',
    'RETURNING': '退回中',
    'RETURNED': '已退回',
    'UNKNOWN': '未知'
  };
  return statusMap[status] || '未知';
};

// 获取快递轨迹状态标签类型
const getTrackingStatusType = (status) => {
  const typeMap = {
    'WAIT_ACCEPT': 'info',
    'IN_TRANSIT': 'warning',
    'DELIVERING': 'primary',
    'SIGNED': 'success',
    'EXCEPTION': 'danger',
    'RETURNING': 'warning',
    'RETURNED': 'danger',
    'UNKNOWN': 'info'
  };
  return typeMap[status] || 'info';
};

// 手动查询快递轨迹
const handleManualQueryDelivery = async () => {
  try {
    queryDeliveryLoading.value = true;
    // 调用快递查询接口
    const response = await queryTracking(currentOrder.value.id);
    if (response.code === 0) {
      // 直接使用接口返回的deliveryTracking数据或result数据
      const trackingData = response.data.deliveryTracking || response.data;
      // 检查error_code是否为0，只有为0时才是成功
      if (trackingData && trackingData.error_code === 0 && trackingData.result) {
        // 更新订单的快递状态信息
        if (currentOrder.value) {
          currentOrder.value.deliveryQueryStatus = '2'; // 查询成功
          currentOrder.value.trackingStatusDetail = trackingData.result.status_detail || 'UNKNOWN';
        }
        
        // 转换轨迹数据格式
        deliveryTracking.value = (trackingData.result.list || []).map(track => ({
          time: track.datetime || '',
          content: track.remark || ''
        })).reverse(); // 倒序排列，最新的轨迹在最前面
        ElMessage.success('快递查询成功');
      } else {
        // 查询失败时更新订单状态
        if (currentOrder.value) {
          currentOrder.value.deliveryQueryStatus = '3'; // 查询失败
        }
        // 使用trackingData.reason作为错误信息，没有则使用默认信息
        ElMessage.error(trackingData.reason || response.message || '快递查询失败');
      }
    } else {
      // 查询失败时更新订单状态
      if (currentOrder.value) {
        currentOrder.value.deliveryQueryStatus = '3'; // 查询失败
      }
      ElMessage.error(response.message || '快递查询失败');
    }
  } catch (error) {
    // 异常时更新订单状态
    if (currentOrder.value) {
      currentOrder.value.deliveryQueryStatus = '3'; // 查询失败
    }
    console.error('快递查询失败:', error);
    ElMessage.error('快递查询失败，请重试');
  } finally {
    queryDeliveryLoading.value = false;
  }
};

// // 生命周期
onMounted(async () => {
  // 获取订单列表
  await getOrderList();
});
</script>

<style lang="scss" scoped>
.order-manage {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.buyer-info {
  display: flex;
  flex-direction: column;
}

.buyer-name {
  font-weight: bold;
}

.product-info {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.product-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.spec-item {
  font-size: 12px;
  color: #606266;
}

.spec-separator {
  margin: 0 5px;
  color: #ccc;
}

.detail-content {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  min-width: 300px;
}

.detail-item .label {
  width: 100px;
  font-weight: bold;
  color: #606266;
}

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
  width: 100px;
  font-weight: bold;
  color: #606266;
}

.tracking-list {
  margin-top: 10px;
  border-left: 2px solid #e6e6e6;
  padding-left: 20px;
}

.tracking-item {
  margin-bottom: 15px;
  position: relative;
  &:before {
    content: '';
    position: absolute;
    left: -25px;
    top: 5px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #e6e6e6;
    border: 2px solid #fff;
    box-shadow: 0 0 0 2px #e6e6e6;
  }
  &:last-child {
    margin-bottom: 0;
  }
  &.current-node {
    &:before {
      background-color: #409eff;
      box-shadow: 0 0 0 2px #c6e2ff;
    }
    .tracking-time {
      color: #409eff;
      font-weight: bold;
    }
    .tracking-content {
      color: #409eff;
      font-weight: bold;
    }
  }
}

.tracking-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.tracking-content {
  font-size: 14px;
  color: #606266;
}

.no-tracking,
.no-delivery {
  text-align: center;
  color: #909399;
  padding: 20px 0;
}

.order-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-item.total {
  font-weight: bold;
  font-size: 16px;
  margin-top: 10px;
}

.amount {
  font-weight: bold;
  color: #f56c6c;
}
</style>