import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// 引入样式重置表
import './assets/css/reset.css'
// 引入全局样式表
import './assets/css/glob.css'
// 引入字体图标库
import './assets/fonts/iconfont.css'

Vue.use(ElementUI)

Vue.config.productionTip = false

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
