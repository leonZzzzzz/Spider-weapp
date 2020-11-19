import fetch from '@/utils/request';

export default {
  // 获取门店列表
  storeList: (params?: any) => fetch.get('api/mall/v1/store/list', params),
  // 拼团商品分页列表
  groupProductPage: (params?: any) => fetch.get('api/mall/v1/groupProduct/page', params),
  // 拼团商品分页详情
  groupProductGet: (params?: any) => fetch.get('api/mall/v1/groupProduct/get', params),
  // 拼团商品项(库存)
  groupProductStock: (params?: any) => fetch.get('api/mall/v1/groupProduct/stock', params),
  // 剩余可拼团次数
  groupProductLeftQuantity: (params?: any) => fetch.get('api/mall/v1/groupProduct/leftQuantity', params),
  // 发起的拼团订单
  listOrganizerOrder: (params?: any) => fetch.get('api/mall/v1/groupOrder/listOrganizerOrder', params),
  // 发起的拼团订单（分页）
  pageOrganizerOrder: (params?: any) => fetch.get('api/mall/v1/groupOrder/pageOrganizerOrder', params),
  // 拼团订单的拼团状况
  groupDetail: (params?: any) => fetch.get('api/mall/v1/groupOrder/groupDetail', params),
  // 拼团订单的拼团状况
  cancelUnGroup: (params?: any) => fetch.post('/api/mall/v1/groupOrder/cancelUnGroup', params),

  // 取消收藏商品
  deleteProductCollection: (params?: any) => fetch.post('api/mall/v1/productCollection/delete', params),
  // 商品收藏列表
  pageProductCollection: (params?: any) => fetch.get('api/mall/v1/productCollection/page', params),

  // 商品类别列表
  listByTypeAndParentId: (params?: any) => fetch.get('api/v1/category/listByTypeAndParentId', params),
  // 根据商品类别的商品分页列表
  pageByCategory: (params?: any) => fetch.get('api/mall/v1/product/pageByCategory', params),
  // 商品分页列表
  productPage: (params?: any) => fetch.get('api/mall/v1/uniteProduct/page', params),
  // 商品分页列表
  productPageByIds: (params?: any) => fetch.get('api/mall/v1/uniteProduct/ids', params),
  // 商品详情
  productGet: (params?: any) => fetch.get('api/mall/v1/product/get', params),
  // 获取商品项(库存)
  productStock: (params?: any) => fetch.get('api/mall/v1/product/stock', params),

  // 收藏列表
  productCollectionPage: (params?: any) => fetch.get('api/mall/v1/productCollection/page', params),
  // 收藏
  productCollectionInsert: (params?: any) => fetch.post('api/mall/v1/productCollection/insert', params),

  /**
   * 获取购物车数量
   */
  getCartNum: (params?: any) => fetch.get('api/mall/v1/cart/get', params),
  // 加入购物车
  addToCart: (params?: any) => fetch.post('api/mall/v1/cart/addToCart', params),
  // 现在购买
  nowBuy: (params?: any) => fetch.post('api/mall/v1/cart/nowBuy', params),
  // 购物车详情
  listOrderItem: (params?: any) => fetch.get('api/mall/v1/cart/listOrderItem', params),
  // 购物车的数量
  cartNums: (params?: any) => fetch.get('api/mall/v1/cart/get', params),
  // 增加购物车中商品的数量
  addCartNum: (params?: any) => fetch.post('api/mall/v1/cart/add', params),
  // 减少购物车中商品的数量
  deducteCartNum: (params?: any) => fetch.post('api/mall/v1/cart/deducte', params),
  // 移除购物车的商品
  cartDelete: (params?: any) => fetch.post('api/mall/v1/cart/delete', params),
  // 订单提交预览
  orderPrepare: (params?: any) => fetch.get('api/mall/v1/order/prepare', params),
  // 订单提交
  orderPrepay: (params?: any) => fetch.post('api/mall/v1/orderPay/prepay', params),
  // 订单提交重试
  orderRetryPrepay: (params?: any) => fetch.post('api/mall/v1/orderPay/retryPrepay', params),
  // 确认支付
  payRequestParameter: (params?: any) => fetch.get('api/v1/wechat/pay_request_parameter', params),
  // 发起支付
  requestPayment: (params?: any) => fetch.requestPayment(params),
  // 获取订单发货单
  getByOrder: (params?: any) => fetch.get('api/mall/v1.2/order-express-bill/get-by-order', params),

  // 团长下单（发起拼团）
  groupOrderOrganize: (params?: any) => fetch.post('api/mall/v1/groupOrder/organize', params),
  // 参团下单（参与拼团）
  groupOrderJoin: (params?: any) => fetch.post('api/mall/v1/groupOrder/join', params),
  // 商品拼团情况
  groupShoppingGetInfo: (params?: any) => fetch.get('api/mall/v1/groupShopping/getInfo', params),
  // 订单参团情况
  groupOrderGroupDetail: (params?: any) => fetch.get('api/mall/v1/groupOrder/groupDetail', params),
  // 拼团订单轮播显示
  listOrganizer: (params?: any) => fetch.get('api/mall/v1/groupOrder/listOrganizer', params),
  // 拼团订单提交预览
  groupOrderPrepare: (params?: any) => fetch.get('api/mall/v1/groupOrder/prepare', params),
  // 拼团订单提交重试
  groupOrderRetryPrepay: (params?: any) => fetch.post('api/mall/v1/groupOrder/retryPrepay', params),
  // 拼团订单分页
  groupOrderPage: (params?: any) => fetch.get('api/mall/v1/groupOrder/page', params),

  // 当前余额
  walletGetAmount: (params?: any) => fetch.get('/api/v1/wallet/getAmount', params),
  // 余额记录
  walletPage: (params?: any) => fetch.get('/api/v1/wallet/pageFlow', params),
  // 收藏总数
  productCollectionGetQuantity: (params?: any) => fetch.get('/api/mall/v1/productCollection/getQuantity', params),
  // 订单数量
  getOrderCount: (params?: any) => fetch.get('api/mall/v1/order/getStatusQuantity', params),

  /**
   * 获取订单列表
   */
  getOrderList: (params?: any) => fetch.get('api/mall/v1/order/page', params),

  /**
   * 获取订单详情
   */
  getOrderDetail: (params?: any) => fetch.get('api/mall/v1/uniteOrder/detail', params),
  // /uniteOrder/detail

  /**
   * 订单取消
   */
  cancelOrder: (params?: any) => fetch.post('api/mall/v1/order/cancel', params),
  /**
   * 订单取消
   */
  receiveOrder: (params?: any) => fetch.post('api/mall/v1/order/receive', params),

  /**
   * 售后
   */
  /**
   * 申请退款
   */
  refundApply: (params?: any) => fetch.json('api/mall/v1/after-sale/refund/apply', params),
  /**
   * 获取退款原因
   */
  refundReasonType: (params?: any) => fetch.get('api/mall/v1/after-sale/refund/reason-type', params),
  /**
   * 取消退款
   */
  refundCancel: (params?: any) => fetch.post('api/mall/v1/after-sale/refund/cancel', params),

  /**
   * 申请换货
   */
  exchangeGoodsApply: (params?: any) => fetch.json('api/mall/v1/after-sale/exchange-goods/apply', params),
  /**
   * 获取换货原因
   */
  exchangeGoodsReasonType: (params?: any) => fetch.get('api/mall/v1/after-sale/exchange-goods/reason-type', params),
  /**
   * 取消换货
   */
  exchangeGoodsCancel: (params?: any) => fetch.post('api/mall/v1/after-sale/exchange-goods/cancel', params),
  /**
   * 上传快递单
   */
  exchangeGoodsUploadExpressBill: (params?: any) =>
    fetch.post('api/mall/v1/after-sale/exchange-goods/upload-express-bill', params),

  /**
   * 申请退货
   */
  returnGoodsApply: (params?: any) => fetch.json('api/mall/v1/after-sale/return-goods/apply', params),
  /**
   * 获取退货原因
   */
  returnGoodsReasonType: (params?: any) => fetch.get('api/mall/v1/after-sale/return-goods/reason-type', params),
  /**
   * 取消退货
   */
  returnGoodsCancel: (params?: any) => fetch.post('api/mall/v1/after-sale/return-goods/cancel', params),
  /**
   * 上传快递单
   */
  returnGoodsUploadExpressBill: (params?: any) =>
    fetch.post('api/mall/v1/after-sale/return-goods/upload-express-bill', params),
  /**
   *  获取订单已冻结的售后数量
   */
  calculateFrozenQuantity: (params?: any) => fetch.get('api/mall/v1/after-sale/calculate-frozen-quantity', params),

  /**
   *  获取订单发货单
   */
  getOrderExpressBill: (params?: any) => fetch.get('api/mall/v1/order-express-bill/get-by-order', params),

  /**
   * 售后订单列表
   */
  afterSalePage: (params?: any) => fetch.get('api/mall/v1/after-sale/page', params),
  /**
   * 售后订单详情
   */
  afterSaleGet: (params?: any) => fetch.get('api/mall/v1/after-sale/get', params),

  /**
   * 申请赔付
   */
  applyOrderCompensation: (params?: any) => fetch.post('api/mall/v1/order-compensation/apply', params),

  /**
   * 取消赔付
   */
  cancelOrderCompensation: (params?: any) => fetch.post('api/mall/v1/order-compensation/cancel', params),

  /**
   *  获取赔付原因类型
   */
  getOrderCompensationReasonType: (params?: any) => fetch.get('api/mall/v1/order-compensation/reason-type', params),

  /**
   *  查看订单赔付记录
   */
  getOrderCompensationList: (params?: any) => fetch.get('api/mall/v1/order-compensation/list-by-order', params),

  /**
   *  获取订单赔付状态
   */
  getOrderCompensationStatus: (params?: any) => fetch.get('api/mall/v1/order/get-compensation-status', params),

  /**
   * 发起退换货
   */
  postAfterSales: (params?: any) => fetch.json('api/mall/v1/orderAfterSales/insert', params),

  /**
   *  退换货订单详情
   */
  getAfterSalesDetail: (params?: any) => fetch.get('api/mall/v1/orderAfterSales/get', params),

  /**
   * 录入快递单信息
   */
  postExpressBill: (params?: any) => fetch.post('api/mall/v1/orderAfterSales/saveCourier', params),

  /**
   * 换货订单确认收货
   */
  confirmReceipt: (params?: any) => fetch.post('api/mall/v1/orderAfterSales/confirmReceipt', params),

  /**
   *  获取商品评价列表
   */
  getProductEvaluate: (params?: any) => fetch.get('api/mall/v1/productEvaluate/page', params),

  /**
   *  获取精选的商品评价列表
   */
  getChosenEvaluate: (params?: any) => fetch.get('api/mall/v1/productEvaluate/chosenList', params),

  /**
   *  获取商品评价汇总数据
   */
  getProductEvaluateInfo: (params?: any) => fetch.get('api/mall/v1/productEvaluate/sumNumsByProductId', params),

  /**
   *  获取需要评价的商品列表
   */
  getListForEvaluation: (params?: any) => fetch.get('api/mall/v1/productEvaluate/listForEvaluation', params),

  /**
   *  发布商品评价
   */
  insertProductEvaluate: (params?: any) => fetch.json('api/mall/v1/productEvaluate/insert', params),

  /**
   *  删除商品评价
   */
  deleteProductEvaluate: (params?: any) => fetch.post('api/mall/v1/productEvaluate/delete', params),

  /**
   *  订单状态流
   */
  getOrderFlowList: (params?: any) => fetch.get('api/mall/v1/orderFlow/list', params),

  /**
   * 获取收藏列表
   */
  getCollectionList: (params?: any) => fetch.get('api/mall/v1/productCollection/page', params),

  /**
   * 添加到收藏
   */
  addCollection: (params?: any) => fetch.post('api/mall/v1/productCollection/insert', params),

  /**
   * 删除收藏
   */
  delCollection: (params?: any) => fetch.post('api/mall/v1/productCollection/deleteByProduct', params),

  /**
   * 助力购
   */
  // 助力商品分页列表
  helpProductPage: (params?: any) => fetch.get('api/mall/v1/helpProduct/page', params),
  // 助力商品详情
  helpProductGet: (params?: any) => fetch.get('api/mall/v1/helpProduct/get', params),
  // 助力商品项(库存)
  helpProductStock: (params?: any) => fetch.get('api/mall/v1/helpProduct/stock', params),
  // 助力订单（分页）
  helpOrderPage: (params?: any) => fetch.get('api/mall/v1/helpOrder/page', params),
  // 助力订单的助力状况
  helpOrderHelpDetail: (params?: any) => fetch.get('api/mall/v1/helpOrder/helpDetail', params),
  // 订单提交预览
  helpOrderPrepare: (params?: any) => fetch.get('api/mall/v1/helpOrder/prepare', params),
  // 订单助力情况
  helpDetail: (params?: any) => fetch.get('api/mall/v1/helpOrder/helpDetail', params),
  // 助力
  help: (params?: any) => fetch.post('api/mall/v1/helpOrder/help', params),
  // 下单
  helpOrderOrganize: (params?: any) => fetch.post('api/mall/v1/helpOrder/organize', params),
  /**
   * 助力购
   */

  /**
   * 拼团商品分享海报
   */
  createGroupShoppingPoster: (params?: any) => fetch.get('api/mall/v1/productPoster/createGroupShoppingPoster', params)
};
