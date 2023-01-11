import request from './request'

// 登录验证
export const loginCheck = (params) => request.post('login', params)
