import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { IMG_HOST } from '@/config';
import { Avatar } from '@/components/common'
// import Avatar from '@/components/common/avatar'

import './index.scss'

export default function CircleItem(props: any) {

  const { item, width } = props

  const navigateTo = () => {
    if (!item.url) return
    Taro.navigateTo({
      url: item.url
    })
  }

  const style = {
    width: Taro.pxTransform(width),
  }

  return (
    <View className="circle-item" hoverClass="circle-item__hover" style={style} onClick={navigateTo}>
      <Avatar imgUrl={IMG_HOST + item.iconUrl} width={120} />
      <View className="text">{item.name}</View>
    </View>
  )
}

CircleItem.options = {
  addGlobalClass: true
}

CircleItem.defaultProps = {
  item: {},
}