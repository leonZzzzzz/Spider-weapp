import { View, Image, Text } from '@tarojs/components';
import Taro, { useCallback } from '@tarojs/taro';
import './index.scss';

import { IMG_HOST } from '@/config';
import util from '@/utils/util';

import { CountDown } from '@/components/mall';

function OrderItem(props: any): JSX.Element {
  let { item, onCancel, onReceiveOrder, index, onEnd } = props;

  const orderStatus = {
    // 已退款
    '-2': '#E53935',
    // 已取消
    '-1': '#E53935',
    // 待支付
    '0': '#ff9c00',
    // 待发货
    '1': '#ff9c00',
    // 已发货
    '2': '#ff9c00',
    // 已收货
    '3': '#4caf50',
    // 退货中
    '4': '#ff9c00',
    // 换货中
    '5': '#ff9c00',
    // 退款中中
    '6': '#ff9c00',
    // 已完成
    '10': '#999999'
  };

  const cancelOrder = () => {
    onCancel && onCancel(item.id);
  };

  const handleReceiveOrder = () => {
    onReceiveOrder && onReceiveOrder(item.id);
  };

  const handleCopyOrderNo = () => {
    Taro.setClipboardData({
      data: item.orderNo
    }).then(res => {
      console.log('res :', res);
    });
  };

  // const handleEnd = () => {
  //   onEnd && onEnd();
  // };

  const handleEnd = useCallback(() => {
    onEnd && onEnd(item.id);
  }, []);

  return (
    <View className='order-item'>
      <View className='top-wrap'>
        <View className='left-text'>
          {item.bizType === 2 && <View className='type-tag pintuan'>拼团</View>}
          {item.bizType === 3 && <View className='type-tag zhuli'>助力</View>}
          <View className='order-no'>
            订单号：
            <Text onLongPress={handleCopyOrderNo}>{item.orderNo}</Text>
          </View>
        </View>
        <View className='grey' style={`color:${orderStatus[item.status]}`}>
          {item.statusName}
        </View>
      </View>

      <View className='middle-wrap' onClick={() => util.navigateTo(`/pagesMall/order/detail/index?id=${item.id}`)}>
        {item.orderItems &&
          item.orderItems.map((goods: any) => {
            return (
              <View className='goods-group' key={goods.id}>
                <View className='cover'>
                  <Image src={IMG_HOST + goods.iconUrl} mode='aspectFill' />
                </View>
                <View className='info-wrap'>
                  <View className='info'>
                    <View className='title'>{goods.name}</View>
                    <View className='unit'>{goods.specs}</View>
                  </View>
                  <View className='price'>{util.filterPrice(goods.price)}</View>
                  <View className='qty'>x{goods.qty}</View>
                </View>
              </View>
            );
          })}

        <View className='qty-wrap'>
          <View>
            <Text className='grey'>共</Text>
            {item.qty}
            <Text className='grey'>件商品</Text>
          </View>
          <View className='order-price'>
            订单金额
            <Text className='price'>{util.filterPrice(item.totalAmount)}</Text>
          </View>
        </View>
      </View>

      <View className='bottom-wrap'>
        <View></View>

        {/* (-2, "已退款") (-1, "已取消") (0, "待支付") (1, "待发货") (2, "已发货") (3, "已收货") (4 "退货中") (5, "换货中") (6, "退款中") (10, "已完成") */}
        {item.status === 0 && (
          <View className='btn-wrap'>
            {item.payStatus !== 3 && (
              <View className='b-item' onClick={cancelOrder}>
                取消订单
              </View>
            )}
            {item.payStatus === 1 && (
              <View
                className='b-item primary'
                onClick={() => util.navigateTo(`/pagesMall/order/detail/index?id=${item.id}`)}>
                支付
                <CountDown endTime={item.expireTime} styles='text' showHour={false} onEnd={handleEnd} />
              </View>
            )}
          </View>
        )}
        {item.status === 1 && (
          <View className='btn-wrap'>
            <View className='b-item' onClick={() => util.navigateTo(`/pagesMall/order/flow/index?id=${item.id}`)}>
              查看状态
            </View>
            <View className='b-item' onClick={() => util.navigateTo(`/pagesMall/after-sale/apply/index?id=${item.id}`)}>
              申请售后
            </View>
          </View>
        )}
        {item.status === 2 && (
          <View className='btn-wrap'>
            <View className='b-item' onClick={() => util.navigateTo(`/pagesMall/order/flow/index?id=${item.id}`)}>
              查看状态
            </View>
            <View className='b-item primary' onClick={handleReceiveOrder}>
              确认收货
            </View>
            <View className='b-item' onClick={() => util.navigateTo(`/pagesMall/after-sale/apply/index?id=${item.id}`)}>
              申请售后
            </View>
          </View>
        )}
        {item.status === 3 && (
          <View className='btn-wrap'>
            {item.evaluateStatus !== -1 && item.evaluateStatus !== 2 && (
              <View className='b-item' onClick={() => util.navigateTo(`/pagesMall/evaluate/post/index?id=${item.id}`)}>
                评价
              </View>
            )}
            <View className='b-item' onClick={() => util.navigateTo(`/pagesMall/order/flow/index?id=${item.id}`)}>
              查看状态
            </View>
            <View className='b-item' onClick={() => util.navigateTo(`/pagesMall/after-sale/apply/index?id=${item.id}`)}>
              申请售后
            </View>
          </View>
        )}
        {item.status === 4 && (
          <View className='btn-wrap'>
            <View
              className='b-item'
              onClick={() => util.navigateTo(`/pagesMall/after-sale/detail/index?id=${item.id}`)}>
              退货详情
            </View>
          </View>
        )}
        {item.status === 5 && (
          <View className='btn-wrap'>
            <View
              className='b-item'
              onClick={() => util.navigateTo(`/pagesMall/after-sale/detail/index?id=${item.id}`)}>
              换货详情
            </View>
          </View>
        )}
        {item.status === 6 && (
          <View className='btn-wrap'>
            <View
              className='b-item'
              onClick={() => util.navigateTo(`/pagesMall/after-sale/detail/index?id=${item.id}`)}>
              退款详情
            </View>
          </View>
        )}

        {/* <View className='btn-wrap'>
          <View className='b-item' onClick={handleEnd}>
            取消订单
          </View>
        </View> */}
      </View>
    </View>
  );
}

OrderItem.defaultProps = {
  item: {},
  onCancel: () => {},
  onReceiveOrder: () => {}
};

OrderItem.options = {
  addGlobalClass: true
};

export default OrderItem;
