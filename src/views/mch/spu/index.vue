<template>
  <div class="merchant-spu">
    <el-card>
      <h2>商品SPU管理</h2>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="SPU名称" />
        <el-table-column prop="category" label="所属分类" />
        <el-table-column prop="price" label="价格" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'info'">
              {{ scope.row.status === '1' ? '上架' : '下架' }}
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
  { id: 1, name: '夏季T恤', category: '服饰', price: '99.00', createTime: '2025-07-16 14:50:00', status: '1' },
  { id: 2, name: '蓝牙耳机', category: '数码', price: '199.00', createTime: '2025-07-16 14:51:00', status: '1' },
  { id: 3, name: '沙发', category: '家居', price: '899.00', createTime: '2025-07-16 14:52:00', status: '0' }
])
</script>

<style scoped>
.merchant-spu {
  padding: 24px;
}
</style>
