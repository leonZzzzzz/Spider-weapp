import Taro, { useState, useEffect, useShareAppMessage } from '@tarojs/taro'
import { View, Text, Button, Input } from "@tarojs/components"
import './index.scss'

import api from '@/api/cowebs'
import { LoadingBox, LogoWrap, QcEmptyPage } from '@/components/common'

export default function Index() {

  const [ pageLoading, setPageLoading ] = useState(true)
  const [ list ] = useState([
    {
      id: 1,
      date: '2019-12',
      items: [
        {
          id: 1,
          title: '余额提现',
          amount: '-100.00',
          createTime: '2019-12-25 12:36:14',
        },
        {
          id: 2,
          title: '余额提现',
          amount: '-100.00',
          createTime: '2019-12-25 12:36:14',
        }
      ]
    },
    {
      id: 2,
      date: '2019-10',
      items: [
        {
          id: 1,
          title: '余额提现',
          amount: '-100.00',
          createTime: '2019-12-25 12:36:14',
        },
        {
          id: 2,
          title: '余额提现',
          amount: '-100.00',
          createTime: '2019-12-25 12:36:14',
        }
      ]
    },
    {
      id: 3,
      date: '2019-12',
      items: [
        {
          id: 1,
          title: '余额提现',
          amount: '-100.00',
          createTime: '2019-12-25 12:36:14',
        },
        {
          id: 2,
          title: '余额提现',
          amount: '-100.00',
          createTime: '2019-12-25 12:36:14',
        }
      ]
    },
  ])

  return (
    <View className="account-details">
      {/* <LoadingBox visible={pageLoading} /> */}
      <View className="relative">
        {list.length > 0 ? (
          list.map((item) => {
            return (
              <View key={item.id} className="account-group">
                <View className="date">{item.date}</View>
                <View className="account-card box-shadow">
                  {item.items.map((label) => {
                    return (
                      <View key={label.id} className="account-item">
                        <View className="left">
                          <View className="title">{label.title}</View>
                          <View className="time">{label.createTime}</View>
                        </View>
                        <View className="right">
                          <View className="price">{label.amount}</View>
                          <View className="qcfont qc-icon-chevron-right" />
                        </View>
                      </View>
                    )
                  })}
                </View>
              </View>
            )
          })
        ) : (
          <QcEmptyPage icon='none'></QcEmptyPage>
        )}
      </View>

      <LogoWrap />
    </View>
  )
}

Index.config = {
  navigationBarTitleText: '账户明细',
}