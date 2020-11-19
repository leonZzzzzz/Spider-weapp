import Taro, { useState, useEffect } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './index.scss'

import api from '@/api/cowebs'
import { LoadingBox, LogoWrap, ContentWrap } from '@/components/common'

export default function Index() {
  const [ pageLoading, setPageLoading ] = useState(true)
  const [ detail, setDetail ] = useState<any>({})

  useEffect(() => {
    getAboutUs()
  }, [])

  const getAboutUs = async () => {
    const res = await api.getAboutUs()
    setDetail(res.data.data)
    setPageLoading(false)
  }

  return (
    <View>
      <LoadingBox visible={pageLoading} />
      <View className="relative">
        <ContentWrap content={detail.content} styles={{padding: 0}} />
      </View>
      <LogoWrap />
    </View>
  )
}

Index.config = {
  navigationBarTitleText: '关于我们'
}