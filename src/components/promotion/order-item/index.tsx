import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { IMG_HOST } from '@/config';
import util from '@/utils/util'
import './index.scss'

import { Avatar } from '@/components/common'

const status = {
  'ongoing': '待奖励',
  'cancel': '已失效',
  'finish': '已奖励',
}

export default function OrderItem(props: any) {
  const { item, index } = props

  return (
    <View className={`p-order-item ${index > 0 ? 'top-line' : ''}`}>
      <View className="user-wrap">
        <Avatar imgUrl={item.headImage} width={60} />
        <View className="user">
          <View className="name">{item.appellation}</View>
          <View className="time">{item.createTime}</View>
        </View>
        {/* <View className={`status ${item.status}`}>{item.status === 'ongoing' ? '待奖励' : item.status === 'cancel' ? '已失效' : item.status === 'finish' ? '已奖励' : ''}</View> */}
        <View className={`status ${item.status}`}>{status[item.status]}</View>
      </View>
      <View className="info-wrap">
        <View className="cover">
          <Image src={IMG_HOST + item.fromOrderUrl} mode="aspectFill" />
        </View>
        <View className="right">
          <View className="title">{item.fromOrderTitle}</View>
          <View className="amount">￥{util.filterPrice(item.amount)}</View>
        </View>
      </View>
    </View>
  )
}


OrderItem.defaultProps = {
  item: {},
  type: '',
}

OrderItem.options = {
  addGlobalClass: true
}