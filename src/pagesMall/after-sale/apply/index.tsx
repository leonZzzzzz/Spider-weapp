import Taro, { useState, useEffect, useRouter, useDidShow } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'

import './index.scss'
import util from '@/utils/util'
import api from '@/api/mall'
import { IMG_HOST } from '@/config'

import { QcCheckbox, QcInputNumber, LoadingBox } from '@/components/common'


export default function AfterSaleApply() {

  const [ pageLoading, setPageLoading ] = useState(true)
  const [ isMount, setIsMount ] = useState(false)
  const [ orderData, setOrderData ] = useState<any>({
    orderItems: []
  })
  // const [ applyItems, setApplyItems ] = useState<any[]>([]) // 已经申请过的商品项
  const [ canApply, setCanApply ] = useState(true) // 是否可以进行售后
  const [ disableApplyStatus, setDisableApplyStatus ] = useState(false)
  const { id } = useRouter().params

  useEffect(() => {
    onInitData()
  }, [])

  useDidShow(() => {
    if (!isMount) return
    onInitData()
  })


  const onInitData = () => {
    let promise1 = calculateFrozenQuantity()
    let promise2 = getOrderDetail()
    Promise.all([promise1, promise2]).then(res => {
      const applyItems: any = res[0]
      const orderData: any = res[1]
      const { orderItems } = orderData
      // 可以进行售后的商品项的总个数
      let canApplyTotal = 0
      for (let item of orderItems) {
        // 该商品已售后的数量
        let applyNum = applyItems[item.id]
        // 该商品可以售后的数量
        let canApplyNum = item.qty - applyNum
        // 只有列表只有一个商品项的时候，并且可售后数量大于0，则默认选择
        if (orderItems.length === 1 && canApplyNum > 0) {
          item.isCheck = true
        } else {
          item.isCheck = false
        }
        item.selectQty = item.canApplyQty = canApplyNum
        if (item.canApplyQty > 0) canApplyTotal++
      }
      let canApply = canApplyTotal > 0
      // 订单状态不是已发货或者已收货,则不能申请退货和换货
      setDisableApplyStatus(!canApply || (orderData.status !== 2 && orderData.status !== 3))
      // setApplyItems(applyItems)
      setOrderData(orderData)
      setCanApply(canApply)
      setIsMount(true)
      setPageLoading(false)
    });
  }

  // 获取订单已冻结的售后数量
  const calculateFrozenQuantity = () => {
    return new Promise((resolve, reject) => {
      api.calculateFrozenQuantity({ orderId: id }).then((res: any) => {
        resolve(res.data.data)
      }).catch((err: any) => {
        reject(err)
      })
    })
  }

  // 获取订单详情
  const getOrderDetail = () => {
    return new Promise((resolve, reject) => {
      api.getOrderDetail({ id }).then((res: any) => {
        resolve(res.data.data)
      }).catch((err: any) => {
        reject(err)
      })
    })
  }

  // 选择商品
  const onProductCheck = (index: number, value: boolean = false) => {
    let item = orderData.orderItems[index]
    if (item.canApplyQty <= 0) {
      util.showToast('该商品已申请售后')
      return
    }
    item.isCheck = value
    setOrderData(orderData)
  }

  // 判断售后方式
  const onApplyType = (type: number) => {
    // 不能进行售后申请 或者 不是仅退款类型并且还没发货或收货
    if (!canApply || (type !== 3 && orderData.status !== 2 && orderData.status !== 3)) {
      return
    }
    let checkData = orderData.orderItems.filter((item: any) => {
      return item.isCheck
    })
    if (!checkData.length) {
      util.showToast('请先选择对应的商品')
      return
    }
    Taro.setStorageSync('checkData', JSON.stringify(checkData))
    const url = `/pagesMall/after-sale/action/index?id=${id}&type=${type}&status=${orderData.status}`
    util.navigateTo(url);
  }

  // 选择售后商品的数量
  const onChangeQty = (index: number, value: number) => {
    orderData.orderItems[index].selectQty = value;
    setOrderData(orderData)
  }

  return (
    <View className="page-apply-after-sale">
      <LoadingBox visible={pageLoading} />
      
      <View className="product-list">
        {orderData.orderItems.map((item: any, index: number) => {
          return (
            <View
              className={`product-list__item ${item.canApplyQty <= 0 ? 'disabled' : ''}`}
              key={item.id}
              onClick={() => onProductCheck(index, true)}
            >
              <View className="cover">
                <QcCheckbox
                  disabled={item.canApplyQty <= 0}
                  value={item.isCheck}
                  // onChange={() => onProductCheck(index)}
                />
                <Image className="img" mode="aspectFill" src={IMG_HOST + item.iconUrl} />
              </View>
              <View className="info">
                <View className="name">{item.name}</View>
                <View className="specs">{item.specs}</View>
                <View className="price-qty">
                  <View className="price"> {util.filterPrice(item.price)}</View>
                  <View className="qty">x{item.canApplyQty}</View>
                </View>
                {item.canApplyQty > 1 && (
                  <QcInputNumber
                    min={1}
                    max={item.canApplyQty}
                    step={1}
                    value={item.selectQty}
                    onChange={(value: number) => onChangeQty(index, value)}
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>
      <View className="action-list">
        <View className={`action-list__item ${!canApply ? 'disabled' : ''}`} onClick={() => onApplyType(3)}>
          <View className="content">
            <View className="title">仅退款</View>
            <View className="desc">未收到货（包含未签收），或卖家协商同意前提下</View>
          </View>
          {canApply && <View className="qcfont qc-icon-chevron-right" />}
        </View>
        <View
          className={`action-list__item ${disableApplyStatus ? 'disabled' : ''}`}
          onClick={() => onApplyType(2)}
        >
          <View className="content">
            <View className="title">换货</View>
            <View className="desc">已收到货，需要更换已收到的货物</View>
          </View>
          {!disableApplyStatus && <View className="qcfont qc-icon-chevron-right" />}
        </View>
        <View
          className={`action-list__item ${disableApplyStatus ? 'disabled' : ''}`}
          onClick={() => onApplyType(1)}
        >
          <View className="content">
            <View className="title">退货</View>
            <View className="desc">已收到货，需要退掉已收到的货物</View>
          </View>
          {!disableApplyStatus && <View className="qcfont qc-icon-chevron-right" />}
        </View>
      </View>
    </View>
  )
}

AfterSaleApply.config = {
  navigationBarTitleText: '申请售后',
}