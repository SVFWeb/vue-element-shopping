<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row>
        <el-col :span="8">
          <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable @clear="getUsersList">
            <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="addShowUser">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="usersListData" style="width: 100%" border>
        <el-table-column prop="username" label="姓名" width="180"> </el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="changeUserInfo(scope.row.id)"></el-button>
            <!-- 删除 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUserInfo(scope.row.id)"></el-button>
            <!-- 分配角色 -->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="getRolesInfo(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <!-- :current-page(设置当前页码)    :page-size(设置每页的数据条数) -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[2, 4, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addUserVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addRules" ref="addRuleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="changeUserVisible" width="30%" @close="changeDialogClosed">
      <!-- 对话框主体 -->
      <el-form :rules="changeFormRules" ref="changeFormRef" :model="changeForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="changeForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="changeForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="changeForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="changeUserVisible = false">取 消</el-button>
        <el-button type="primary" @click="trueChangeUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="getRolesVisible" width="30%" @close="getDialogClosed">
      <div>
        <p>当前的用户:{{ usersInfo.username }}</p>
        <p>当前的角色:{{ usersInfo.role_name }}</p>
        <div>
          <p>分配新角色:</p>
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesListData" :key="item.id" :label="item.roleName" :value="item.id"> </el-option>
          </el-select>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="getRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="trueGetRolesInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { UsersList, UsersState, AddUsers, UsersQuery, ChangeUser, DeletUser, RolesList, RolesSave } from '@/utils/api'
export default {
  name,
  data() {
    //  自定义新增邮箱验证规则
    const checkEmail = (rule, value, callback) => {
      // value 输入框的值
      // callback() 通过令牌
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return callback()
      }
      callback(new Error('请输入合法的邮箱'))
    }

    // 验证手机号的规则
    const checkMobile = (rule, value, callback) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的手机号'))
    }
    return {
      // 用户数据列表
      usersListData: [],
      // 查询的数据
      queryInfo: {
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示多少条数据
        pagesize: 10
      },
      // 数据总数
      total: 0,
      // 是否显示用户对话框
      addUserVisible: false,
      // 添加用户信息
      addForm: {
        // 用户名
        username: '',
        // 密码
        password: '',
        // 邮箱
        email: '',
        // 手机号
        mobile: ''
      },
      // 添加用户信息规则
      addRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名的长度在3~10个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '用户名的长度在6~15个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, message: '邮箱格式不正确，请重新输入', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, message: '手机号码不正确，请重新输入', trigger: 'blur' }
        ]
      },
      // 是否显示修改用户对话框
      changeUserVisible: false,
      // 修改用户信息
      changeForm: {
        username: '',
        email: '',
        mobile: ''
      },
      changeFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, message: '邮箱格式不正确，请重新输入', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, message: '手机号码不正确，请重新输入', trigger: 'blur' }
        ]
      },
      // 是否显示分配角色对话框
      getRolesVisible: false,
      // 用户信息
      usersInfo: {},
      // 角色列表数据
      rolesListData: [],
      // 被选中的角色的 id
      selectedRoleId: ''
    }
  },
  created() {
    this.getUsersList()
  },
  methods: {
    // 获取用户数据列表
    async getUsersList() {
      const { data: res } = await UsersList(this.queryInfo)
      if (res.meta.status !== 200) return this.$message.error('获取用户数据失败')
      this.usersListData = res.data.users
      this.total = res.data.total
    },
    // pagesize改变时触发
    handleSizeChange(value) {
      // 将旧值替换新值
      this.queryInfo.pagesize = value
      // 重新获取数据
      this.getUsersList()
    },
    // 页码发生改变时触发
    handleCurrentChange(value) {
      // 将旧值替换新值
      this.queryInfo.pagenum = value
      // 重新获取数据
      this.getUsersList()
    },
    // 修改用户状态
    async userStateChanged(row) {
      const { data: res } = await UsersState(row.id, row.mg_state)
      if (res.meta.status !== 200) {
        // 如果返回状态为异常状态则报错并返回
        row.mg_state = !row.mg_state
        return this.$message.error('修改数据失败')
      }
      this.$message.success('更新状态成功')
    },
    // 显示添加用户弹出框
    addShowUser() {
      this.addUserVisible = true
    },
    // 添加用户对话框关闭时触发
    addDialogClosed() {
      // 重置表单
      this.$refs.addRuleForm.resetFields()
    },
    // 添加用户
    addUser() {
      this.$refs.addRuleForm.validate(async (valid) => {
        if (!valid) return this.$message.error('请填写完整用户信息')
        const { data: res } = await AddUsers(this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加用户数据失败')
        this.$message.success('添加用户成功')
        // 关闭弹出框
        this.addUserVisible = false
        // 重新用户数据列表
        this.getUsersList()
      })
    },
    // 修改用户信息
    async changeUserInfo(id) {
      // 显示对话框
      this.changeUserVisible = true
      // 先获取原本的用户信息
      const { data: res } = await UsersQuery(id)
      if (res.meta.status !== 200) return this.$message.$error('查询用户信息失败')
      this.changeForm = res.data
    },
    // 确认修改用户信息
    trueChangeUserInfo() {
      this.$refs.changeFormRef.validate(async (value) => {
        if (!value) return this.$message.error('请填写完整用户信息')
        const { data: res } = await ChangeUser(this.changeForm)
        if (res.meta.status !== 200) return this.$message.error('修改用户失败')
        // 关闭对话框
        this.changeUserVisible = false
        this.$message.success('修改用户成功')
        // 查询获取用户数据列表
        this.getUsersList()
      })
    },
    // 修改用户对话框关闭时触发
    changeDialogClosed() {
      this.$refs.changeFormRef.resetFields()
    },
    // 删除用户
    async deleteUserInfo(id) {
      // 返回的值是 promise 对象所以可以用 async 和 await 进行简化操作
      const result = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((res) => res)
      // 如果点取消则返回 cancel
      // 如果点确认则返回 confirm
      // console.log(result)
      if (result === 'confirm') {
        const { data: res } = await DeletUser(id)
        if (res.meta.status !== 200) return this.$message.error('删除用户失败')
        this.$message.success('删除用户成功')
        // 查询获取用户数据列表
        this.getUsersList()
      }
    },
    // 分配角色
    async getRolesInfo(usersInfo) {
      // 保存当前的用户信息
      this.usersInfo = usersInfo
      // 获取角色列表
      const { data: res } = await RolesList()
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.rolesListData = res.data
      // 显示对话框
      this.getRolesVisible = true
    },
    // 确认分配角色
    async trueGetRolesInfo() {
      // 判断是否选择了角色
      if (!this.selectedRoleId) return this.$message.error('请选择角色')
      console.log(this.usersInfo)
      // 分配角色
      const { data: res } = await RolesSave(this.usersInfo.id, {
        rid: this.selectedRoleId
      })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('分配角色失败')
      this.$message.success('分配角色成功')
      this.getUsersList()
      this.getRolesVisible = false
    },
    // 关闭分配角色对话框时触发
    getDialogClosed() {
      this.selectedRoleId = ''
    }
  }
}
</script>

<style lang="less" scoped>
.el-dialog {
  div {
    p {
      margin: 10px;
    }
  }
}
</style>
