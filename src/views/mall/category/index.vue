<template>
  <div class="merchant-category">
    <el-card>
      <h2>商品分类管理</h2>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'info'">
              {{ scope.row.status === '1' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const tableData = ref([
  { id: 1, name: '服饰', createTime: '2025-07-16 14:45:00', status: '1' },
  { id: 2, name: '数码', createTime: '2025-07-16 14:46:00', status: '1' },
  { id: 3, name: '家居', createTime: '2025-07-16 14:47:00', status: '0' }
])
</script>

<style scoped>
.merchant-category {
  padding: 24px;
}
</style>
