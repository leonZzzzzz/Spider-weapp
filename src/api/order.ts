import fetch from "@/utils/request";

/**
 * 订单预览
 * orderItemIds 商品的id 多个用_连接
 */
export const getOrderPreview = (orderItemIds: string) => {
  return fetch.get("api/mall/v1/order/prepare", {
    orderItemIds
  });
};
/**
 * 订单购买
 */
export const postOrder = (params: any) => {
  return fetch.post("api/mall/v1/orderPay/prepay", params);
};
/**
 * 订单重新购买
 */
export const postResOrder = (params: any) => {
  return fetch.post("api/mall/v1/orderPay/retryPrepay", params);
};
// 微信支付
export const wechatPay = (params: any) => {
  return fetch.get("api/v1/wechat/pay_request_parameter", params);
};
/**
 * 订单列表
 */
export const pageOrder = (params: any) => {
  return fetch.get("api/mall/v1/order/page", params);
};
/**
 * 订单详情
 */
export const getOrder = (params: any) => {
  return fetch.get("api/mall/v1/order/detail", params);
};
/**
 * 订单取消
 */
export const cancelOrder = (params: any) => {
  return fetch.post("api/mall/v1/order/cancel", params);
};
/**
 * 订单完成
 */
export const finishOrder = (params: any) => {
  return fetch.post("api/mall/v1/order/finish", params);
};
/**
 * 获取订单超时时间
 */
export const shopOrderCancelTime = () => {
  return fetch.get("api/v1/config/shopOrderCancelTime");
};
/**
 * 订单状态统计
 */
export const getOrderStatus = () => {
  return fetch.get("api/mall/v1/order/getStatusQuantity");
};
