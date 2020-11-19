import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

import { IMG_HOST } from '@/config';
import util from '@/utils/util'

function GroupProductItem(props: any): JSX.Element {

  let { item, index, type } = props

  const navigateTo = () => {
    let url = `/pagesMall/product-detail/index?id=${item.id}`
    if (item.groupShoppingId) url = `/pagesMall/group-product/detail/index?id=${item.groupShoppingId}`
    Taro.navigateTo({ 
      url
    })
  }
  
  return ( type === 'scrollX' ?
    <View 
      className={`group-item-scrollX ${index === 0 ? 'm-left' : ''}`}
      onClick={navigateTo}
    >
      <View className="group-box box-shadow">
        <View className="cover">
          <Image src={IMG_HOST + (item.baseId ? item.cover : item.iconUrl)} mode="aspectFill" />
        </View>
        <View className="info-wrap">
          <View className="title">{item.baseId ? item.title : item.name}</View>
          {item.groupShoppingId &&
            <View className="tag">{item.groupQuantity || 0}人团</View>
          }
          <View className="price-wrap">
            <Text className="price">{util.filterPrice(item.groupOrganizerPrice || item.price)}</Text>
            {item.groupShoppingId &&
              <Text className="num">已拼{item.salesQuantity || 0}件</Text>
            }
          </View>
        </View>
      </View>
    </View>
    :
    <View 
      className="group-item"
      onClick={navigateTo}
    >
      <View className="cover">
        <Image src={IMG_HOST + (item.baseId ? item.cover : item.iconUrl)} mode="aspectFill" />
      </View>
      <View className="info-wrap">
        <View className="title">{item.baseId ? item.title : item.name}</View>
        {item.groupShoppingId &&
          <View className="tag">{item.groupQuantity || 0}人团</View>
        }
        <View className="price-wrap">
          <Text className="price">{util.filterPrice(item.groupOrganizerPrice || item.price)}</Text>
          {item.groupShoppingId &&
            <Text className="num">已拼{item.salesQuantity || 0}件</Text>
          }
        </View>
      </View>
    </View>
  )
}

GroupProductItem.defaultProps = {
  item: {},
  index: 0,
  type: 'scrollY'
}

GroupProductItem.options = {
  addGlobalClass: true
}

export default GroupProductItem