import Taro, { useState, useEffect, usePullDownRefresh, useReachBottom } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image
} from "@tarojs/components";
import "./index.scss";
import Utils from '@/utils/util';
import receiveCouponImage from '@/images/receive-coupon.png';

import { couponList, receiveCoupon } from '@/api/coupon'

import { LoadingBox, QcEmptyPage, Dialog } from '@/components/common';

export default function MallCoupon () {
  const [ list, setList ] = useState([])
  const [ pageLoading, setPageLoading ] = useState(true)
  const [ visible, setVisible ] = useState(false)
  const [ lock, setLock ] = useState(false)
  const [ selectCoupon, setSelectCoupon ] = useState<any>({id: ''})

  useEffect(() => {
    console.log('useEffect myCouponList')
    getCouponList()
  }, [])

  // 列表
  const getCouponList = async () => {
    console.log('myCouponList 调用')
    try {
      const res = await couponList({pageSize: 99, pageNum: 1, ruleType: 1, storeId: Taro.getStorageSync('storeId')});
      res.data.data.list.map(item => {
        try {
          if (item.couponValidTime) {
            item.couponValidTime = item.couponValidTime.slice(0, 10)
            item.couponExpireTime = item.couponExpireTime.slice(0, 10)
            item.couponValidTime = item.couponValidTime.replace(/-/g, '.')
            item.couponExpireTime = item.couponExpireTime.replace(/-/g, '.')
          }
          if (item.ruleStartTime) {
            item.ruleStartTime = item.ruleStartTime.slice(0, 10)
            item.ruleEndTime = item.ruleEndTime.slice(0, 10)
            item.ruleStartTime = item.ruleStartTime.replace(/-/g, '.')
            item.ruleEndTime = item.ruleEndTime.replace(/-/g, '.')
          }
        } catch (error) {
          console.log(error)
        }
      })
      setList(res.data.data.list)
      console.log('myCouponList', res.data.data)
      setPageLoading(false)
    } catch(err) {
      console.log('myCouponList err', err)
    }
  }

  const handleReceive = async (obj) => {
    if (lock) return
    Taro.showLoading({title: '正在领取'})
    setLock(true)
    try {
      const res:any = await receiveCoupon({ruleId: obj.id, providerId: obj.storeId})
      setTimeout(() => {
        Taro.hideLoading()
        setLock(false)
      }, 1500)
      setVisible(false)
      if (res.data.message) {
        Taro.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 2000
        })
      }
      getCouponList()
    } catch (error) {
      console.log(error)
      setTimeout(() => {
        Taro.hideLoading()
        setLock(false)
      }, 1500)
    }
  }

  return (
    <View className='coupon-list'>
      <View className='qc-mall-coupon'>
        {list.length > 0 ? (
          <Block>
            {list.map((item: any) => {
              return (
                <View className='qc-mall-coupon__item'>
                  {item.statusValue != 'ongoing' && <View className='qc-mall-coupon__item__status'>{item.status}</View>}
                  <View className='qc-mall-coupon__item__info'>
                    <View className='qc-mall-coupon__item__left'>
                      <View className='price'>
                      ￥<Text className='price-value'>{Utils.chu(item.couponAmount, 100)}</Text>
                      </View>
                      <View className='title'>{item.couponTitle}</View>
                      <View className='name'>{item.ruleName}</View>
                      {item.ruleStartTime && <View className='date'>{item.ruleStartTime +'-'+item.ruleEndTime}</View>}
                    </View>
                    <View className='qc-mall-coupon__item__right' onClick={() => {
                      setSelectCoupon(JSON.parse(JSON.stringify(item)))
                      setVisible(true)
                    }}>领取</View>
                  </View>
                </View>
              )
            })}
          </Block>
        ) : (
          !pageLoading && <QcEmptyPage icon='none' size="mini"></QcEmptyPage>
        )}
        <LoadingBox visible={pageLoading} size="mini" />
      </View>

      {/* 领券弹窗 */}
      <Dialog visible={visible} position='center' isMaskClick={false}>
        {visible && <View className='receive-dialog'>
          <View className='receive-dialog__box'>
            <View className='receive-dialog__box__top'>
              <Text>优惠券领取</Text>
            </View>
            <View className='receive-dialog__box__center'>
              <View className='receive-dialog__coupon'>
                <View className='receive-dialog__coupon__left'>
                  <View className='price'>
                    ￥<Text className='price-value'>{Utils.chu(selectCoupon.couponAmount, 100)}</Text>
                  </View>
                </View>
                <View className='receive-dialog__coupon__right'>
                  <View className='title'>{selectCoupon.couponTitle}</View>
                  <View className='name'>{selectCoupon.ruleName}</View>
                  {selectCoupon.couponValidDaysType === 1 && selectCoupon.couponValidTime ? (
                    <View className='date'>有效期  {selectCoupon.couponValidTime +'-'+selectCoupon.couponExpireTime}</View>
                  ) : selectCoupon.ruleStartTime && (
                    <View className='date'>领取时间  {selectCoupon.ruleStartTime +'-'+selectCoupon.ruleEndTime}</View>
                  )}
                </View>
              </View>
            </View>
            <View className='receive-dialog__box__bottom'>
              <Image src={receiveCouponImage} />
              <View className='receive-btn' onClick={() => handleReceive(selectCoupon)}>确认领取</View>
            </View>
          </View>
          <View className='qcfont qc-icon-guanbi1 receive-dialog__close' onClick={() => setVisible(false)}></View>
        </View>}
      </Dialog>
    </View>
  )
}

MallCoupon.config = {
  navigationBarTitleText: "领券列表"
};

