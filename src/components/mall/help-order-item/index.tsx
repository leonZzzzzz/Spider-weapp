import { View, Image, Button } from '@tarojs/components';
import Taro, { useCallback } from '@tarojs/taro';
import './index.scss';

// import CountDown from '@/components/mall/count-down'
import { CountDown } from '@/components/mall';

import util from '@/utils/util';
import { IMG_HOST } from '@/config';

function HelpOrderItem(props: any): JSX.Element {
  let { item, onShowQrcode, onEnd } = props;

  const handleShow = () => {
    onShowQrcode && onShowQrcode(item.id);
  };

  // const handleEnd = () => {
  //   onEnd && onEnd()
  // }
  const handleEnd = useCallback(() => {
    onEnd && onEnd(item.id);
  }, []);

  return (
    <View className='help-order-item'>
      <View className='top-wrap'>
        <View>订单号：{item.orderNo}</View>

        <View className={`${item.helpStatus === 2 ? 'yellow' : 'grey'}`}>{item.helpStatusName}</View>
      </View>
      <View className='middle-wrap'>
        {item.helpStatus === 2 && item.status === 10 && <View className='qcfont qc-icon-yihexiao'></View>}
        <View className='goods-group'>
          <View className='cover'>
            <Image src={IMG_HOST + item.orderItems[0].iconUrl} mode='aspectFill' />
          </View>
          <View className='info-wrap'>
            <View className='info'>
              <View className='title'>{item.name}</View>
            </View>
            <View className='price-wrap'>
              <View className='price'>{util.filterPrice(item.totalAmount)}</View>
              <View className='cancel'>{item.statusName}</View>
            </View>
          </View>
        </View>
      </View>
      <View className='bottom-wrap'>
        <View />

        {item.helpStatus !== -1 && (
          <View className='btn-wrap'>
            {item.payStatus !== 1 && item.status !== 10 && (
              <Button
                plain
                className='b-item'
                openType='share'
                data-title={item.orderItems[0].name}
                data-coverUrl={item.orderItems[0].iconUrl}
                data-id={item.id}>
                分享
              </Button>
            )}
            {item.payStatus === 1 ? (
              <Button
                className='b-item primary'
                onClick={() => util.navigateTo(`/pagesMall/order/detail/index?id=${item.id}`)}>
                支付
                <CountDown endTime={item.expireTime} styles='text' showHour={false} onEnd={handleEnd} />
              </Button>
            ) : (
              <Button
                plain
                className='b-item'
                onClick={() => util.navigateTo(`/pagesMall/firend-help/index?id=${item.id}`)}>
                查看详情
              </Button>
            )}
            {item.helpStatus === 2 && item.status !== 10 && (
              <Button plain className='b-item primary' onClick={handleShow}>
                核销
              </Button>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

HelpOrderItem.defaultProps = {
  item: {}
};

HelpOrderItem.options = {
  addGlobalClass: true
};

export default HelpOrderItem;
