import fetch from '@/utils/request';

// 会员
export default {
  // 查询
  memberLevelFeePage: (params?: any) => fetch.get('api/v1/memberLevelFee/page', params),
  // 下单
  memberLevelFeePay: (params?: any) => fetch.json('api/v1/memberLevelFeeOrder/pay', params),
  // 获取对公收款文本
  memberLevelFeeGetOffline: (params?: any) => fetch.get('api/v1/memberLevelFee/getOfflineInfo', params),
  // 会费介绍
  memberLevelFeeGetInfo: (params?: any) => fetch.get('api/v1/memberLevelFee/getInfo', params),
  // 会费支付
  memberLevelPay: (params?: any) => fetch.post('api/v1/pay', params),
  // 是否有进行中的订单
  memberLevelGetMemberStatus: (params?: any) => fetch.get('api/v1/memberLevelFeeOrder/getMemberStatus', params),
  // 获取当前会员等级/头衔
  memberLevelJoinGetMember: (params?: any) => fetch.get('api/v1/memberLevelJoin/getMember', params),
  // 是否开启微信支付
  memberLevelFeeWeChat: (params?: any) => fetch.get('api/v1/config/memberLevelFeeWeChat', params),
  // 是否开启对公付款
  memberLevelFeePublic: (params?: any) => fetch.get('api/v1/config/memberLevelFeePublic', params),
  // 个人中心提示语
  memberLevelFeeGetTips: (params?: any) => fetch.get('api/v1/memberLevelFee/getTips', params),
  // 计算有效期
  memberLevelFeeGetEndTime: (params?: any) => fetch.get('api/v1/memberLevelFee/getEndTime', params),
  // 是否允许续费
  getIsAllowUnexpiredRenewal: (params?: any) => fetch.get('api/v1/memberLevelFee/getIsAllowUnexpiredRenewal', params),
  // 用户取消支付
  memberLevelFeeOrderCancelPay: (params?: any) => fetch.post('api/v1/memberLevelFeeOrder/cancelPay', params)
};
