import axios from 'axios'

const request = axios.create({
  baseURL: 'http://127.0.0.1:8888/api/private/v1/'
})

// axios 请求拦截器 每次发送请求前会先触发 use 回调函数进行预处理
request.interceptors.request.use((config) => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

export default request
