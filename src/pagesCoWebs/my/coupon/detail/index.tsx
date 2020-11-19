import { View, Text, Image } from '@tarojs/components'
import Taro, { useState, useEffect, useRouter } from '@tarojs/taro'
import api from '@/api/cowebs'
import { IMG_HOST } from '@/config';
import './index.scss'

import { LoadingBox, ContentWrap, LogoWrap } from '@/components/common'

export default function Detail() {

  const [ pageLoading, setPageLoading ] = useState(true)
  const [ detail, setDetail ] = useState<any>({})

  const { id } = useRouter().params

  useEffect(() => {
    welfareGet()
  }, [])

  const welfareGet = async () => {
    const res = await api.welfareGet({ id })
    setDetail(res.data.data)
    setPageLoading(false)
  }

  return (
    <View className="detail">

      <LoadingBox visible={pageLoading} />
      <View className="relative">
        <View className="cover">
          <Image src={IMG_HOST + detail.iconUrl} mode="widthFix" />
        </View>
        <View className="title-wrap">
          <View className="title">{detail.title}</View>
        </View>
        <View className="desc">
          <View className="item">
            <Text className="qcfont qc-icon-didian3" />
            <Text>{detail.address}</Text>
          </View>
          <View className="item">
            <Text className="qcfont qc-icon-shouji" />
            <Text>{detail.phone}</Text>
          </View>
        </View>
      </View>
      <ContentWrap content={detail.content} />
      <LogoWrap />
    </View>
  )
}

Detail.config = {
  navigationBarTitleText: '新闻详情',
}