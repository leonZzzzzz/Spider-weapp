import Taro, { useState, useEffect, useDidShow, useRouter, usePullDownRefresh } from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import { AtAccordion } from 'taro-ui';
import { DividingLine, LoadingBox } from '@/components/common';
import { CountDown } from '@/components/mall';
import { IMG_HOST, HOME_PATH } from '@/config';
import api from '@/api/mall';
import util from '@/utils/util';
import './index.scss';

const statusImg_1 = IMG_HOST + '/attachments/images/status-1.png';
const statusImg0 = IMG_HOST + '/attachments/images/status0.png';
const statusImg1 = IMG_HOST + '/attachments/images/status1.png';
const statusImg3 = IMG_HOST + '/attachments/images/status3.png';

export default function OrderDetail() {
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [isMount, setIsMount] = useState<boolean>(false);
  const [orderInfo, setOrderInfo] = useState<any>({}); // 订单信息
  const [orderItems, setOrderItems] = useState<any[]>([]); // 订单商品列表
  const [orderStatusImgs] = useState<any>({
    // 已退款
    '-2': statusImg_1,
    // 已取消
    '-1': statusImg_1,
    // 待支付
    '0': statusImg0,
    // 待发货
    '1': statusImg1,
    // 已发货
    '2': statusImg1,
    // 已收货
    '3': statusImg3,
    // 退货中
    '4': statusImg1,
    // 换货中
    '5': statusImg1,
    // 退款中
    '6': statusImg1,
    // 已完成
    '10': statusImg_1
  });
  const [orderExpressBill, setOrderExpressBill] = useState<any[]>([]); // 订单部分发货单列表
  const [compensationStatus, setCompensationStatus] = useState<any>({
    // 订单赔付状态
    compensationIsOngoing: false,
    showCompensationApply: false,
    showCompensationHistory: false
  });

  const { id } = useRouter().params;

  useEffect(() => {
    onInitData();
  }, []);

  useDidShow(() => {
    if (!isMount) return;
    onInitData();
  });

  usePullDownRefresh(() => {
    getOrderDetail();
  });

  const onInitData = () => {
    getOrderDetail();
    getOrderExpressBill();
    getOrderCompensationStatus();
  };

  // 获取订单发货单
  const getOrderExpressBill = async () => {
    const res = await api.getOrderExpressBill({ orderId: id });
    const data = res.data.data;
    // for (let item of data) {
    //   item.isOpen = true
    // }
    const _data = data.map((item: any) => {
      item.isOpen = true;
      return item;
    });
    setOrderExpressBill(_data);
  };

  const getOrderCompensationStatus = async () => {
    const res = await api.getOrderCompensationStatus({ orderId: id });
    setCompensationStatus(res.data.data);
  };

  // 获取订单详情
  const getOrderDetail = async () => {
    try {
      const res = await api.getOrderDetail({ id: id });
      const data = res.data.data;
      setOrderInfo(data);
      setOrderItems(data.orderItems);
      setIsMount(true);
      setPageLoading(false);
      Taro.stopPullDownRefresh();
    } catch (err) {
      setIsMount(true);
      setPageLoading(false);
    }
  };

  /**
   * 取消订单
   */
  const cancelOrder = async () => {
    await api.cancelOrder({ id: id });
    util.showToast('取消成功');
    getOrderDetail();
  };

  /**
   * 订单提交重试
   */
  const orderRetryPrepay = async () => {
    const params = {
      id: id,
      merchantType: 3,
      orderToken: orderInfo.orderToken
    };
    try {
      const res = await api.orderRetryPrepay(params);
      const data = res.data.data;
      if (data.needPay) {
        const payParams = {
          token: data.payId
        };
        payRequestParameter(payParams);
      } else {
        setBtnLoading(false);
        util.showLoading(false);
        getOrderDetail();
      }
    } catch (err) {
      setBtnLoading(false);
      // util.showLoading(false);
      getOrderDetail();
    }
  };

  /**
   * 拼团订单提交重试
   */
  const groupOrderRetryPrepay = async () => {
    const params = {
      id: id,
      merchantType: 3,
      orderToken: orderInfo.orderToken
    };
    try {
      const res = await api.groupOrderRetryPrepay(params);
      const data = res.data.data;
      if (data.needPay) {
        const payParams = {
          token: data.payId
        };
        payRequestParameter(payParams);
      } else {
        setBtnLoading(false);
        util.showLoading(false);
        getOrderDetail();
      }
    } catch (err) {
      setBtnLoading(false);
      // util.showLoading(false);
      getOrderDetail();
    }
  };

  /**
   * 获取订单支付参数
   */
  const payRequestParameter = async (payParams: any) => {
    try {
      const payRes = await api.payRequestParameter(payParams);
      const payData = payRes.data.data;
      const params = {
        timeStamp: payData.timeStamp,
        nonceStr: payData.nonceString,
        package: payData.pack,
        signType: payData.signType,
        paySign: payData.paySign
      };
      requestPayment(params);
    } catch (err) {
      setBtnLoading(false);
      // util.showLoading(false);
      getOrderDetail();
    }
  };
  /**
   * 发起支付
   */
  const requestPayment = async (params: any) => {
    try {
      await api.requestPayment(params);
      setBtnLoading(false);
      util.showToast('支付成功');
      getOrderDetail();
    } catch (err) {
      console.log(err);
      util.showToast('取消支付');
      // util.showLoading(false);
      setBtnLoading(false);
      getOrderDetail();
    }
  };

  /**
   * 点击底部按钮
   * @param type cancel 取消，pay 支付，compensate 赔付，
   */
  const onClickAction = async (type: string) => {
    console.log('type', type);
    if (btnLoading) return;

    if (type === 'cancel') {
      const res = await Taro.showModal({
        title: '提示',
        content: '是否取消该订单？'
      });
      if (res.confirm) {
        setBtnLoading(true);
        util.showLoading(true, '提交中');
        cancelOrder();
      }
    } else if (type === 'pay') {
      setBtnLoading(true);
      util.showLoading(true, '发起支付中');
      if (orderInfo.bizType == 1) orderRetryPrepay();
      if (orderInfo.bizType == 2) groupOrderRetryPrepay();
    } else if (type === 'compensate') {
      // 默认跳转申请赔付
      let url = `/pagesMall/after-sale/compensate/index?id=${id}`;
      // 如果是赔付中或者有赔付记录，则跳转赔付记录页面
      if (compensationStatus.compensationIsOngoing || compensationStatus.showCompensationHistory) {
        let canApply = orderInfo.extra.compensationAmount < orderInfo.needPayTotalAmount ? 'yes' : 'no';
        url = `/pagesMall/after-sale/compensate/result/index?id=${id}&canApply=${canApply}`;
      }
      util.navigateTo(url);
    } else if (type === 'home') {
      // 跳转首页
      util.navigateTo(HOME_PATH);
    }
  };

  const onClipboardData = (type: string) => {
    Taro.setClipboardData({
      data: orderInfo[type]
    });
  };

  // 复制订单包裹中的数据
  const onCopyExpressData = (index: number, key: string) => {
    const item = orderExpressBill[index];
    const data = item[key];
    Taro.setClipboardData({ data });
  };

  const goProduct = (item: any) => {
    let productType = '';
    if (orderInfo.bizType === 2) productType = 'group-product/detial';
    else if (orderInfo.bizType === 3) productType = 'firend-help/detial';
    else if (orderInfo.bizType === 1 && item.groupShoppingId) productType = 'group-product/detial';
    else productType = 'product/detail';

    let id = '';
    if (orderInfo.bizType === 2) id = item.groupShoppingId;
    else if (orderInfo.bizType === 3) id = item.helpShoppingId;
    else if (orderInfo.bizType === 1 && item.groupShoppingId) id = item.groupShoppingId;
    else id = item.productId;
    util.navigateTo(`/pagesMall/${productType}/index?id=${id}`);
  };

  return (
    <View className='page-order-detail'>
      <LoadingBox visible={pageLoading} />

      <View className='order-state'>
        <View className='content'>
          <Text>订单</Text>
          <Text>{orderInfo.statusName}</Text>
          {orderInfo.status === 0 && orderInfo.payStatus === 1 && (
            <View className='time'>
              <CountDown
                endTime={orderInfo.expireTime}
                styles='text'
                color='#fe4838'
                showHour={false}
                onEnd={() => {
                  setPageLoading(true);
                  setTimeout(() => {
                    getOrderDetail();
                  }, 5000);
                }}
              />
              后订单自动关闭
            </View>
          )}
        </View>
        <View className='state-img'>
          {orderInfo.id && <Image className='img' src={orderStatusImgs[orderInfo.status]} />}
        </View>
      </View>

      {orderInfo.bizType !== 3 && (
        <View>
          <View className='address-info'>
            <View className='iconfont icon-address' />
            <View className='info-wrapper'>
              <View className='user'>
                <Text>收货人：</Text>
                <Text className='m-r-2'>{orderInfo.receiver}</Text>
                <Text>{orderInfo.mobile}</Text>
              </View>
              {orderInfo.address && (
                <View className='address'>
                  <Text>地址：</Text>
                  <Text>{orderInfo.address}</Text>
                </View>
              )}
            </View>
          </View>
          <DividingLine />
        </View>
      )}

      {orderInfo.remark && (
        <View>
          <DividingLine />
          <View className='cell-item'>
            <View className='cell-item__title'>订单备注</View>
            <View className='cell-item__content'>{orderInfo.remark}</View>
          </View>
        </View>
      )}

      <View className='order-item-list'>
        {orderItems.map((item: any) => {
          return (
            <View className='order-item' key={item.id} onClick={() => goProduct(item)}>
              <View className='cover'>
                {item.iconUrl && <Image className='img' mode='aspectFill' src={IMG_HOST + item.iconUrl} />}
              </View>
              <View className='info'>
                <View className='info__name'>{item.name}</View>
                <View className='info__specs'>{item.specs}</View>
                <View className='info__price'>
                  <View className='price'>￥{util.filterPrice(item.nowPrice)}</View>
                  <View className='qty'>x{item.qty}</View>
                </View>
              </View>
            </View>
          );
        })}

        {orderInfo.id && (
          <View className='statistics'>
            <View className='qty'>
              <Text>共{orderInfo.qty}件商品</Text>
            </View>
            <View className='amount'>
              <Text className='m-r-1'>支付金额</Text>
              <Text>￥{util.filterPrice(orderInfo.needPayTotalAmount)}</Text>
            </View>
          </View>
        )}

        {orderInfo.discountAmount > 0 && (
          <View className='other-info'>
            <Text className='m-r-1'>会员已省</Text>
            <Text>￥{util.filterPrice(orderInfo.discountAmount)}</Text>
          </View>
        )}

        <View className='other-info'>
          {orderInfo.storeCouponPayAmount && (
            <View className='storeCouponPayAmount'>
              优惠券 -￥{util.filterPrice(orderInfo.storeCouponPayAmount)}
            </View>
          )}
          <View className='transportAmount'>
            <Text className='m-r-1'>快递费</Text>
            {orderInfo.transportAmount > 0 ? (
              <Text>￥{util.filterPrice(orderInfo.transportAmount)}</Text>
            ) : (
              <Text>包邮</Text>
            )}
          </View>
        </View>
      </View>

      <DividingLine />

      <View className='order-info'>
        <View className='title'>订单信息</View>
        <View className='list-item'>
          <View>订单编号</View>
          <View>
            <Text className='m-r-1'>{orderInfo.orderNo}</Text>
            {orderInfo.orderNo && (
              <Text className='copy-btn' onClick={() => onClipboardData('orderNo')}>
                复制
              </Text>
            )}
          </View>
        </View>
        <View className='list-item'>
          <View>创建时间</View>
          <View>{orderInfo.createTime}</View>
        </View>

        {orderInfo.logisticsCompany && (
          <View className='list-item'>
            <View>物流配送</View>
            <View>{orderInfo.logisticsCompany}</View>
          </View>
        )}

        {orderInfo.logisticsNo && (
          <View className='list-item'>
            <View>物流单号</View>
            <View>
              <Text className='m-r-1'>{orderInfo.logisticsNo}</Text>
              <Text className='copy-btn' onClick={() => onClipboardData('logisticsNo')}>
                复制
              </Text>
            </View>
          </View>
        )}

        {orderInfo.deliverTime && (
          <View className='list-item'>
            <View>发货时间</View>
            <View>{orderInfo.deliverTime}</View>
          </View>
        )}
      </View>

      <DividingLine />

      {orderExpressBill.length > 0 &&
        orderExpressBill.map((item, index) => {
          return (
            <AtAccordion
              className='order-accordion'
              open={item.isOpen}
              hasBorder
              onClick={() => {
                setOrderExpressBill(prev => {
                  prev[index].isOpen = !prev[index].isOpen;
                  return [...prev];
                });
              }}
              title={`包裹 ${index + 1}`}
              key={item.id}>
              <View className='order-item-list accordion'>
                {item.items.map((pItem: any) => {
                  return (
                    <View
                      className='order-item'
                      key={pItem.id}
                      onClick={() => util.navigateTo(`/pagesMall/product-detail/index?id=${pItem.productId}`)}>
                      <View className='cover'>
                        {pItem.icon && <Image className='img' mode='aspectFill' src={IMG_HOST + pItem.icon} />}
                      </View>
                      <View className='info'>
                        <View className='info__name'>{pItem.name}</View>
                        <View className='info__specs'>{pItem.spec}</View>
                        <View className='info__price'>
                          <View className='qty'>x{pItem.quantity}</View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
              <View className='info-list'>
                {item.expressCompany && (
                  <View className='list-item'>
                    <View>物流配送</View>
                    <View>{item.expressCompany}</View>
                  </View>
                )}
                {item.expressNumber && (
                  <View className='list-item'>
                    <View>物流单号</View>
                    <View>
                      <Text className='m-r-1'>{item.expressNumber}</Text>
                      <Text className='copy-btn' onClick={() => onCopyExpressData(index, 'expressNumber')}>
                        复制
                      </Text>
                    </View>
                  </View>
                )}
                {item.deliverTime && (
                  <View className='list-item'>
                    <View>发货时间</View>
                    <View>{item.deliverTime}</View>
                  </View>
                )}
              </View>
            </AtAccordion>
          );
        })}

      <DividingLine />

      {orderInfo.status !== 0 ? (
        <View className='bottom-wrapper'>
          {orderInfo.bizType !== 2 && compensationStatus.showCompensationApply && (
            <View className='action-btn' onClick={() => onClickAction('compensate')}>
              申请赔付
            </View>
          )}
          {compensationStatus.compensationIsOngoing && <View className='action-btn no-border'>赔付中...</View>}
          {compensationStatus.showCompensationHistory && (
            <View className='action-btn' onClick={() => onClickAction('compensate')}>
              赔付详情
            </View>
          )}
          <View className='action-btn' onClick={() => onClickAction('home')}>
            返回首页
          </View>
        </View>
      ) : (
        <View className='bottom-wrapper'>
          <View className='action-btn' onClick={() => onClickAction('home')}>
            返回首页
          </View>
          {orderInfo.payStatus !== 3 && (
            <View className='action-btn' onClick={() => onClickAction('cancel')}>
              取消订单
            </View>
          )}
          {orderInfo.payStatus === 1 && (
            <View className='action-btn primary' onClick={() => onClickAction('pay')}>
              支付
            </View>
          )}
        </View>
      )}
    </View>
  );
}

OrderDetail.config = {
  navigationBarTitleText: '订单详情',
  enablePullDownRefresh: true
};
