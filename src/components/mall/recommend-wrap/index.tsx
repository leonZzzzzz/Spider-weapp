import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import './index.scss'
import util from '@/utils/util'

// import GroupProductItem from '@/components/mall/group-product-item'
import { GroupProductItem } from '@/components/mall'


function RecommendWrap(props: any): JSX.Element {
  
  let { title, url, list } = props
  
  function toMore() {
    if (!url) return
    util.navigateTo(url)
  }

  return (
    <View className="recommend-wrap">
      <View className="recommend-title-wrap">
        <View>{title}</View>
        <View className="more" onClick={toMore}>
          <Text>更多</Text>
          <Text className="qcfont qc-icon-chevron-right"></Text>
        </View>
      </View>
      <ScrollView className="list" scrollX>
        {list.length && list.map((item: any, index: number) => {
          return <GroupProductItem item={item} index={index} key={item.id} type="scrollX" />
        })}
      </ScrollView>
    </View>
  )
}

RecommendWrap.defaultProps = {
  title: '推荐商品',
  list: [],
  url: '',
}

RecommendWrap.options = {
  addGlobalClass: true
}

export default RecommendWrap