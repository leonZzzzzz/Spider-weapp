import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'

import { IMG_HOST } from '@/config';

import './index.scss'

export default function CouponItem(props: any) {

  const { item, index } = props

  const navigateTo = () => {
    Taro.navigateTo({
      url: `/pagesCoWebs/my/coupon/detail/index?id=${item.id}`
    })
  }

  return (
    <View className={`coupon-item ${index > 0 ? 'news-item-line' : ''}`} onClick={navigateTo}>
      <View className="cover">
        <Image src={IMG_HOST + item.iconUrl} mode="aspectFill" />
      </View>
      <View className="content">
        <View className="name">{item.title}</View>
        <View className="desc-wrap">{item.address}</View>
      </View>
    </View>
  )
}

CouponItem.options = {
  addGlobalClass: true
}

CouponItem.defaultProps = {
  item: {},
}