import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

function VipPrice(props: any): JSX.Element {

  let { vipPrice, style } = props

  return (
    <View className="vip-price-vip" style={style}>
      {/* <Text className="iconfont icon-share"></Text> */}
      <Text className="vip">VIP</Text>
      <Text className="price">￥{vipPrice}</Text>
    </View>
  )
}

VipPrice.defaultProps = {
  vipPrice: 0,
  style: {},
}

export default VipPrice