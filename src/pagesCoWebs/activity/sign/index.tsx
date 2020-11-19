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
    let res = await api.activitySignMembers({ sourceId: id })

    setList(res.data.data.list)
    // this.setPageLoading(false)
    Taro.stopPullDownRefresh()
  }

  return (
    <View className="sign">
      {/* <LoadingBox visible={pageLoading} /> */}

      <View className="sign-title">已报名({signNum}/{maxNum})</View>
      <View className="list relative">
        {list.map((item: any) => {
          return (
            <View className="item" key={item.id}>
              <Avatar imgUrl={item.headImage} width={100} />
              <View className="msg">
                <View className="header">
                  <Text></Text>
                  <Text>{item.signTimeStr}</Text>
                </View>
                <View className="content">
                  {item.signDataList.map((sign: any) => {
                    return sign.name === '姓名' ?
                      <Text className="name" key={sign.id}>{sign.value}</Text>
                      : sign.name == '手机' ?
                      <Text key={sign.id}>{sign.value}</Text>
                      : sign.type == 7 ?
                      <Text key={sign.id}></Text>
                      : sign.value && sign.name !== '' ?
                      <Text key={sign.id}>{sign.value}</Text>
                      : ''
                  })}
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
