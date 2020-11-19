import Taro, { useState, useEffect, useReachBottom, usePullDownRefresh } from '@tarojs/taro';
import { View } from '@tarojs/components'
import './index.scss';

import api from '@/api/cowebs'
import util from '@/utils/util'


import { QcEmptyPage, LoadingBox, TabsWrap } from '@/components/common';
import { NoticeItem } from '@/components/cowebs'

export default function MyNotice() {

  const [ groups ] = useState([
    {
      id: 1,
      title: '评论',
      icon: 'qc-icon-biaoqian',
      url: '/pagesCoWebs/my/my-activity/index',
      color: 'rgb(242,209,3)'
    },
    {
      id: 2,
      title: '粉丝',
      icon: 'qc-icon-fensi1',
      url: '/pagesCoWebs/my/my-information/index',
      color: 'rgb(255,155,123)'
    },
    {
      id: 3,
      title: '数据探针',
      icon: 'qc-icon-tongji1',
      url: '',
      color: 'rgb(122,195,251)'
    },
  ])

  const [ list ] = useState<any[]>([
    {
      id: 123,
      title: '的沙发的沙发沙发沙发的沙发沙发沙发的沙发沙发沙发沙发沙发',
      iconUrl: '/attachments/welcome2.png',
      createTime: '2342342343',
      content: '的沙发的沙发沙发沙发的沙发沙发沙发的沙发沙发沙发沙发沙发',
      num: 24,
    },
    {
      id: 123,
      title: '的沙发的沙发沙发沙发的沙发沙发沙发的沙发沙发沙发沙发沙发',
      iconUrl: '/attachments/welcome2.png',
      createTime: '2342342343',
      content: '的沙发的沙发沙发沙发的沙发沙发沙发的沙发沙发沙发沙发沙发',
      num: 2,
    }
  ])

  const navigateTo = (url: string) => {
    if (!url) return
    Taro.navigateTo({ url })
  }

  return (
    <View>
      <View className="group-items">
        {groups.map((item: any) => {
          return (
            <View key={item.id} className="item" hoverClass="item-hover" onClick={() => navigateTo(item.url)}>
              <View className={`${item.icon} qcfont`} style={{background: item.color}} />
              <View>{item.title}</View>
            </View>
          )
        })}
      </View>

      <View style={{height: Taro.pxTransform(30)}} />

      {list.length > 0 ? (
        list.map(item => {
          return <NoticeItem item={item} key={item.id} />
        })
      ) : (
        <QcEmptyPage icon='none'></QcEmptyPage>
      )}
    </View>
  )
}

MyNotice.config = {
  navigationBarTitleText: '消息通知',
  enablePullDownRefresh: true,
}