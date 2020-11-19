import fetch from "@/utils/request"

export default {
  // 获取成为销售员条件
  distributerBecomeConditionConfigGet: (params?: any) => fetch.get('api/v1/distributer-become-condition-config/get', params),
  // 获取注册字段
  distributerRegistFieldList: (params?: any) => fetch.get('api/v1/distributer-regist-field/list', params),
  // 成为销售员
  distributerRegist: (params?: any) => fetch.json('api/v1.1/distributer/regist', params),


  // 获取用户资料
  distributerGet: (params?: any) => fetch.get('api/v1.1/distributer/get', params),

  // 推广汇总
  distributerSummary: (params?: any) => fetch.get('api/v1.1/distributer-summary', params),
  // 推广订单列表
  distributerCommissionPage: (params?: any) => fetch.get('api/v1/distributer-commission/page', params),
  // 获取提现账号
  getWithdrawAccount: (params?: any) => fetch.get('api/v1/distributer/get-withdraw-account', params),
  // 修改提现账号
  updateWithdrawAccount: (params?: any) => fetch.post('api/v1/distributer/update-withdraw-account', params),
  // 申请提现
  distributerCommissionWithdraw: (params?: any) => fetch.post('api/v1/distributer-commission/withdraw', params),

  // 获取推广二维码
  distributerQrcodeGet: (params?: any) => fetch.get('api/v1/distributer-qrcode/get', params),
  // 获取推广活动二维码
  distributerQrcodeGetActivity: (params?: any) => fetch.get('api/v1/distributer-qrcode/get-activity', params),
  // 推广活动列表
  activityDistributerPage: (params?: any) => fetch.get('api/v1/activity/distributer-page', params),
  // 我的团队列表
  distributerFriends: (params?: any) => fetch.get('api/v1/distributer/friends', params),
  // 我的客户列表
  distributerCustomers: (params?: any) => fetch.get('api/v1/distributer/customers', params),

  // 扫码
  distributerQrcodeScan: (params?: any) => fetch.get('api/v1/distributer-qrcode/scan', params),
  // 扫码并绑定关系
  distributerScanBind: (params?: any) => fetch.post('api/v1/distributer/scan-bind', params),

  // 获取QA图文
  distributerMaterialQaGet: (params?: any) => fetch.get('api/v1/distributer/material/qa/get', params),
  // 获取销售推广计划图文
  distributerMaterialPlanGet: (params?: any) => fetch.get('api/v1/distributer/material/plan/get', params),
  // 获取销售推广规则图文
  distributerMaterialRuleGet: (params?: any) => fetch.get('api/v1/distributer/material/rule/get', params),

  // 获取销售邀请好友海报
  distributerPosterBackgroundIndexGet: (params?: any) => fetch.get('api/v1/distributer-poster-background/index/get', params),
  // 获取推广邀请好友海报
  distributerPosterBackgroundInvitationGet: (params?: any) => fetch.get('api/v1/distributer-poster-background/invitation/get', params),
  // 获取推广活动海报
  distributerPosterBackgroundPopularizationGet: (params?: any) => fetch.get('api/v1/distributer-poster-background/popularization/get', params),
  // 扫码获取销售员/推广者
  scanOwner: (params?: any) => fetch.get('api/v1/distributer-qrcode/scan-owner', params),
}