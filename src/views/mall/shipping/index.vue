<template>

  <div class="shipping-settings">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>发货信息设置</h2>
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
              <el-select v-model="shippingForm.provinceCode" placeholder="请选择省份" @change="handleProvinceChange">
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
              <el-select v-model="shippingForm.cityCode" placeholder="请选择城市" @change="handleCityChange">
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
              <el-select v-model="shippingForm.districtCode" placeholder="请选择区/县" @change="handleDistrictChange">
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
        </el-row>
        
        <el-form-item>
          <el-button type="primary" @click="handleSaveBasicInfo" :loading="basicInfoLoading">保存基本信息</el-button>
        </el-form-item>
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
          <el-table-column prop="remark" label="备注" min-width="200"></el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="200">
            <template #default="scope">
              <span>{{ scope.row.createTime || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="更新时间" width="200">
            <template #default="scope">
              <span>{{ scope.row.updateTime || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="isDefault" label="是否默认" width="120">
            <template #default="scope">
              <el-switch 
                v-model="scope.row.isDefault" 
                active-text="是" 
                inactive-text="否"
                @change="handleDefaultLogistics(scope.row)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleEditLogistics(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDeleteLogistics(scope.row)">删除</el-button>
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
        <el-form-item label="备注" prop="remark">
          <el-input v-model="editingLogistics.remark" placeholder="请输入备注信息"></el-input>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { 
  getShippingInfo, 
  saveShippingInfo, 
  getAreaTree,
  createDeliveryProvider,
  queryDeliveryProviderList,
  getDeliveryProviderDetail,
  updateDeliveryProvider,
  setDefaultDeliveryProvider,
  deleteDeliveryProvider
} from '@/api/mall/shipping';

// 加载状态
const logisticsLoading = ref(false);
const basicInfoLoading = ref(false);

// 表单引用
const shippingFormRef = ref(null);
const logisticsFormRef = ref(null);

// 发货信息表单
const shippingForm = reactive({
  senderName: '',
  senderPhone: '',
  senderAddress: '',
  province: '',
  provinceCode: '',
  city: '',
  cityCode: '',
  district: '',
  districtCode: '',
  postalCode: ''
});

// 省市区数据
const areaTree = ref([]);
const provinces = ref([]);
const cities = ref([]);
const districts = ref([]);

// 物流商列表
const logisticsList = ref([]);

// 物流商编辑对话框
const logisticsDialogVisible = ref(false);
const editingLogistics = reactive({
  id: null,
  name: '',
  code: '',
  remark: '',
  isDefault: false
});
const handleProvinceChange = (provinceCode) => {
  // 保存当前的城市和区县代码
  const currentCityCode = shippingForm.cityCode;
  const currentDistrictCode = shippingForm.districtCode;
  
  // 从树形数据中获取对应省份的城市
  const selectedProvince = areaTree.value.find(item => item.code === provinceCode);
  if (selectedProvince && selectedProvince.children) {
    cities.value = selectedProvince.children.map(city => ({
      label: city.name,
      value: city.code
    }));
    
    // 检查当前城市代码是否在新的城市列表中
    const cityExists = selectedProvince.children.some(city => city.code === currentCityCode);
    if (!cityExists) {
      shippingForm.city = '';
      shippingForm.cityCode = '';
      shippingForm.district = '';
      shippingForm.districtCode = '';
      districts.value = [];
    } else {
      // 保持城市代码不变，更新城市名称
      const cityItem = cities.value.find(item => item.value === currentCityCode);
      if (cityItem) {
        shippingForm.city = cityItem.label;
        // 重新构建区县列表
        handleCityChange(currentCityCode);
      }
    }
  } else {
    cities.value = [];
    shippingForm.city = '';
    shippingForm.cityCode = '';
    shippingForm.district = '';
    shippingForm.districtCode = '';
    districts.value = [];
  }
  
  // 更新省份名称
  const provinceItem = provinces.value.find(item => item.value === provinceCode);
  if (provinceItem) {
    shippingForm.province = provinceItem.label;
  }
};

// 处理城市变化
const handleCityChange = (cityCode) => {
  // 保存当前的区县代码
  const currentDistrictCode = shippingForm.districtCode;
  
  // 从树形数据中获取对应城市的区县
  let selectedCity = null;
  for (const province of areaTree.value) {
    selectedCity = province.children.find(city => city.code === cityCode);
    if (selectedCity) break;
  }
  
  if (selectedCity && selectedCity.children) {
    districts.value = selectedCity.children.map(district => ({
      label: district.name,
      value: district.code
    }));
    
    // 检查当前区县代码是否在新的区县列表中
    const districtExists = selectedCity.children.some(district => district.code === currentDistrictCode);
    if (!districtExists) {
      shippingForm.district = '';
      shippingForm.districtCode = '';
    } else {
      // 保持区县代码不变，更新区县名称
      const districtItem = districts.value.find(item => item.value === currentDistrictCode);
      if (districtItem) {
        shippingForm.district = districtItem.label;
      }
    }
  } else {
    districts.value = [];
    shippingForm.district = '';
    shippingForm.districtCode = '';
  }
  
  // 更新城市名称
  const cityItem = cities.value.find(item => item.value === cityCode);
  if (cityItem) {
    shippingForm.city = cityItem.label;
  }
};

// 处理区县变化
const handleDistrictChange = (districtCode) => {
  // 更新区县名称
  const districtItem = districts.value.find(item => item.value === districtCode);
  if (districtItem) {
    shippingForm.district = districtItem.label;
  }
};


// 处理保存基本信息
const handleSaveBasicInfo = async () => {
  try {
    const valid = await shippingFormRef.value.validate();
    if (valid) {
      basicInfoLoading.value = true;
      
      // 构建保存数据
      const saveData = {
        ...shippingForm
      };
      
      // 实际项目中调用API保存数据
      const response = await saveShippingInfo(saveData);
      if (response.code === 0) {
        basicInfoLoading.value = false;
        ElMessage.success('保存基本信息成功');
      } else {
        basicInfoLoading.value = false;
        ElMessage.error(response.message || '保存失败');
      }
    }
  } catch (error) {
    basicInfoLoading.value = false;
    console.error('保存失败:', error);
    ElMessage.error('保存失败，请重试');
  }
};

// 处理重置基本信息
// const resetBasicInfo = () => {
//   shippingFormRef.value.resetFields();
// };

// 处理添加物流商
const handleAddLogistics = () => {
  Object.assign(editingLogistics, {
    id: null,
    name: '',
    code: '',
    remark: '',
    isDefault: false
  });
  logisticsDialogVisible.value = true;
};

// 处理编辑物流商
const handleEditLogistics = (row) => {
  Object.assign(editingLogistics, { ...row });
  logisticsDialogVisible.value = true;
};

// 获取物流商列表
const getLogisticsProviderList = async () => {
  try {
    const response = await queryDeliveryProviderList({});
    if (response.code === 0 && response.data) {
      logisticsList.value = response.data.records || [];
    }
  } catch (error) {
    console.error('获取物流商列表失败:', error);
    ElMessage.error('获取物流商列表失败');
  }
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
      const response = await deleteDeliveryProvider(row.id);
      if (response.code === 0) {
        ElMessage.success('删除成功');
        // 重新获取物流商列表
        await getLogisticsProviderList();
      } else {
        ElMessage.error(response.message || '删除失败');
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
      
      // 构建保存数据
      const saveData = {
        name: editingLogistics.name,
        code: editingLogistics.code,
        remark: editingLogistics.remark
      };
      
      let response;
      if (editingLogistics.id) {
        // 编辑
        saveData.id = editingLogistics.id;
        response = await updateDeliveryProvider(saveData);
      } else {
        // 添加
        response = await createDeliveryProvider(saveData);
      }
      
      if (response.code === 0) {
        // 如果设置为默认，调用设置默认API
        if (editingLogistics.isDefault) {
          await setDefaultDeliveryProvider(editingLogistics.id || response.data);
        }
        
        logisticsDialogVisible.value = false;
        logisticsLoading.value = false;
        ElMessage.success('保存成功');
        // 重新获取物流商列表
        await getLogisticsProviderList();
      } else {
        logisticsLoading.value = false;
        ElMessage.error(response.message || '保存失败');
      }
    }
  } catch (error) {
    logisticsLoading.value = false;
    console.error('保存失败:', error);
    ElMessage.error('保存失败，请重试');
  }
};

// 处理默认物流商设置
const handleDefaultLogistics = async (row) => {
  if (row.isDefault) {
    try {
      const response = await setDefaultDeliveryProvider(row.id);
      if (response.code === 0) {
        // 确保只有一个默认物流商
        logisticsList.value.forEach(item => {
          if (item.id !== row.id) {
            item.isDefault = false;
          }
        });
        ElMessage.success('设置默认物流商成功');
      } else {
        row.isDefault = false;
        ElMessage.error(response.message || '设置失败');
      }
    } catch (error) {
      row.isDefault = false;
      console.error('设置默认物流商失败:', error);
      ElMessage.error('设置失败，请重试');
    }
  }
};

// 初始化数据
const initData = async () => {
  try {
    // 获取省市区树形数据
    const areaRes = await getAreaTree();
    if (areaRes.code === 0 && areaRes.data) {
      areaTree.value = areaRes.data;
      // 构建省份列表
      provinces.value = areaRes.data.map(province => ({
        label: province.name,
        value: province.code
      }));
    }
    
    // 实际项目中调用API获取数据
    const shippingRes = await getShippingInfo();
    if (shippingRes.code === 0 && shippingRes.data) {
      const data = shippingRes.data;
      shippingForm.senderName = data.name || '';
      shippingForm.senderPhone = data.contact || '';
      shippingForm.senderAddress = data.detailAddress || '';
      shippingForm.province = data.provinceName || '';
      shippingForm.provinceCode = data.provinceCode || '';
      shippingForm.city = data.cityName || '';
      shippingForm.cityCode = data.cityCode || '';
      shippingForm.district = data.districtName || '';
      shippingForm.districtCode = data.districtCode || '';
      shippingForm.postalCode = data.postalCode || '';
    }
    
    // 初始化城市和区县
    await initAreaSelections();
    
    // 获取物流商列表
    await getLogisticsProviderList();
  } catch (error) {
    console.error('初始化数据失败:', error);
    ElMessage.error('加载数据失败');
  }
};

// 初始化省市区选择
const initAreaSelections = async () => {
  if (!shippingForm.provinceCode) return;
  
  // 处理省份选择
  handleProvinceChange(shippingForm.provinceCode);
  
  // 等待城市列表加载
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // 处理城市选择
  if (shippingForm.cityCode) {
    handleCityChange(shippingForm.cityCode);
    
    // 等待区县列表加载
    await new Promise(resolve => setTimeout(resolve, 200));
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

.add-logistics-btn {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}
</style>