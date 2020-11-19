import Taro, { useState, useEffect, useReachBottom } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import './index.scss'
import useGetListData from '@/useHooks/useGetListData';

import api from '@/api/cowebs'
import { LoadingBox, LogoWrap, QcEmptyPage, PointList } from '@/components/common'
import { IMG_HOST } from '@/config';
export default function Index() {
  const [pageLoading, setPageLoading] = useState(true)
  const [detail, setDetail] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<{}>({});
  const [searchData, setSearchData] = useState<any>({
    pageSize: 10,
    pageNum: 1,
  })
  const { list, load } = useGetListData('myPointRules', {
    pageSize: 10,
    orderBy: 'latestFirst'
  });

  useEffect(() => {
    // myPointRules()
    pointTotal()
  }, [])

  const myPointRules = async () => {
    const res = await api.myPointRules(searchData)
    setDetail(res.data.data.list)
    setPageLoading(false)
  }
  const pointTotal = async () => {
    const res = await api.pointTotal()
    setTotalAmount(res.data.data)
    setPageLoading(false)
  }
  useReachBottom(() => {
    load(true);
  });

  return (
    <View>
      <LoadingBox visible={pageLoading} />
      <View className='container'>
        <View className='con'>
          <Image className='image' src={IMG_HOST + '/attachments/null/cea4160e38c7437eb538c3dcacb5126a.png'}></Image>
          <View className='con-point'>
            <View className='total'>
              <View>总积分(分)</View>
              <View>{totalAmount.totalAmount}</View>
            </View>
            <View className='line_point'></View>
            <View className='total'>
              <View>剩余积分(分)</View>
              <View>{totalAmount.amount}</View>
            </View>
          </View>
        </View>

        <View className='mar'>
          {list.length > 0 ? (
            list.map((item, index) => {
              return (
                // <Block>
                //   {item.scene!=0&&(

                //   )}
                // </Block>
                <View className='lists bor-bot'>
                  <View className='list-row'>
                    <View className='col'>
                      {item.businessType == 'activity-sign' && (
                        <Block>
                          {item.scene > 0 ? (
                            <Text>报名活动成功</Text>
                          ) : (
                              <Text>取消报名</Text>
                            )}
                        </Block>
                      )}
                      {item.businessType == 'daily-sign-in' && (
                        <Text>每日签到</Text>
                      )}
                      {item.businessType == 'read-content' && (
                        <Text>阅读文章</Text>
                      )}
                      {item.businessType == 'activity-sign-pay' && (
                        // <Text>活动报名</Text>
                        <Block>
                          {item.scene > 0 ? (
                            <Text>活动报名取消，退回积分</Text>
                          ) : (
                              <Text>活动报名</Text>
                            )}
                        </Block>
                      )}
                      {item.businessType == 'activity-checkin' && (
                        <Text>活动签到</Text>
                      )}
                      {item.businessType == 'share-activity' && (
                        <Text>分享活动</Text>
                      )}
                      {item.businessType == 'invite-activity-sign' && (
                        <Block>
                          {item.scene > 0 ? (
                            <Text>邀请活动报名</Text>
                          ) : (
                              <Text>邀请活动报名取消</Text>
                            )}
                        </Block>
                      )}
                      {item.businessType == 'publish-topic' && (
                        <Block>
                          {item.scene > 0 ? (
                            <Text>发表帖子</Text>
                          ) : (
                              <Text>帖子下架</Text>
                            )}
                        </Block>

                      )}
                      {item.businessType == 'finish-profile' && (
                        <Text>完善资料</Text>
                      )}
                      {item.businessType == 'share-topic' && (
                        <Text>分享帖子</Text>
                      )}
                      {item.businessType == 'reply-topic' && (
                        <Text>回复帖子</Text>
                      )}
                      {item.businessType == 'topic-replied' && (
                        <Text>帖子被回复</Text>
                      )}
                      {item.businessType == 'topic-praised' && (
                        <Text>帖子被赞(满指定点赞数得积分)</Text>
                      )}
                      {item.businessType == 'share-course' && (
                        <Text>分享课程</Text>
                      )}
                      {item.businessType == 'course-sign' && (
                        <Block>
                          {item.scene > 0 ? (
                            <Text>课程报名</Text>
                          ) : (
                              <Text>课程报名取消</Text>
                            )}
                        </Block>

                      )}
                      {item.businessType == 'invite-course-sign' && (
                        <Block>
                          {item.scene > 0 ? (
                            <Text>邀请课程报名</Text>
                          ) : (
                              <Text>邀请课程报名取消</Text>
                            )}
                        </Block>
                      )}
                      {item.businessType == 'invite-course-vip' && (
                        <Text>邀请课程vip购买</Text>
                      )}

                      {/* <Text>{item.detail}</Text> */}
                      <Text>{item.createTime}</Text>
                    </View>
                    <View className='col one'>
                      <View className={item.scene > 0 ? 'green' : 'orange'}>{item.scene > 0 ? '+' : ''}{item.amount}分</View>
                    </View>
                  </View>
                </View>
              )
            })
          ) : (
              <QcEmptyPage icon='none'></QcEmptyPage>
            )}
        </View>

      </View>

      <LogoWrap />
    </View>
  )
}

Index.config = {
  navigationBarTitleText: '积分明细',
  navigationBarBackgroundColor: "#fff",
  navigationBarTextStyle: "black",
}