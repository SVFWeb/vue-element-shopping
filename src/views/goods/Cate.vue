<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row>
        <!-- 添加分类按钮区域 -->
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 分类表格 -->
      <el-table :data="cateList" style="width: 100%; margin-bottom: 20px" row-key="cat_id" border :tree-props="{ children: 'children' }">
        <el-table-column prop="cat_name" label="分类名称"></el-table-column>
        <el-table-column prop="cat_deleted" label="是否有效">
          <template slot-scope="scope">
            <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
            <i class="el-icon-error" v-else style="color: red"></i>
          </template>
        </el-table-column>
        <el-table-column prop="cat_level" label="排序">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag type="info" v-else>三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCate(scope.row.cat_id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scope.row.cat_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :page-sizes="[5, 10, 15, 20]" :page-size="goodsInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateVisible" width="50%" @close="addCateDialogClosed">
      <el-form :model="addCateForm" :rules="addCateRules" ref="addCateRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps" @change="parentCateChange" clearable change-on-select></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateVisible = false">取 消</el-button>
        <el-button type="primary" @click="trueAddCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editCateVisible" width="30%" @close="editCateDialogClosed">
      <el-form :model="editCateForm" :rules="editCateRules" ref="editCateRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateVisible = false">取 消</el-button>
        <el-button type="primary" @click="trueEditCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { CateList, CateAdd, CateDelete, CateEdit } from '@/utils/api'
export default {
  name,
  data() {
    return {
      // 商品分类数据列表
      cateList: [],
      // 商品查询信息
      goodsInfo: {
        type: '',
        // 页码值
        pagenum: 1,
        // 每页显示多少条数据
        pagesize: 5
      },
      total: 0,
      // 是否显示对话框
      addCateVisible: false,
      // 添加分类表单
      addCateForm: {
        // 分类名称
        cat_name: '',
        // 分类父 ID
        cat_pid: 0,
        // 分类层级
        cat_level: 0
      },
      // 添加分类表单规则
      addCateRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      // 父级分类列表
      parentCateList: [],
      // 绑定用户选择的分类值
      selectedKeys: [],
      // 配置级联菜单中数据如何展示
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 是否显示修改分类对话框
      editCateVisible: false,
      // 修改商品分类表单
      editCateForm: {
        cat_name: ''
      },
      // 修改商品分类表单规则
      editCateRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      // 修改商品分类 Id
      editCateId: ''
    }
  },
  created() {
    this.getCateInfo()
  },
  methods: {
    // 获取商品分类数据列表
    async getCateInfo() {
      const { data: res } = await CateList(this.goodsInfo)
      if (res.meta.status !== 200) return this.$message.error('获取商品分类数据列表失败')
      this.cateList = res.data.result
      this.total = res.data.total
    },
    handleSizeChange(value) {
      this.goodsInfo.pagesize = value
      // 重新渲染数据
      this.getCateInfo()
    },
    handleCurrentChange(value) {
      this.goodsInfo.pagenum = value
      // 重新渲染数据
      this.getCateInfo()
    },
    // 获取父级分类列表
    async getParentCateList() {
      const { data: res } = await CateList({
        type: 2
      })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类列表失败')
      this.parentCateList = res.data
    },
    // 添加分类对话框
    showAddCateDialog() {
      // 获取父级列表
      this.getParentCateList()
      // 显示对话框
      this.addCateVisible = true
    },
    // 联级选择器发生变化时触发
    parentCateChange() {
      if (this.selectedKeys.length > 0) {
        // 说明有选择分类
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 没有选择分类，说明是一级分类
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 确认添加分类
    async trueAddCate() {
      this.$refs.addCateRef.validate(async (value) => {
        if (!value) {
          return this.$message.error('验证失败')
        }
        const { data: res } = await CateAdd(this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateInfo()
        this.addCateVisible = false
      })
    },
    // 关闭添加分类对话框时触发
    addCateDialogClosed() {
      // 重置表单
      this.$refs.addCateRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 删除商品分类
    async deleteCate(id) {
      const result = await this.$confirm('此操作将永久删除该商品分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((res) => res)
      if (result === 'confirm') {
        const { data: res } = await CateDelete(id)
        if (res.meta.status !== 200) return this.$message.error('删除商品分类失败')
        this.$message.success('删除商品分类成功')
        this.getCateInfo()
      }
    },
    // 编辑商品分类
    editCate(id) {
      // 保存修改商品id
      this.editCateId = id
      this.editCateVisible = true
    },
    // 确认编辑商品分类
    async trueEditCate() {
      const { data: res } = await CateEdit(this.editCateId, this.editCateForm)
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('修改商品分类失败')
      this.$message.success('修改商品分类成功')
      this.getCateInfo()
      this.editCateVisible = false
    },
    // 关闭编辑商品分类对话框时触发
    editCateDialogClosed() {
      this.$refs.editCateRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
