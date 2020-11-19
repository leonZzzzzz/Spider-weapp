import Taro, { useState, useEffect, useShareAppMessage } from '@tarojs/taro'
import { View, Text, Image, Button } from '@tarojs/components'
import './index.scss'

import api from '@/api/cowebs'
import withShare from '@/utils/withShare';
import { LoadingBox, LogoWrap, QcEmptyPage, PointList, ContentWrap, ShareWrap } from '@/components/common'
import { IMG_HOST } from '@/config';
export default function Index() {
  const [pageLoading, setPageLoading] = useState(true)
  const [ruleModel, setRuleModel] = useState(false)
  const [timeModel, setTimeModel] = useState(false)
  const [pointRule, setPointRule] = useState({})
  const [detail, setDetail] = useState<any[]>([]);
  const [myPoint, setMyPoint] = useState<{}>({});
  const [name, setName] = useState<''>('')
  const [shareVisible, setShareVisible] = useState(false);
  const [datetime, setDatetime] = useState<any>([
    { name: '昨天', data: 'yesterday' },
    { name: '今天', data: 'today' },
    { name: '本周', data: 'this-week' },
    { name: '上周', data: 'last-week' },
    { name: '本月', data: 'this-month' },
  ]);

  useEffect(() => {
    pointRank()
    // myPointRank()

  }, [])
  // 今日
  const pointRank = async () => {
    const res = await api.pointRank(10, true)
    setDetail(res.data.data.rankList)
    setMyPoint(res.data.data.myRank)
    setPageLoading(false)
  }
  // 选择时间区间
  const pointAmong = async (data) => {
    const res = await api.pointAmong({ quantity: 10, period: data, includeMyRank: true })
    setDetail(res.data.data.rankList)
    setMyPoint(res.data.data.myRank)
    setPageLoading(false)
  }

  const changeTime = (e) => {
    const index = e.detail.value
    const data = datetime[index].data
    const name = datetime[index].name
    if (index != 1) {
      pointAmong(data)
    } else {
      pointRank()
    }
    setName(name)
  }

  // 我的积分
  // const myPointRank = async () => {
  //   const res = await api.myPointRank()
  //   setMyPoint(res.data.data)
  // }


  // 积分规则
  const getRules = async () => {
    const res = await api.pointRules()
    setPointRule(res.data.data.content)

    setRuleModel(true)
  }

  useShareAppMessage(() => {
    return withShare({
      title: `快来查看积分吧`,
      // imageUrl: IMG_HOST + iconUrl,
      path: `/pagesCoWebs/my/point/index`
    });
  });


  return (
    <View>
      <LoadingBox visible={pageLoading} />
      {/* 规则 */}
      {ruleModel && (
        <View className='rule-model'>
          <View className='track' onClick={() => { setRuleModel(false) }} ></View>
          <View className='rule-content'>
            <Text className="qcfont qc-icon-guanbi close_model" onClick={() => { setRuleModel(false) }} />
            <Image src={IMG_HOST + '/attachments/null/5d2adc3331d2428f8f71902115f38c4b.png'}></Image>
            <View className='content_text'>
              <ContentWrap content={pointRule} />
            </View>
          </View>

        </View>
      )}



      <View className='rules_date'>
        <Text className='twoword' onClick={getRules}>规则</Text>
        <Picker mode='selector'
          range={datetime}
          rangeKey='name'
          onChange={e => changeTime(e)}
          className='picker'>
          <View className="picker_title">
            <Text>{name ? name : '今日'} </Text>
            <Image className='picker_img' src={IMG_HOST + '/attachments/null/a1d47b8703d248ad9ffabd8392060c2f.png'}></Image>
          </View>
        </Picker>

      </View>
      {detail.length > 0 && (
        <View className='top'>
          <View style='width:235rpx'>
            {detail[1].point && (
              <View className='top-one'>
                <View className='image-box'>
                  <Image src={IMG_HOST + '/attachments/null/2b5dc06ff9e249918bd2835fb34af7a9.png'}></Image>
                  <Image src={detail[1].headImage}></Image>
                </View>
                <View className='top_name'>{detail[1].appellation}</View>
                <View>{detail[1].point}分</View>
              </View>
            )}
          </View>
          <View style='width:235rpx'>
            <View className='top-two'>
              <View className='image-box'>
                <Image src={IMG_HOST + '/attachments/null/121dafb4765742f7920188da9c84360a.png'}></Image>
                <Image src={detail[0].headImage}></Image>
              </View>
              <View className='top_name'>{detail[0].appellation}</View>
              <View>{detail[0].point}分</View>
            </View>
          </View>
          <View style='width:235rpx;'>
            {detail[2].point && (
              <View className='top-three'>
                <View className='image-box'>
                  <Image src={IMG_HOST + '/attachments/null/533b5b6dc8014c24adc36f9a40eed082.png'}></Image>
                  <Image src={detail[2].headImage}></Image>
                </View>
                <View className='top_name'>{detail[2].appellation}</View>
                <View>{detail[2].point}分</View>
              </View>
            )}
          </View>
        </View>
      )}

      <View className='container'>
        {myPoint.rank && (
          <View className='lists' onClick={() => { Taro.navigateTo({ url: '../point-detail/index' }) }}>
            <View className='list-row'>
              <View className='row'>
                <Text>{myPoint.rank}</Text>
                <Image src={myPoint.headImage}></Image>
                <Text>{myPoint.appellation}</Text>
              </View>
              <View className='row'>
                <Text style='color:rgb(120, 212, 58) !important;'>{myPoint.point}分</Text>
                <Text className="qcfont qc-icon-chevron-right right"></Text>
              </View>
            </View>
          </View>
        )}

        <View className='mar'>
          {detail.length > 0 ? (
            // detail.map((item, index) => {
            //   return (
            //     <View className='lists bor-bot'>
            //       <View className='nobor'>
            //         <View className='row'>
            //           <Text>{item.rank}</Text>
            //           <Image src={item.headImage}></Image>
            //           <Text>{item.appellation}</Text>
            //         </View>
            //         <View className='row'>
            //           <Text>{item.points}分</Text>
            //         </View>
            //       </View>
            //     </View>
            //   )
            // })
            <PointList detail={detail}></PointList>
          ) : (
              <QcEmptyPage icon='none'></QcEmptyPage>
            )}
        </View>
      </View>
      <View style='height:100px'></View>
      <View className='shareFriend'>
        {/* <Text>分享给好友</Text> */}
        <Button className='item' plain hoverClass='hover-item' openType='share'>
          <View>分享给好友</View>
        </Button>
      </View>

      <LogoWrap bottom={85} />
    </View>
  )
}

Index.config = {
  navigationBarTitleText: '积分排行榜'
}