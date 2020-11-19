import Taro, { useState, useDidShow } from '@tarojs/taro';
import { View, Image } from '@tarojs/components'
import './index.scss';

import api from '@/api/cowebs'

import { LogoWrap } from '@/components/common'

import { IMG_HOST, APPID } from '@/config';

export default function Category() {

  const [ list ] = useState([
    {
      img: '/attachments/zixun.png',
      title: '资讯',
      content: '提供信息资讯',
      url: '/pagesCoWebs/information/release/index',
    },
    {
      img: '/attachments/jielong.png',
      title: '接龙',
      content: '活动报名接龙',
      url: '/pagesCoWebs/information/relay/index',
    }
  ])

  useDidShow(() => {

    const getApp = Taro.getApp()
    const params = getApp.$router.params
    if (params.referrerInfo && params.referrerInfo.extraData && params.referrerInfo.extraData.navigateBackMiniProgram) {
      Taro.navigateBack()
    }
  })


  const navigateTo = (url: string) => {
    if (Taro.getStorageSync('releaseValue') === 1) {
      navigateToMiniProgram(url)
      return
    }
    Taro.navigateTo({
      url
    })
  }

  const navigateToMiniProgram = async (url: string) => {
    Taro.showLoading({
      title: '跳转中...',
      mask: true
    })
    try {
      let data: any = Taro.getStorageSync('toMiniProgramParams')
      if (!data.memberId || !data.appId) {
        const res = await api.getMemberIdAndAppId()
        data = res.data.data
        Taro.setStorageSync('toMiniProgramParams', data)
      }
      console.log('getMemberIdAndAppId', data)
      Taro.hideLoading()
      const res = await Taro.navigateToMiniProgram({
        appId: APPID,
        path: `${url}?memberId=${data.memberId}&appId=${data.appId}`,
        // envVersion: 'trial',
        envVersion: 'develop',
      })
      console.log(res)
    } catch(err) {
      console.error(err)
      if (/invalid appid/.test(err.errMsg)) {
        Taro.showToast({
          title: '跳转CoWebs失败，无效的appid',
          icon: 'none'
        })
      }
    }
  }

  return (
    <View className="category">
      <View className="title">请选择您发布的样式</View>
      {list.map((item: any) => {
        return (
          <View className="item" onClick={() => navigateTo(item.url)} >
            <View className="cover">
              <Image src={IMG_HOST + item.img} mode="widthFix" />
            </View>
            <View className="content">
              <View className="title">{item.title}</View>
              <View>{item.content}</View>
            </View>
          </View>
        )
      })}

      <LogoWrap />
    </View>
  )
}