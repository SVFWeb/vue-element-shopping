import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Welcome from '../views/Welcome.vue'
import Users from '../views/user/Users.vue'
import Rights from '../views/power/rights.vue'
import Roles from '../views/power/roles.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  // to 表示将要访问的路径
  // from 表示从哪个路径来
  // next 下一步要做的步骤 开放令牌
  // 如果直接进入登录页面则直接开放
  if (to.path === '/login') {
    next()
  }
  const token = window.sessionStorage.getItem('token')
  // 如果没有 token 令牌说明没有进行登录则跳转到登录页面
  if (!token) return next('/login')
  next()
})
export default router
