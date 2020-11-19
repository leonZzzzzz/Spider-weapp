import Taro, { useState, useEffect, useDidShow, useRouter, useShareAppMessage, usePullDownRefresh } from '@tarojs/taro'
import { View, Text, Image, Button, Form } from '@tarojs/components'
import './index.scss'

import { LogoWrap,  Avatar, LoadingBox, AuthorizeWrap } from '@/components/common'
import { CountDown } from '@/components/mall'

import util from '@/utils/util'
import api from '@/api/mall'
import { IMG_HOST, HOME_PATH } from '@/config'
import withShare from '@/utils/withShare'

export default function FirendHelp() {

  const [ authorizeVisible, setAuthorizeVisible ] = useState(false)
  const [ pageLoading, setPageLoading ] = useState(true)
  const [ product, setProduct ] = useState<any>({})
  const [ detail, setDetail ] = useState<any>({})
  const [ self, setSelf ] = useState<any>({})
  const [ userList, setUserList ] = useState<any[]>([])

  const { id, scene } = useRouter().params

  useDidShow(() => {
    Taro.hideShareMenu()
    helpDetail()
  })

  usePullDownRefresh(() => {
    setPageLoading(true)
    helpDetail()
  })

  useShareAppMessage(() => {
    return withShare({
      title: '我发现一件好货，快来帮我助力吧！',
      imageUrl: IMG_HOST + product.iconUrl,
      path: `/pagesMall/firend-help/index?id=${product.orderId}`
    })
  })

  /**
   * 订单助力情况
   * @param orderId 订单id
   */
  const helpDetail = async () => {
    const res = await api.helpDetail({orderId: id })
    let data = res.data.data
    data.order.helpHaveQuantityArray = Array.from({length: data.order.helpHaveQuantity}, (v,i) => {return i})

    setProduct(data.orderItemList[0])
    setDetail(data.order)
    setSelf(data.self)
    setUserList(data.userList)
    setPageLoading(false)
    Taro.stopPullDownRefresh()
    console.log('helpDetail', data)
  }

  const submitHelp = async (e: any) => {
    if (util.checkAuthorize()) {
      setAuthorizeVisible(true)
      return 
    }

    if (self.isHelped || detail.helpStatus === 2 || detail.helpStatus === -1) return
    let params = {
      id: id,
      wxMiniFormId: e.detail.formId
    }
    console.log(params)
    util.showLoading(true, '提交中')
    await api.help(params)
    util.showToast('助力成功')
    helpDetail()
  }

  return (
    <View className="page">
      <LoadingBox visible={pageLoading} />

      <View className="help">
        <View className="rule-wrap" onClick={() => util.navigateTo('/pagesMall/firend-help/rule/index')}>
          <Text className="text">活动规则</Text>
        </View>

        <View className="goods-wrap border">
          {detail.helpStatus === 2 &&
            <View className="qcfont qc-icon-zhulichenggong success" />
          }
          {detail.helpStatus === -1 &&
            <View className="qcfont qc-icon-zhulishibai fail" />
          }
          <View className="user-wrap">
            <View className="user">
              <Avatar imgUrl={detail.buyerHeader} width={120} style={{border: '2px solid #fff'}} />
              <View className="name">{detail.buyerName}</View>
            </View>
          </View>
          {!self.isOrganizer &&
            <View className="zhuli-text">我发现一件好货，快来帮我助力吧！</View>
          }
          <View className="goods">
            <View className="cover">
              <Image src={IMG_HOST + product.iconUrl} mode="aspectFill" />
              <View className="qty">仅剩{product.productQty || 0}件</View>
            </View>
            <View className="info">
              <View className="title-wrap">
                <View className="title">{product.name}</View>
                <View className="unit">{product.specs}</View>
              </View>
              <View className="info-bottom-wrap">
                <View className="price-wrap">
                  <Text className="price">{util.filterPrice(product.price)}</Text>
                  <Text className="origin-price">￥{util.filterPrice(product.origPrice)}</Text>
                </View>
                <View className="check" onClick={() => util.navigateTo(`/pagesMall/firend-help/detail/index?id=${product.helpShoppingId}`)}>
                  <Text>查看</Text>
                  <Text className="qcfont iyoujiantou" />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="invite-wrap border">
          {detail.helpNeddQuantity > 0 ? 
            <View className="sum-wrap">
              已邀请
              <Text className="red">{detail.helpHaveQuantity}</Text>
              人，还差
              <Text className="red big">{detail.helpNeddQuantity}</Text>
              名好友助力
            </View>
            :
            <View className="sum-wrap">
              已邀请
              <Text className="red">{detail.helpHaveQuantity}</Text>
              人，助力成功
            </View>
          }

          <View className="jindu-wrap">
            {detail.helpHaveQuantity && detail.helpHaveQuantity > 0 && detail.helpHaveQuantityArray.map((index: number) => {
              return  (<Text className={`item ${index !== 0 ? 'line' : ''}`} key={index} style={{width: `${600/detail.helpQuantity}rpx`}}></Text>)
            })}
          </View>

          {self.isOrganizer && (detail.helpStatus === 0 || detail.helpStatus === 1) &&
            <View className="share-btn">
              <Button plain openType="share">邀请好友助力</Button>
            </View>
          }
          {self.isOrganizer && detail.helpStatus === -1 &&
            <View className="share-btn">
              <Button plain openType="share" className="disabled" disabled>邀请好友助力</Button>
            </View>
          }

          {self.isOrganizer && detail.helpStatus === 2 &&
            <View className="share-btn">
              <Button plain onClick={() => util.navigateTo(`/pagesMall/order/detail/index?id=${id}`)}>查看订单详情</Button>
            </View>
          }
          {!self.isOrganizer &&
            <View className="share-btn">
              <Form reportSubmit onSubmit={submitHelp}>

                {self.isHelped ?
                  <Button plain openType="share">邀请其他好友为TA助力</Button>
                  :
                  <Button plain formType="submit" disabled={self.isHelped} className={`${(self.isHelped || detail.helpStatus === 2 || detail.helpStatus === -1) ? 'disabled' : ''}`}>立即帮TA助力</Button>
                }
              </Form>
            </View>
          }

          {self.isHelped && 
            <View className="desc">
              <Text>助力成功，感谢你的帮助！</Text>
            </View>
          }
          {!self.isHelped && (detail.helpStatus !== 2) &&  
            <View className="desc">
              <Text>还剩</Text>
              <CountDown endTime={detail.helpExpireTime} style={{padding: '0 4px'}} styles="text" color="#d10d23" onEnd={helpDetail} />
              <Text>结束，快喊好友助力吧！</Text>
            </View>
          }
          <View className="share-btn">
            <Button className="home" plain onClick={() => util.navigateTo(HOME_PATH)}>返回首页</Button>
          </View>
        </View>

        {userList.length > 0 &&
          <View className="help-list border">
            <View className="title-wrap">
              <Text className="kuai" />
              <Text className="title">助力帮</Text>
              <Text className="kuai" />
            </View>
            <View className="list">
              {userList.map((item: any) => {
                return (
                  <View className="item" key={item.id}>
                    <View className="user">
                      <Avatar imgUrl={item.header} width={60} />
                      <View className="name">{item.name}</View>
                    </View>
                    <View className="time">{item.createTime}</View>
                  </View>
                )
              })}
            </View>
          </View>
        }
      </View>
      <LogoWrap />

      <AuthorizeWrap visible={authorizeVisible} onHide={() => setAuthorizeVisible(false)} isClose={true} />
    </View>
  )
}

FirendHelp.config = {
  navigationBarTitleText: '好友助力',
  enablePullDownRefresh: true,
}