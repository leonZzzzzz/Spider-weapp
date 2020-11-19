import Taro from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'

import { IMG_HOST } from '@/config';

import Utils from '@/utils/util'

import './index.scss'

export default function CouponItem(props: any) {

  const { item, index } = props;

  return (
    <View className='item' key={item.id}>
      <Image className='item-headImage' src={item.headImage || `${IMG_HOST}/static/avatar.png`}></Image>
      <View className='item-info'>
        <View className='item-info__name'>
          <Text>{item.donator}</Text>
          <Text className='item-info__name__tag'>{item.title}</Text>
        </View>
        <View className='item-info__time'>{Utils.formatDateStr(item.createTime, 'minute')}</View>
      </View>
      <View className="item-right">￥{Utils.filterPrice(item.amount)}</View>
    </View>
  )
}

CouponItem.options = {
  addGlobalClass: true
}

CouponItem.defaultProps = {
  item: {},
}