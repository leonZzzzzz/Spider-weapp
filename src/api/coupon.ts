import fetch from "@/utils/request";

/**
 * 领取优惠券列表
 * 文档 http://xyj.wego168.com/xiaoyaoji/doc/2cIWobxRxF
 * storeId
 * ruleType 类型1商户，2运费
 */
// export const couponList = (params) => {
//   return fetch.get("api/v1/coupon_rule/page", params);
// };
/**
 * 领取优惠券列表-有返回状态
 * 文档 http://xyj.wego168.com/xiaoyaoji/doc/2oCjka1s6q
 * storeId
 */
export const couponList = (params) => {
  return fetch.get("api/v1.1/coupon-rule/mall-page", params);
};
/**
 * 我的优惠券列表
 * 文档 http://xyj.wego168.com/xiaoyaoji/doc/2cJvok4DWb
 */
export const myCouponList = (params) => {
  return fetch.get("api/v1/coupon", params);
};
/**
 * 领取优惠券
 * 文档 http://xyj.wego168.com/xiaoyaoji/doc/2cIWobxRxF
 */
export const receiveCoupon = (params) => {
  return fetch.post("api/v1/coupon", params);
};
/**
 * 获取商户可用优惠券列表
 * 文档 http://xyj.wego168.com/xiaoyaoji/doc/2uu8weLaZQ
 * @param orderItemId  多个用英文 下划线 拼接
 * @param storeId
 */
export const canUseCouponList = (params) => {
  return fetch.get("api/v1/coupon/select-for-store", params);
};
