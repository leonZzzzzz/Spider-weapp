import Taro, { useState, useEffect } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import './index.scss'

import api from '@/api/cowebs'
import { LoadingBox, LogoWrap, QcEmptyPage, PointList, ContentWrap } from '@/components/common'
import { IMG_HOST } from '@/config';
export default function Index() {
  const [pageLoading, setPageLoading] = useState(true)
  const [ruleModel, setRuleModel] = useState(false)
  const [detail, setDetail] = useState({})
  const [points, setPoints] = useState('')
  const [member, setMember] = useState({})

  useEffect(() => {
    punchStatus()
    pointTotal()
    const memberInfo = Taro.getStorageSync('memberInfo');
    setMember(memberInfo);
  }, [])
  const punchStatus = async () => {
    const res = await api.punchStatus()
    setDetail(res.data.data)
    setPageLoading(false)
  }
  // 总积分
  const pointTotal = async () => {
    const res = await api.pointTotal()
    setPoints(res.data.data.amount)
  }
  const punchClock = async () => {
    const res = await api.punchClock()
    if (res.data.code == 20000) {
      setRuleModel(true)
      punchStatus()
      pointTotal()
    }
  }



  return (
    <View >
      <LoadingBox visible={pageLoading} />
      {/* 规则 */}
      {ruleModel && (
        <View className='rule-model'>
          <View className='track'></View>
          <View className='rule-content'>
            <Image src={IMG_HOST + '/attachments/null/3bed5bf79d574430b345e5dcd001e084.png'}></Image>
            <View className='punchsuccess one'>签到成功奖励</View>
            <View className='punchsuccess two'><Text style='font-size:30px;font-weight:bold;margin-right:6px'>+{detail.dailySignInPoint}</Text>积分</View>
            <View className='punchsuccess four'>累计金币可换购活动、课程或商品哦</View>
            <View className='punchsuccess three'>
              <Text onClick={() => { setRuleModel(false) }}>我知道啦</Text>
            </View>
          </View>
          {/* <Text className="qcfont qc-icon-guanbi close_model" onClick={() => { setRuleModel(false) }} /> */}
        </View>
      )}

      <View className='punch'>
        <Image className='avatar' src={member.headImage}></Image>
        <View className='punch-day'>
          <View>已连续签到<Text>{detail.consecutiveDays}</Text>天</View>
          <Text>明日签到可得{detail.dailySignInPoint}积分</Text>
        </View>
        <View className='icon'>
          <Image src={IMG_HOST + '/attachments/null/34757a9501d44602a8dd3791f5eba5b2.png'}></Image>
          <Text>{points}</Text>
        </View>
      </View>
      <View className='floating'>
        <View>连续签到领积分</View>
        <Text onClick={punchClock}>{detail.signIn ? '已签到' : '签到'}</Text>
      </View>

      <View>
        {/* <View>积分大换购</View> */}
        <View>

        </View>
      </View>
      <LogoWrap />
    </View >
  )
}

Index.config = {
  navigationBarTitleText: '每日签到',
  navigationBarBackgroundColor: "#f6e9cd",
  navigationBarTextStyle: "black",
}