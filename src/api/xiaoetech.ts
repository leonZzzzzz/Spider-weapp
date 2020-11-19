import fetch from '@/utils/request';

export default {
  /**
   * 课程会员
   */
  // 列表
  courseVipPage: (params?: any) => fetch.get('api/v1/xiaoe-tech/course-vip/page', params),
  // 详情
  courseVipGet: (params?: any) => fetch.get('api/v1/xiaoe-tech/course-vip/get', params),
  // 查询时长
  goodsQueryPurchase: (params?: any) => fetch.get('api/v1/xiaoe-tech/goods/query-purchase', params),
  // 【测试用】购买
  goodsTestPurchase: (params?: any) => fetch.get('api/v1/xiaoe-tech/goods/test-purchase', params),
  // 下单
  courseVipOrderInsert: (params?: any) => fetch.post('api/v1/xiaoe-tech/course-vip-order/insert', params),
  // 支付
  courseVipOrderPay: (params?: any) => fetch.post('api/v1/xiaoe-tech/course-vip-order/pay', params),
  // 获取课程会员推广码
  sharerQrcodeGetCourseVip: (params?: any) => fetch.get('api/v1/sharer-qrcode/get-course-vip', params),
  // 已购资源数量
  resourceQuantity: (params?: any) => fetch.get('api/v1/xiaoe-tech/resource/quantity', params),
  // 已购资源列表
  resourcePage: (params?: any) => fetch.get('api/v1/xiaoe-tech/resource/page', params),
  // 获取appid和path
  getAppidAndPath: (params?: any) => fetch.get('api/v1/xiaoe-tech/app/get', params)
};
