<template>
  <div class="merchant-banner">
    <el-card>
      <h2>Banner管理</h2>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="Banner标题" />
        <el-table-column prop="image" label="图片">
          <template #default="scope">
            <img :src="scope.row.image" alt="banner" style="height:40px;" />
          </template>
        </el-table-column>
        <el-table-column prop="link" label="跳转链接" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'info'">
              {{ scope.row.status === '1' ? '启用' : '禁用' }}
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
  { id: 1, title: '夏日大促', image: 'https://via.placeholder.com/120x40?text=Banner1', link: 'https://example.com/1', status: '1', createTime: '2025-07-16 15:00:00' },
  { id: 2, title: '新品上市', image: 'https://via.placeholder.com/120x40?text=Banner2', link: 'https://example.com/2', status: '0', createTime: '2025-07-16 15:01:00' }
])
</script>

<style scoped>
.merchant-banner {
  padding: 24px;
}
</style>
