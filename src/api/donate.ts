import fetch from '@/utils/request';

export default {

  /**
 * 获取父分类
 */
  getCategorys: (parentId: string = '') => {
    return fetch.get('api/v1/category/listByTypeAndParentId', {
      type: 111,
      parentId
    })
  },

  /**
   * 捐款协议列表
   * 文档 http://xyj.wego168.com/xiaoyaoji/doc/2o6gy6pKkL
   */
  donateAgreementPage: (params?: any) => fetch.get('api/v1/agreement/donate', params),
  // 协议详情
  donateAgreementDetail: (params?: any) => fetch.get('api/v1/agreement/get', params),

  /**
   * 首页捐款名单
   * 文档 http://xyj.wego168.com/xiaoyaoji/doc/2noP8W8xQv
   */
  donateOrderPage: (params?: any) => fetch.get('api/v1.1/donate-order/app-page', params),

  /**
   * 捐款活动列表
   * 文档 http://xyj.wego168.com/xiaoyaoji/doc/2nn4tFGFrm
   * @param categoryId 分类ID 不传查所有
   */
  donatePage: (params?: any) => fetch.get('api/v1.1/donate/page', params),

  /**
   * 捐款活动详情
   * @param id
   */
  donateDetail: (params?: any) => fetch.get('api/v1.1/donate/get', params),

  /**
   * 活动详情 的捐款名单
   * @param activityId
   */
  donateDetailOrderPage: (params?: any) => fetch.get('api/v1.1/donate-order/activity-page', params),

  /**
   * 我的捐款记录
   */
  donateMyOrderPage: (params?: any) => fetch.get('api/v1.1/donate-order/my-page', params),
  /**
   * 我的捐款总览
   */
  donateMyOrderSummary: (params?: any) => fetch.get('api/v1.1/donate-order/summary', params),

  /**
   * 捐款下单
   */
  donateOrderInsert: (params?: any) => fetch.json('api/v1.1/donate-order/insert', params),

  /**
   * 捐款订单支付
   * @param orderId
   */
  donateOrderPay: (params?: any) => fetch.post('api/v1.1/donate-order/pay', params),
  
  // 发起支付
  requestPayment: (params?: any) => fetch.requestPayment(params),
};
