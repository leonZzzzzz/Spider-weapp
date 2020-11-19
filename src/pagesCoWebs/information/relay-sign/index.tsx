import Taro, { useState, useEffect, useRouter, usePullDownRefresh } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'

import './index.scss'

import api from '@/api/cowebs'
import { Avatar, LogoWrap } from '@/components/common'

export default function ActivitySign() {


  const [ list, setList ] = useState([])

  const { id, signNum, maxNum } = useRouter().params

  useEffect(() => {
    signMembers()
  }, [])

  usePullDownRefresh(() => {
    signMembers()
  })

  const signMembers = async () => {
    let res = await api.myActivitySign({ sourceId: id })

    setList(res.data.data.list)
    // this.setPageLoading(false)
    Taro.stopPullDownRefresh()
  }

  return (
    <View className="sign relative">
      {/* <LoadingBox visible={pageLoading} /> */}

      <View className="sign-title">已报名({signNum}/{maxNum})</View>
      <View className="list">
        {list.map((item: any) => {
          return (
            <View className="item" key={item.id}>
              <Avatar imgUrl={item.headImage} width={100} />
              <View className="msg">
                <View className="header">
                  <Text>{item.username}</Text>
                  <Text className="time">{item.signTimeStr}</Text>
                </View>
                <View className="content">
                  <Text>{/-\/-/.test(item.className) ? item.className.replace('-/-', '-') : item.className || '无'}</Text>
                </View>
              </View>
            </View>
          )
        })}
        
      </View>

      <LogoWrap />
    </View>
  )
  
}

ActivitySign.config = {
  navigationBarTitleText: '报名列表',
  enablePullDownRefresh: true,
}
