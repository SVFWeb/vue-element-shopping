<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 添加角色区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoles">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="rolesListData" style="width: 100%" stripe border>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item, i1) in scope.row.children" :key="item.id" :class="['bdbottom', 'vcenter', i1 === 0 ? 'bdtop' : '']">
              <el-col :span="5">
                <el-tag closable>
                  {{ item.authName }}
                </el-tag>
              </el-col>
              <el-col :span="19">
                <el-row v-for="(item2, i2) in item.children" :key="item2.id" :class="['vcenter', i2 === 0 ? '' : 'bdtop']">
                  <el-col :span="6">
                    <el-tag type="success" closable>
                      {{ item2.authName }}
                    </el-tag>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="info" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRight(scope.row, item3.id)">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="reviseRoles(scope.row.id)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRoles(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="setRoles(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="reviseVisible" width="30%" @close="reviseDialogClosed">
      <el-form :model="reviseForm" ref="reviseRolesRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="角色名称">
          <el-input v-model="reviseForm.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="reviseForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="reviseVisible = false">取 消</el-button>
        <el-button type="primary" @click="trueReviseRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addVisible" width="30%" @close="addDialogClosed">
      <el-form :model="addForm" ref="addRolesRef" label-width="80px">
        <el-form-item label="角色名字">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="trueAddRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setVisible" width="50%" @close="setDialogClosed">
      <el-tree ref="setRightsFef" :data="rightsList" show-checkbox node-key="id" :props="rightsListProps" default-expand-all :default-checked-keys="keyList"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setVisible = false">取 消</el-button>
        <el-button type="primary" @click="trueSetRoles">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { RolesList, RolesQuery, RolesRevise, RolesDelete, RolesAdd, RolesDeleteRight, RightsTree, RightsSave } from '@/utils/api'
export default {
  name,
  data() {
    return {
      // 角色列表数据
      rolesListData: [],
      // 是否显示编辑角色对话框
      reviseVisible: false,
      // 编辑角色表单
      reviseForm: {
        roleDesc: '',
        roleName: ''
      },
      // 是否显示添加角色对话框
      addVisible: false,
      // 添加角色表单信息
      addForm: {
        roleDesc: '',
        roleName: ''
      },
      rightsList: [],
      // 是否显示分配权限对话框
      setVisible: false,
      rightsListProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认勾选的节点的 key 的数组
      keyList: [],
      // 正在操作用户的id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      const { data: res } = await RolesList()
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.rolesListData = res.data
    },
    // 编辑角色
    async reviseRoles(id) {
      this.reviseVisible = true
      // 查询该角色的信息
      const { data: res } = await RolesQuery(id)
      if (res.meta.status !== 200) return this.$message.error('获取角色信息失败')
      this.reviseForm = res.data
    },
    // 关闭编辑对话框触发
    reviseDialogClosed() {
      // 重置表单
      this.$refs.reviseRolesRef.resetFields()
    },
    // 确认编辑角色
    async trueReviseRoles() {
      const { data: res } = await RolesRevise(this.reviseForm)
      if (res.meta.status !== 200) return this.$message.error('编辑角色失败')
      this.$message.success('编辑角色成功')
      // 关闭弹出框
      this.reviseVisible = false
      // 重新获取角色列表
      this.getRolesList()
    },
    // 删除角色
    async deleteRoles(id) {
      const result = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((res) => res)
      if (result === 'confirm') {
        const { data: res } = await RolesDelete(id)
        if (res.meta.status !== 200) return this.$message.error('删除角色失败')
        this.$message.success('删除角色成功')
        // 重新获取角色列表
        this.getRolesList()
      }
    },
    // 添加角色
    addRoles() {
      this.addVisible = true
    },
    // 确认添加角色
    async trueAddRoles() {
      const { data: res } = await RolesAdd(this.addForm)
      if (res.meta.status !== 201) return this.$message.error('添加角色失败')
      this.$message.success('添加角色成功')
      // 关闭对话框
      this.addVisible = false
      // 重新获取角色列表
      this.getRolesList()
    },
    // 关闭添加角色对话框触发
    addDialogClosed() {
      this.$refs.addRolesRef.resetFields()
    },
    // 删除指定权限
    async removeRight(role, rightId) {
      // 提示用户是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (confirmResult === 'confirm') {
        const { data: res } = await RolesDeleteRight(role, rightId)
        if (res.meta.status !== 200) return this.$message.error('删除权限失败')
        this.$message.success('删除权限成功')
        role.children = res.data
      }
    },
    // 分配权限
    async setRoles(row) {
      // 保存正在操作用户的id
      this.roleId = row.id
      const { data: res } = await RightsTree()
      if (res.meta.status !== 200) return this.$message.error('获取权限失败')
      this.rightsList = res.data
      // 调用递归函数
      this.getLeafKeys(row, this.keyList)
      // 展示对话框
      this.setVisible = true
    },
    // 递归函数
    getLeafKeys(row, arr) {
      // 如果没有 children 属性说明已经是第三权限
      if (!row.children) {
        // 把当前的权限添加到数组里面
        return arr.push(row.id)
      }
      // 如果有 children 属性就继续遍历
      row.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    // 关闭分配权限对话框时触发
    setDialogClosed() {
      // 清空默认展示节点数组
      this.keyList = []
    },
    // 确认分配权限
    async trueSetRoles() {
      // 获取半选和全选的 id
      const id = [...this.$refs.setRightsFef.getHalfCheckedKeys(), ...this.$refs.setRightsFef.getCheckedKeys()]
      // 转换成字符串
      const idStr = String(id)
      const { data: res } = await RightsSave(this.roleId, {
        rids: idStr
      })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功')
      this.getRolesList()
      // 关闭对话框
      this.setVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
