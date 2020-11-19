import { View, Text } from '@tarojs/components'
import './index.scss'

import { useState, useEffect } from '@tarojs/taro'

// import CountDown from '@/components/mall/count-down'
import { CountDown } from '@/components/mall'

import util from '@/utils/util'

function AssemblePriceWrap(props: any): JSX.Element {

  let { price, endTime, num, origPrice, tag, onEnd } = props

  let dayTimeStamp: number = 86400000

  // console.log(props)

  const [ day, setDay ] = useState(0)

  // endTime
  useEffect(() => {
    if (endTime) getRemainTime(endTime)
  }, [endTime])

  

  const getRemainTime = (endTime: any): void => {
    let endTimeStamp: number = new Date(endTime.replace(/\-/g, '/')).getTime()
    let nowTimeStamp: number = new Date().getTime()
    let timeStamp: number = endTimeStamp - nowTimeStamp

    if (timeStamp > 0) {
      setDay(parseInt((timeStamp / dayTimeStamp) + ''))
    } else {
      handleTimeEnd()
    }
  }

  const handleChangeDay = (val: number) => {
    setDay(val)
  }

  const handleTimeEnd = () => {
    onEnd && onEnd()
  }

  return (
    <View className="vip-price-wrap">
      <View className="time-wrap">
        <Text className="date">距结束还剩{day}天</Text>
        <CountDown endTime={endTime} className="white" showDay={true} onDay={handleChangeDay} onEnd={handleTimeEnd} />
      </View>
      <View className="assemble-price-wrap">
        <View className="price-wrap">
          <Text className="price">{util.filterPrice(price)}</Text>
          {origPrice && origPrice > 0 &&
            <Text className="origin-price">￥{util.filterPrice(origPrice)}</Text>
          }
        </View>
        <View>
          {tag ?
            <Text className="num-tuan">{tag}</Text>
            :
            <Text className="num-tuan">{num}人团</Text>
          }
        </View>
      </View>
    </View>
  )
}

AssemblePriceWrap.options = {
  addGlobalClass: true
}

export default AssemblePriceWrap