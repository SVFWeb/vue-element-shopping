<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 表格 -->
    <el-table :data="rightsListData" style="width: 100%" stripe border>
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="authName" label="权限说明"> </el-table-column>
      <el-table-column prop="path" label="路径"> </el-table-column>
      <el-table-column prop="level" label="权限等级">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.level == 1">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.level == 2">二级</el-tag>
          <el-tag type="info" v-else>三级</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { RightsList } from '@/utils/api'
export default {
  name,
  data() {
    return {
      // 权限列表数据
      rightsListData: []
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    // 获取权限列表数据
    async getRightsList() {
      const { data: res } = await RightsList()
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      this.rightsListData = res.data
    }
  }
}
</script>
<style lang="less" scoped></style>
