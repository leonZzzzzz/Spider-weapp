import { View } from '@tarojs/components'
import Taro, { useState, useEffect } from '@tarojs/taro'
import './index.scss'

// import Avatar from '@/components/common/avatar'
import { Avatar } from '@/components/common'

function BroadcastWrap(props: any): JSX.Element {

  let { item, type } = props

  let dayCount: number = 86400 // 一天的秒数
  let hoursCount: number = 3600 // 一小时的秒数
  let minutesCount: number = 60 // 一分钟的秒数

  

  // getTime()转为秒数
  const toCount = (time: number): number => parseInt(time / 1000 + '')

  // 获取小时
  const toHours = (count: number): number => {
    return parseInt((count / hoursCount) + '')
  }
  // 获取分钟
  const toMinutes = (count: number): number => {
    return parseInt((count / minutesCount) + '')
  }
  // 获取天数
  const toDays = (count: number): number => {
    return parseInt((count / dayCount) + '')
  }

  const formatTime = (time: string) => {
    let nowTimeCount = new Date().getTime()
    let createTimeCount = new Date(time.replace(/\-/g, '/')).getTime()
    let seconds = toCount(nowTimeCount - createTimeCount)
    let days = toDays(seconds)
    let hours = toHours(seconds)
    let minutes = toMinutes(seconds)
    let timeStr = ''
    if (days > 0) {
      // console.log('days', days)
      timeStr = `${days}天`
    } else if (hours > 0) {
      // console.log('hours', hours)
      timeStr = `${hours}小时`
    } else if (minutes > 0) {
      // console.log('minutes', minutes)
      timeStr = `${minutes}分钟`
    } else {
      // console.log('seconds', seconds)
      timeStr = `${seconds}秒`
    }
    return timeStr
  } 
  // const [ time, setTime ] = useState(() => {
  //   return formatTime(item.createTime)
  //   // if (item.createTime) return formatTime(item.createTime)
  //   // else return ''
  // })
  const [ time, setTime ] = useState('')

  useEffect(() => {
    if (item.createTime) {
      setTime(formatTime(item.createTime))
    }
  }, [item])

  const navigateTo = () => {
    let url = `/pagesMall/group-product/detail/index?id=${item.groupShoppingId}`
    Taro.redirectTo({
      url
    })
  }
  

  return (
    <View className="broadcast-wrap" onClick={navigateTo}>
      <Avatar imgUrl={item.buyerHeader} width={40} />
      <View className="content">{item.buyerName}在{time}前发起了拼团</View>
      <View className="iconfont iyoujiantou" />
    </View>
  )
}

BroadcastWrap.defaultProps = {
  item: {}
}

BroadcastWrap.options = {
  addGlobalClass: true
}

export default BroadcastWrap