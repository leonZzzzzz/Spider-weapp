import fetch from '@/utils/request';

// 登录接口
export const login = (params: any) => {
  return fetch.post('api/v1/member/login', params);
};

// 游客登录
export const visitorLogin = (params: any) => {
  return fetch.post('api/v1/member/loginByComment', params);
};

// 检查游客状态
export const checkVisitorStatus = () => {
  return fetch.get('api/v1/member/Visitor/openIdByWxFan');
};

// 授权
export const authorize = (params: any) => {
  return fetch.post('api/v1/member/authorize', params);
};
//获取通讯录状态
export const getprivatefolder = () => {
  return fetch.get('api/v1/contacts/my-status');
};

// 更新会员头像昵称
export const updateMember = (params: any) => {
  return fetch.post('api/v1/member/updateMember', params);
};

// 获取用户信息
export const getMemberInfo = () => {
  return fetch.get('api/v1/member/info');
};
// 获取用户状态
export const getMenberStatus = () => {
  return fetch.get('api/v1/member/getMemberStatus');
};
//是否使用商城的个人中心
export const personalMall = () => {
  return fetch.get('api/v1/config/PERSONAL_MALL');
};

// 上传图片
export const uploadImg = (tempFilePath: any, params: any) =>
  fetch.uploadFile('api/v1/attachments/images/tencent_cloud', tempFilePath, params);
