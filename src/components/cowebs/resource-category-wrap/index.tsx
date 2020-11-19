// import Taro, { useState } from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import './index.scss';

import { Avatar } from '@/components/common'

import { IMG_HOST } from '@/config';

export default function ResourceCategoryWrap(props: any) {

  const { list, activeIndex, onClickTabs } = props

  const handleTab = (item: any) => {
    onClickTabs && onClickTabs(item)
  }

  return (
    <ScrollView scrollX className="resource-category-wrap">
      {list.length > 0 && list.map((item: any) => {
        return (
          <View className={`item ${activeIndex == item.id ? 'item-active' : ''}`} key={item.id} onClick={() => handleTab(item)}>
            {item.iconUrl &&
              // <Text className={`qcfont ${item.icon} ${item.color}`} />
              <Avatar imgUrl={IMG_HOST + item.iconUrl}  />
            }
            <Text>{item.name}</Text>
          </View>
        )
      })}
    </ScrollView>
  )
}

ResourceCategoryWrap.options = {
  addGlobalClass: true
}

ResourceCategoryWrap.defaultProps = {
  list: [],
  activeIndex: 0,
}