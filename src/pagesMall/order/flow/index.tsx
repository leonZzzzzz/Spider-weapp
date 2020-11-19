import Taro, { useState, useEffect, useDidShow, useRouter } from '@tarojs/taro'
import { View } from '@tarojs/components'

import './index.scss'
import { LoadingBox } from '@/components/common'

import api from '@/api/mall'

export default function OrderFlow() {

  const [ pageLoading, setPageLoading ] = useState<boolean>(true)
  const [ orderFlowList, steOrderFlowList ] = useState<any[]>([])
  const { id } = useRouter().params

  useEffect(() => {
    getOrderFlowList()
  }, [])

  const getOrderFlowList = async () => {
    const res = await api.getOrderFlowList({ orderId: id })
    steOrderFlowList(res.data.data)
    setPageLoading(false)
  }


  return (
    <View className="page-order-flow">
      <LoadingBox visible={pageLoading} />

      <View className="order-flow-list">
        {orderFlowList.map((item, index) => {
          return (
            <View
              className={`timeline ${index === 0 ? 'active' : ''} ${
                index === orderFlowList.length - 1 ? 'last' : ''
              }`}
              key={item.id}
            >
              <View className="timeline__line" />
              <View className="timeline__dot" />
              <View className="timeline__content">
                <View className="header">
                  <View className="status">{item.statusName}</View>
                  <View className="date">{item.createTime}</View>
                </View>
                <View className="body">{item.description}</View>
              </View>
            </View>
          );
        })}
        {orderFlowList.length === 0 &&
          <View className="no-flow">暂无状态</View>
        }
      </View>
    </View>
  )
}

OrderFlow.config = {
  navigationBarTitleText: '订单状态',
}