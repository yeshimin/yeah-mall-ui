<template>
  <div class="admin-merchant-list">
    <el-card>
      <h2>商家列表</h2>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商家名称" />
        <el-table-column prop="contact" label="联系人" />
        <el-table-column prop="phone" label="联系电话" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'info'">
              {{ scope.row.status === '1' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const tableData = ref([
  { id: 1, name: '杭州有赞科技', contact: '张三', phone: '13800000001', status: '1', createTime: '2025-07-16 15:10:00' },
  { id: 2, name: '上海商家A', contact: '李四', phone: '13800000002', status: '0', createTime: '2025-07-16 15:11:00' }
])
</script>

<style scoped>
.admin-merchant-list {
  padding: 24px;
}
</style>
