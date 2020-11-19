import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'

import { IMG_HOST } from '@/config';

import './index.scss'

import { Avatar } from '@/components/common'

export default function NoticeItem(props: any) {

  const { item } = props

  return (
    <View className="notice-item">
      <Avatar imgUrl={IMG_HOST + item.iconUrl} width={70} />
      <View className="content">
        <View className="title-wrap">
          <View className="title">{item.title}</View>
          <View className="time">{item.createTime}</View>
        </View>
        <View className="content-wrap">
          <View className="text">{item.content}</View>
          <View className="num">{item.num}</View>
        </View>
      </View>
    </View>
  )
}

NoticeItem.options = {
  addGlobalClass: true
}

NoticeItem.defaultProps = {
  item: {},
}