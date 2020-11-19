import { View, Image, Button } from '@tarojs/components';
import Taro, { useCallback } from '@tarojs/taro';
import './index.scss';

// import CountDown from '@/components/mall/count-down'
import { CountDown } from '@/components/mall';

import util from '@/utils/util';
import { IMG_HOST } from '@/config';

export default function GroupOrderItem(props: any) {
  let { item, onEnd } = props;

  const navigateTo = (url: string) => {
    Taro.navigateTo({
      url
    });
  };

  // const handleEnd = () => {
  //   onEnd && onEnd()
  // }
  const handleEnd = useCallback(() => {
    onEnd && onEnd(item.id);
  }, []);

  return (
    <View className='group-order-item'>
      <View className='top-wrap'>
        <View>订单号：{item.orderNo}</View>
        <View className={`${item.groupStatusName === '拼团进行中' ? 'yellow' : 'grey'}`}>{item.groupStatusName}</View>
      </View>

      <View className='middle-wrap'>
        <View className='goods-group'>
          {item.organizer && (
            <View className='tag'>
              <Image src={IMG_HOST + '/attachments/images/tz-tag.png'} mode='widthFix' />
            </View>
          )}
          <View className='cover'>
            <Image src={IMG_HOST + item.orderItems[0].iconUrl} mode='aspectFill' />
          </View>
          <View className='info-wrap'>
            <View className='info'>
              <View className='title'>{item.orderItems[0].name}</View>
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

        {item.groupStatus !== -1 && (
          <View className='btn-wrap'>
            {item.payStatus !== 1 && (
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
                onClick={() => navigateTo(`/pagesMall/order/detail/index?id=${item.id}`)}>
                支付
                <CountDown endTime={item.expireTime} styles='text' showHour={false} onEnd={handleEnd} />
              </Button>
            ) : (
              <Button plain className='b-item' onClick={() => navigateTo(`/pagesMall/join-group/index?id=${item.id}`)}>
                查看详情
              </Button>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

GroupOrderItem.defaultProps = {
  item: {}
};

GroupOrderItem.options = {
  addGlobalClass: true
};
