import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import './index.scss'
import util from '@/utils/util'

export default function OrderItem(props: any) {

  const { item, index } = props

  return (
    <View className={`order-item-box ${index === 0 ? 'p-t' : ''}`}>
      <View className="order-item box-shadow">
        <View className="time-price">
          <View className="time">{item.createTime}</View>
          {item.amount && 
            <View className="price">{util.filterPrice(item.amount)}</View>
          }
        </View>
        <View className="title">{item.orderTitle}</View>
      </View>
    </View>
  )
}

OrderItem.options = {
  addGlobalClass: true
}

OrderItem.defaultProps = {
  item: {},
}