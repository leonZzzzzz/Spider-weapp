import Taro from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import './index.scss'

// import CountDown from '@/components/mall/count-down'
import { CountDown } from '@/components/mall'

function CantuanItem(props: any): JSX.Element {

  let { item, index, onJoin, type, onCountDownEnd } = props

  const handleJoin = () => {
    onJoin && onJoin('group', item.organizeOrderId)
  }

  const handleEnd = () => {
    onCountDownEnd && onCountDownEnd()
  }

  return (
    <View 
      className={`cantuan-item ${index !== 0 ? 'top-line': ''}`}
    >
      <View className="left">
        <View className="head-img">
          <Image src={item.buyerHeader} mode="widthFix"></Image>
        </View>
        <View className="info-wrap">
          <View className="name">
            <Text>{item.buyerName}</Text>
            {type === 'page' &&
              <View className="mini-num">
                还差
                <Text className="red">{item.groupNeedQuantity}</Text>
                人
              </View> 
            }
          </View>
          <View className="info">
            {!type &&
              <View style="margin-right: 10px;">
                还差
                <Text className="red">{item.groupNeedQuantity}</Text>
                人
              </View> 
            }
            <View>
              剩余
              <CountDown endTime={item.expireTime || item.groupExpireTime} color="#ff960d" styles="text" onEnd={handleEnd} />
              结束
            </View>
          </View>
        </View>
      </View>
      <View className="right" onClick={handleJoin}>
        <View className="tuan">去参团</View>
      </View>
    </View>
  )
}

CantuanItem.defaultProps = {
  item: {},
  index: null,
  onJoin: () => {}
}

CantuanItem.options = {
  addGlobalClass: true
}

export default CantuanItem
