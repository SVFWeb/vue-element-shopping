<template>
  <div class="login_containner">
    <!-- 用户登录 -->
    <div class="login_box">
      <!-- 登录头像 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登录信息 -->
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="0" class="login_form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="ruleForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 用户密码 -->
        <el-form-item prop="password">
          <el-input v-model="ruleForm.password" type="password" prefix-icon="iconfont icon-3702mima"></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="success" @click="Login">登录</el-button>
          <el-button type="info" @click="FormReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { loginCheck } from '@/utils/api'
export default {
  name,
  data() {
    return {
      // 表单信息
      ruleForm: {
        // 用户名
        username: 'admin',
        // 密码
        password: '123456'
      },
      // 表单验证规则
      rules: {
        // 用户名的验证规则
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        // 密码的用户规则
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 点击登录
    Login() {
      // valid 如果表单验证成功则返回 true 反之 false
      this.$refs.ruleForm.validate(async (valid) => {
        // 登录失败
        if (!valid) return this.$message.error('登录失败')
        // 登录成功
        const { data: res } = await loginCheck({
          username: this.ruleForm.username,
          password: this.ruleForm.password
        })
        this.$message.success('登录成功')
        // 将 token 值保存在浏览器中
        window.sessionStorage.setItem('token', res.data.token)
        // 跳转到主页
        this.$router.push('/home')
      })
    },
    // 重置表单
    FormReset() {
      this.$refs.ruleForm.resetFields()
    }
  }
}
</script>
<style lang="less" scoped>
.login_containner {
  background-color: #2b4b6b;
  height: 100vh;
  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    // 登录头像
    .avatar_box {
      height: 130px;
      width: 130px;
      border: 1px solid #eee;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;
      border-radius: 50%;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
    // 登录信息
    .login_form {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;
      .btns {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>
