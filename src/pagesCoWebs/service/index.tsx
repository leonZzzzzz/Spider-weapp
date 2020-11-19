import Taro, { useState, useEffect, useShareAppMessage } from '@tarojs/taro'
import { View, Button } from "@tarojs/components"
import './index.scss'

import api from '@/api/cowebs'
import withShare from '@/utils/withShare'
import { LoadingBox, LogoWrap, ContentWrap, Dialog } from '@/components/common'

export default function Index() {

  const [ pageLoading, setPageLoading ] = useState(true)
  const [ detail, setDetail ] = useState<any>({})
  const [ customerVisible, setCustomerVisible ] = useState(false)

  useShareAppMessage(() => {
    return withShare({
      title: '您知道怎么运营好社群吗？企成社群助手来帮您！',
      path: `/pagesCoWebs/service/index`
    })
  })

  useEffect(() => {
    getQchdAbout()
  }, [])

  const getQchdAbout = async () => {
    const res = await api.getQchdAbout()
    setDetail(res.data.data)
    setPageLoading(false)
  }

  const makePhoneCall = async () => {
    if (!detail.phone) {
      Taro.showToast({
        title: '没有号码，请先配置',
        icon: 'none',
      })
      return
    }
    try {
      await Taro.makePhoneCall({
        phoneNumber: detail.phone || ''
      })
    } catch(err) {
      console.log(err)
    }
  }

  return (
    <View>
      <LoadingBox visible={pageLoading} />
      <View className="relative">
        <ContentWrap content={detail.content} styles={{padding: 0}} />
      </View>
      <LogoWrap bottom={110} isJump={false} />
      <View className="bottom-btn" >
        <Button hoverClass="hover-button" onClick={() => setCustomerVisible(true)}>联系客服</Button>
      </View>

      <Dialog
        visible={customerVisible}
        position="center"
        onClose={() => setCustomerVisible(false)}
      >
        <View className="kefu-dialog">
          <View className="kefu-btn">
            <Button hoverClass="hover-button" onClick={makePhoneCall}>一键拨号</Button>
          </View>
          <View className="kefu-btn">
            <Button hoverClass="hover-button" openType="contact">联系微信客服</Button>
          </View>
        </View>
      </Dialog>
    </View>
  )
}

Index.config = {
  navigationBarTitleText: '企成互动',
  navigationBarBackgroundColor: '#294A7B'
}