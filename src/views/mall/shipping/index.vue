<template>
  <div class="shipping-settings">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>发货信息设置</h2>
      <div class="action-buttons">
        <el-button type="primary" @click="handleSave" :loading="loading">
          <span>保存设置</span>
        </el-button>
        <el-button @click="handleCancel">
          <span>取消</span>
        </el-button>
      </div>
    </div>

    <!-- 基本信息卡片 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <h3>基本发货信息</h3>
          <p class="el-text el-text--tip">设置商家的默认发货信息，用于订单发货时自动填充</p>
        </div>
      </template>
      
      <el-form ref="shippingFormRef" :model="shippingForm" label-width="120px" class="shipping-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发货人姓名" prop="senderName" required>
              <el-input v-model="shippingForm.senderName" placeholder="请输入发货人姓名"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="senderPhone" required>
              <el-input v-model="shippingForm.senderPhone" placeholder="请输入联系电话"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="发货地址" prop="senderAddress" required>
              <el-input v-model="shippingForm.senderAddress" placeholder="请输入详细发货地址"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="省份" prop="province" required>
              <el-select v-model="shippingForm.province" placeholder="请选择省份" @change="handleProvinceChange">
                <el-option 
                  v-for="province in provinces" 
                  :key="province.value" 
                  :label="province.label" 
                  :value="province.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="城市" prop="city" required>
              <el-select v-model="shippingForm.city" placeholder="请选择城市" @change="handleCityChange">
                <el-option 
                  v-for="city in cities" 
                  :key="city.value" 
                  :label="city.label" 
                  :value="city.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="区/县" prop="district" required>
              <el-select v-model="shippingForm.district" placeholder="请选择区/县">
                <el-option 
                  v-for="district in districts" 
                  :key="district.value" 
                  :label="district.label" 
                  :value="district.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮政编码" prop="postalCode">
              <el-input v-model="shippingForm.postalCode" placeholder="请输入邮政编码"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发货仓库" prop="warehouseId">
              <el-select v-model="shippingForm.warehouseId" placeholder="请选择发货仓库">
                <el-option 
                  v-for="warehouse in warehouses" 
                  :key="warehouse.id" 
                  :label="warehouse.name" 
                  :value="warehouse.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 物流商设置卡片 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <h3>物流商设置</h3>
          <p class="el-text el-text--tip">设置常用物流商信息，用于发货时选择</p>
        </div>
      </template>
      
      <div class="logistics-section">
        <el-button type="primary" plain class="add-logistics-btn" @click="handleAddLogistics">
          <el-icon><Plus /></el-icon>
          添加物流商
        </el-button>
        
        <el-table :data="logisticsList" style="width: 100%; margin-top: 20px;">
          <el-table-column prop="name" label="物流商名称" width="180"></el-table-column>
          <el-table-column prop="code" label="物流商编码" width="180"></el-table-column>
          <el-table-column prop="contact" label="联系人" width="120"></el-table-column>
          <el-table-column prop="phone" label="联系电话" width="150"></el-table-column>
          <el-table-column prop="isDefault" label="是否默认" width="100">
            <template #default="scope">
              <el-switch 
                v-model="scope.row.isDefault" 
                active-text="是" 
                inactive-text="否"
                @change="handleDefaultLogistics(scope.row)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleEditLogistics(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDeleteLogistics(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 发货模板设置卡片 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <h3>发货模板设置</h3>
          <p class="el-text el-text--tip">设置不同商品类型的发货模板，提高发货效率</p>
        </div>
      </template>
      
      <div class="template-section">
        <el-button type="primary" plain class="add-template-btn" @click="handleAddTemplate">
          <el-icon><Plus /></el-icon>
          添加发货模板
        </el-button>
        
        <el-table :data="templateList" style="width: 100%; margin-top: 20px;">
          <el-table-column prop="name" label="模板名称" width="180"></el-table-column>
          <el-table-column prop="description" label="模板描述"></el-table-column>
          <el-table-column prop="logisticsCompany" label="默认物流商" width="150"></el-table-column>
          <el-table-column prop="weight" label="默认重量(g)" width="120"></el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleEditTemplate(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDeleteTemplate(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 物流商编辑对话框 -->
    <el-dialog 
      v-model="logisticsDialogVisible" 
      :title="editingLogistics.id ? '编辑物流商' : '添加物流商'"
      width="500px"
    >
      <el-form ref="logisticsFormRef" :model="editingLogistics" label-width="100px">
        <el-form-item label="物流商名称" prop="name" required>
          <el-input v-model="editingLogistics.name" placeholder="请输入物流商名称"></el-input>
        </el-form-item>
        <el-form-item label="物流商编码" prop="code" required>
          <el-input v-model="editingLogistics.code" placeholder="请输入物流商编码"></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="editingLogistics.contact" placeholder="请输入联系人"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="editingLogistics.phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="是否默认">
          <el-switch v-model="editingLogistics.isDefault" active-text="是" inactive-text="否"></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="logisticsDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveLogistics" :loading="logisticsLoading">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 模板编辑对话框 -->
    <el-dialog 
      v-model="templateDialogVisible" 
      :title="editingTemplate.id ? '编辑发货模板' : '添加发货模板'"
      width="500px"
    >
      <el-form ref="templateFormRef" :model="editingTemplate" label-width="100px">
        <el-form-item label="模板名称" prop="name" required>
          <el-input v-model="editingTemplate.name" placeholder="请输入模板名称"></el-input>
        </el-form-item>
        <el-form-item label="模板描述" prop="description">
          <el-input 
            v-model="editingTemplate.description" 
            type="textarea" 
            placeholder="请输入模板描述"
            rows="3"
          ></el-input>
        </el-form-item>
        <el-form-item label="默认物流商" prop="logisticsCompanyId" required>
          <el-select v-model="editingTemplate.logisticsCompanyId" placeholder="请选择物流商">
            <el-option 
              v-for="logistics in logisticsList" 
              :key="logistics.id" 
              :label="logistics.name" 
              :value="logistics.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="默认重量(g)" prop="weight" required>
          <el-input-number 
            v-model="editingTemplate.weight" 
            :min="0" 
            :step="10" 
            placeholder="请输入默认重量"
          ></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="templateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveTemplate" :loading="templateLoading">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { 
  getShippingInfo, 
  saveShippingInfo, 
  getLogisticsList, 
  saveLogistics, 
  deleteLogistics,
  getTemplateList,
  saveTemplate,
  deleteTemplate,
  getWarehouseList,
  getProvinceList,
  getCityList,
  getDistrictList
} from '@/api/mall/shipping';

// 加载状态
const loading = ref(false);
const logisticsLoading = ref(false);
const templateLoading = ref(false);

// 表单引用
const shippingFormRef = ref(null);
const logisticsFormRef = ref(null);
const templateFormRef = ref(null);

// 发货信息表单
const shippingForm = reactive({
  senderName: '',
  senderPhone: '',
  senderAddress: '',
  province: '',
  city: '',
  district: '',
  postalCode: '',
  warehouseId: ''
});

// 省市区数据
const provinces = ref([
  { label: '广东省', value: '广东省' },
  { label: '北京市', value: '北京市' },
  { label: '上海市', value: '上海市' },
  { label: '浙江省', value: '浙江省' },
  { label: '江苏省', value: '江苏省' }
]);

const cities = ref([]);
const districts = ref([]);

// 仓库数据
const warehouses = ref([
  { id: '1', name: '主仓库' },
  { id: '2', name: '备用仓库' }
]);

// 物流商列表
const logisticsList = ref([
  {
    id: 1,
    name: '顺丰速运',
    code: 'SF',
    contact: '顺丰客服',
    phone: '95338',
    isDefault: true
  },
  {
    id: 2,
    name: '中通快递',
    code: 'ZT',
    contact: '中通客服',
    phone: '95311',
    isDefault: false
  },
  {
    id: 3,
    name: '圆通快递',
    code: 'YT',
    contact: '圆通客服',
    phone: '95554',
    isDefault: false
  }
]);

// 发货模板列表
const templateList = ref([
  {
    id: 1,
    name: '标准商品模板',
    description: '适用于大多数标准商品',
    logisticsCompanyId: 1,
    logisticsCompany: '顺丰速运',
    weight: 500
  },
  {
    id: 2,
    name: '小件商品模板',
    description: '适用于重量较轻的小件商品',
    logisticsCompanyId: 2,
    logisticsCompany: '中通快递',
    weight: 200
  }
]);

// 物流商编辑对话框
const logisticsDialogVisible = ref(false);
const editingLogistics = reactive({
  id: null,
  name: '',
  code: '',
  contact: '',
  phone: '',
  isDefault: false
});

// 模板编辑对话框
const templateDialogVisible = ref(false);
const editingTemplate = reactive({
  id: null,
  name: '',
  description: '',
  logisticsCompanyId: '',
  logisticsCompany: '',
  weight: 0
});

// 处理省份变化
const handleProvinceChange = async (province) => {
  shippingForm.city = '';
  shippingForm.district = '';
  
  try {
    // 实际项目中调用API获取城市数据
    // const response = await getCityList(province);
    // cities.value = response.data;
    
    // 模拟城市数据
    if (province === '广东省') {
      cities.value = [
        { label: '广州市', value: '广州市' },
        { label: '深圳市', value: '深圳市' },
        { label: '东莞市', value: '东莞市' }
      ];
    } else if (province === '北京市') {
      cities.value = [
        { label: '北京市', value: '北京市' }
      ];
    } else if (province === '上海市') {
      cities.value = [
        { label: '上海市', value: '上海市' }
      ];
    } else {
      cities.value = [];
    }
    
    districts.value = [];
  } catch (error) {
    console.error('获取城市列表失败:', error);
    ElMessage.error('获取城市列表失败');
  }
};

// 处理城市变化
const handleCityChange = async (city) => {
  shippingForm.district = '';
  
  try {
    // 实际项目中调用API获取区县数据
    // const response = await getDistrictList(city);
    // districts.value = response.data;
    
    // 模拟区县数据
    if (city === '广州市') {
      districts.value = [
        { label: '天河区', value: '天河区' },
        { label: '海珠区', value: '海珠区' },
        { label: '白云区', value: '白云区' },
        { label: '番禺区', value: '番禺区' }
      ];
    } else if (city === '深圳市') {
      districts.value = [
        { label: '福田区', value: '福田区' },
        { label: '南山区', value: '南山区' },
        { label: '宝安区', value: '宝安区' }
      ];
    } else {
      districts.value = [];
    }
  } catch (error) {
    console.error('获取区县列表失败:', error);
    ElMessage.error('获取区县列表失败');
  }
};

// 处理保存设置
const handleSave = async () => {
  try {
    const valid = await shippingFormRef.value.validate();
    if (valid) {
      loading.value = true;
      
      // 构建保存数据
      const saveData = {
        ...shippingForm,
        logisticsList: logisticsList.value,
        templateList: templateList.value
      };
      
      // 实际项目中调用API保存数据
      // await saveShippingInfo(saveData);
      
      // 模拟API调用
      setTimeout(() => {
        loading.value = false;
        ElMessage.success('保存成功');
      }, 1000);
    }
  } catch (error) {
    loading.value = false;
    console.error('保存失败:', error);
    ElMessage.error('保存失败，请重试');
  }
};

// 处理取消
const handleCancel = () => {
  // 重置表单
  shippingFormRef.value.resetFields();
};

// 处理添加物流商
const handleAddLogistics = () => {
  Object.assign(editingLogistics, {
    id: null,
    name: '',
    code: '',
    contact: '',
    phone: '',
    isDefault: false
  });
  logisticsDialogVisible.value = true;
};

// 处理编辑物流商
const handleEditLogistics = (row) => {
  Object.assign(editingLogistics, { ...row });
  logisticsDialogVisible.value = true;
};

// 处理删除物流商
const handleDeleteLogistics = (row) => {
  ElMessageBox.confirm(
    `确定要删除物流商"${row.name}"吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 实际项目中调用API删除
      // await deleteLogistics(row.id);
      
      // 模拟删除
      const index = logisticsList.value.findIndex(item => item.id === row.id);
      if (index !== -1) {
        logisticsList.value.splice(index, 1);
        ElMessage.success('删除成功');
      }
    } catch (error) {
      console.error('删除失败:', error);
      ElMessage.error('删除失败，请重试');
    }
  }).catch(() => {});
};

// 处理保存物流商
const handleSaveLogistics = async () => {
  try {
    const valid = await logisticsFormRef.value.validate();
    if (valid) {
      logisticsLoading.value = true;
      
      if (editingLogistics.isDefault) {
        // 确保只有一个默认物流商
        logisticsList.value.forEach(item => {
          item.isDefault = false;
        });
      }
      
      // 实际项目中调用API保存
      // await saveLogistics(editingLogistics);
      
      // 模拟保存
      if (editingLogistics.id) {
        // 编辑
        const index = logisticsList.value.findIndex(item => item.id === editingLogistics.id);
        if (index !== -1) {
          logisticsList.value[index] = { ...editingLogistics };
        }
      } else {
        // 添加
        const newId = Math.max(...logisticsList.value.map(item => item.id), 0) + 1;
        editingLogistics.id = newId;
        logisticsList.value.push({ ...editingLogistics });
      }
      
      logisticsDialogVisible.value = false;
      logisticsLoading.value = false;
      ElMessage.success('保存成功');
    }
  } catch (error) {
    logisticsLoading.value = false;
    console.error('保存失败:', error);
    ElMessage.error('保存失败，请重试');
  }
};

// 处理默认物流商设置
const handleDefaultLogistics = (row) => {
  if (row.isDefault) {
    logisticsList.value.forEach(item => {
      if (item.id !== row.id) {
        item.isDefault = false;
      }
    });
  }
};

// 处理添加模板
const handleAddTemplate = () => {
  Object.assign(editingTemplate, {
    id: null,
    name: '',
    description: '',
    logisticsCompanyId: '',
    logisticsCompany: '',
    weight: 0
  });
  templateDialogVisible.value = true;
};

// 处理编辑模板
const handleEditTemplate = (row) => {
  Object.assign(editingTemplate, { ...row });
  templateDialogVisible.value = true;
};

// 处理删除模板
const handleDeleteTemplate = (row) => {
  ElMessageBox.confirm(
    `确定要删除模板"${row.name}"吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 实际项目中调用API删除
      // await deleteTemplate(row.id);
      
      // 模拟删除
      const index = templateList.value.findIndex(item => item.id === row.id);
      if (index !== -1) {
        templateList.value.splice(index, 1);
        ElMessage.success('删除成功');
      }
    } catch (error) {
      console.error('删除失败:', error);
      ElMessage.error('删除失败，请重试');
    }
  }).catch(() => {});
};

// 处理保存模板
const handleSaveTemplate = async () => {
  try {
    const valid = await templateFormRef.value.validate();
    if (valid) {
      templateLoading.value = true;
      
      // 获取物流商名称
      const logistics = logisticsList.value.find(item => item.id === editingTemplate.logisticsCompanyId);
      if (logistics) {
        editingTemplate.logisticsCompany = logistics.name;
      }
      
      // 实际项目中调用API保存
      // await saveTemplate(editingTemplate);
      
      // 模拟保存
      if (editingTemplate.id) {
        // 编辑
        const index = templateList.value.findIndex(item => item.id === editingTemplate.id);
        if (index !== -1) {
          templateList.value[index] = { ...editingTemplate };
        }
      } else {
        // 添加
        const newId = Math.max(...templateList.value.map(item => item.id), 0) + 1;
        editingTemplate.id = newId;
        templateList.value.push({ ...editingTemplate });
      }
      
      templateDialogVisible.value = false;
      templateLoading.value = false;
      ElMessage.success('保存成功');
    }
  } catch (error) {
    templateLoading.value = false;
    console.error('保存失败:', error);
    ElMessage.error('保存失败，请重试');
  }
};

// 初始化数据
const initData = async () => {
  try {
    // 实际项目中调用API获取数据
    // const [shippingRes, logisticsRes, templateRes, warehouseRes] = await Promise.all([
    //   getShippingInfo(),
    //   getLogisticsList(),
    //   getTemplateList(),
    //   getWarehouseList()
    // ]);
    
    // 模拟数据
    shippingForm.senderName = '张三';
    shippingForm.senderPhone = '13800138000';
    shippingForm.senderAddress = '天河区珠江新城冼村路28号';
    shippingForm.province = '广东省';
    shippingForm.city = '广州市';
    shippingForm.district = '天河区';
    shippingForm.postalCode = '510623';
    shippingForm.warehouseId = '1';
    
    // 初始化城市和区县
    handleProvinceChange('广东省');
    handleCityChange('广州市');
  } catch (error) {
    console.error('初始化数据失败:', error);
    ElMessage.error('加载数据失败');
  }
};

// 生命周期
onMounted(() => {
  initData();
});
</script>

<script>
export default {
  name: 'ShippingSettings'
};
</script>

<style lang="scss" scoped>
.shipping-settings {
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
  
  .action-buttons {
    display: flex;
    gap: 10px;
  }
}

.info-card {
  margin-bottom: 20px;
  
  .card-header {
    h3 {
      color: #606266;
      margin: 0 0 5px 0;
      font-size: 16px;
      font-weight: 500;
    }
  }
}

.shipping-form {
  margin-top: 10px;
}

.add-logistics-btn,
.add-template-btn {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}
</style>