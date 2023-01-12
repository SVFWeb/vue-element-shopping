import request from './request'

// 登录验证
export const loginCheck = (params) => request.post('login', params)

// 左侧菜单栏
export const MenuList = () => request.get('menus')

// 用户数据列表
export const UsersList = (params) => request.get('users', { params })

// 修改用户状态
export const UsersState = (uId, type) => request.put('users/' + uId + '/state/' + type)

// 添加用户
export const AddUsers = (params) => request.post('users', params)

// 根据 ID 查询用户信息
export const UsersQuery = (id) => request.get('users/' + id)

// 修改用户信息
export const ChangeUser = (params) => request.put('users/' + params.id, params)

// 删除用户
export const DeletUser = (id) => request.delete('users/' + id)
