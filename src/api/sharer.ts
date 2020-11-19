import fetch from '@/utils/request';

export default {
  // 我的资料
  sharerGet: (params?: any) => fetch.get('api/v1/sharer/get', params),
  // 注册
  sharerRegist: (params?: any) => fetch.post('api/v1/sharer/regist', params),

  // 获取推广二维码
  sharerQrcodeGet: (params?: any) => fetch.get('api/v1/sharer-qrcode/get', params),
  // 获取推广活动二维码
  sharerQrcodeGetActivity: (params?: any) => fetch.get('api/v1/sharer-qrcode/get-activity', params),
  // 推广活动列表
  activitySharerPage: (params?: any) => fetch.get('api/v1/activity/sharer-page', params),
  // 绑定关系
  sharerBind: (params?: any) => fetch.post('api/v1/sharer/bind', params),
  // 我的团队列表
  sharerFriends: (params?: any) => fetch.get('api/v1/sharer/friends', params),
  // 我的客户列表
  sharerCustomers: (params?: any) => fetch.get('api/v1/sharer/customers', params),
  // 等级列表
  sharerLevelPage: (params?: any) => fetch.get('api/v1/sharer-level/page', params),

  // 推广汇总
  sharerSummary: (params?: any) => fetch.get('api/v1/sharer-summary', params),
  // 推广订单列表
  sharerCommissionPage: (params?: any) => fetch.get('api/v1/sharer-commission/page', params),

  // 获取提现账号
  sharerGetWithdrawAccount: (params?: any) => fetch.get('api/v1/sharer/get-withdraw-account', params),
  // 修改提现账号
  sharerUpdateWithdrawAccount: (params?: any) => fetch.post('api/v1/sharer/update-withdraw-account', params),
  // 申请提现
  sharerCommissionWithdraw: (params?: any) => fetch.post('api/v1/sharer-commission/withdraw', params),
  // 提现列表
  withdrawPage: (params?: any) => fetch.get('api/v1/withdraw/page', params),
  // 提现详情
  withdrawGet: (params?: any) => fetch.get('api/v1/withdraw/get', params),

  // 获取提现手续费配置
  withdrawConfigGet: (params?: any) => fetch.get('api/v1/withdraw-config/get', params),

  // 是否开启活动推广
  abilityIsOpenShareActivity: (params?: any) => fetch.get('api/v1/ability-is-open/share-activity', params)
};
