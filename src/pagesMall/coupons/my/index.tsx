import Taro, { Component, Config, } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  ScrollView
} from "@tarojs/components";
import "./index.scss";
import classnames from 'classnames'
import { myCouponList } from "@/api/coupon";
import utils from '@/utils/util';
import { QcEmptyPage } from '@/components/common';

export default class Index extends Component {

  state = {
    curSwiperIdx: 1,
    couponlist: [],
    coupons: [],
    pageNum: 1,
    lock: false,
    tongji: {}
  };
  componentDidShow() {
    this.setState({ coupons: [], pageNum: 1 })
    this.getCoupons(1)
    this.getCouponTotal()
  }

  // 获取总数
  getCouponTotal = () => {
    myCouponList({pageNum: 1, pageSize: 1, ruleType: 1, status: 1}).then(res => {
      this.setState({
        tongji: {...this.state.tongji, 1: res.data.data.total}
      })
    })
  }

  getCoupons = async (pageNum, status = 1) => {
    Taro.showLoading({title: '加载中'})
    try {
      this.setState({lock: false})
      const params = { pageNum: pageNum, pageSize: 10, ruleType: 1, status: status}
      const res = await myCouponList(params)
      const coupons:any[] = this.state.coupons
      const couponlist = res.data.data.list
      if (couponlist.length > 0) {
        couponlist.map(item => {
          item.amount = utils.chu(item.amount, 100)
          item.orderAmount = utils.chu(item.orderAmount, 100)
          if (!item.ruleName) {
            // scope 优惠券适用范围：201店内所有商品，204指定商品，203指定分类
            if (item.scope != 201) {
              item.ruleName = '限部分商品可用'
            } else {
              item.ruleName = item.orderAmount > 0 ? `满${item.orderAmount}元可用` : '无门槛'
            }
          }
          try {
            item.validTime = item.validTime ? item.validTime.slice(0, 10) : ''
            item.expireTime = item.expireTime ? item.expireTime.slice(0, 10) : ''
          } catch (error) {
            console.log(error)
          }
          coupons.push(item)
        })
      } else {
        this.setState({lock: true})
      }
      this.setState({ couponlist: coupons })
      
    } catch (err) {
      console.log(err)
    } finally {
      setTimeout(() => {
        Taro.hideLoading()
      }, 1500)
    }
  }
  // 切换分类
  swichSwiperItem(e) {
    const curSwiperIdx = e.currentTarget.dataset.idx
    this.setState({ curSwiperIdx, pageNum: 1, coupons: [] })
    this.getCoupons(1, curSwiperIdx)
  }
  onPullDownRefresh() {
    this.setState({ coupons: [], pageNum: 1 })
    this.getCoupons(1)
  }
  onReachBottom() {
    if (this.state.lock) {
      return
    }
    this.state.pageNum++
    this.getCoupons(this.state.pageNum, this.state.curSwiperIdx)
  }
  // 优惠券编辑
  toDetail(item) {
    Taro.setStorageSync('selectCoupon', item)
    Taro.navigateTo({
      url: `/pagesMall/coupon/edit/index?id=${item.id}&type=edit`
    })
  }
  
  render() {
    const { couponlist, curSwiperIdx, tongji, lock } = this.state
    return (
      <View className='coupon-list'>
        <View className='content-fixed'>
          <ScrollView scroll-x='true' className="nav-header-View" scroll-into-View={curSwiperIdx == 5 ? 'listReturn' : ''}>
            <View className={classnames('header-col-View', curSwiperIdx == 1 && 'show-border-bottom')} data-idx={1} onClick={this.swichSwiperItem}>
              <Text data-idx={1}>未使用</Text>
              <Text>({tongji[1] || 0})</Text>
            </View>
            <View className={classnames('header-col-View', curSwiperIdx == 2 && 'show-border-bottom')} data-idx={2} onClick={this.swichSwiperItem}>
              <Text data-idx={2}>已使用</Text>
            </View>
            <View className={classnames('header-col-View', curSwiperIdx == 3 && 'show-border-bottom')} data-idx={3} onClick={this.swichSwiperItem}>
              <Text data-idx={3}>已失效</Text>
            </View>
          </ScrollView>
        </View>

        <View style="padding-top: 110rpx;padding-bottom: 30rpx;">
          {couponlist.length > 0 ? (
            <Block>
              {couponlist.map((item: any) => {
                return (
                  <View className='coupon' key={item.id} style={item.isAborted ? 'opacity: 0.6;' : ''}>
                    <View className='coupon-info'>
                      <View className='coupon-info__left'>
                        <View className='price'>￥<Text className='price-value'>{item.amount}</Text></View>
                      </View>
                      <View className='coupon-info__right'>
                        <View className='dist-a'>{item.title}</View>
                        {item.ruleName && <View className='dist-b'>{item.ruleName}</View>}
                        {item.validTime && <View className='dist-c'>有效期：{item.validTime}至{item.expireTime}</View>}
                      </View>
                    </View>
                  </View>
                )
              })}
              {lock && <View className='no-more'>没有更多数据啦</View>}
            </Block>
          ) : (
            <QcEmptyPage icon='none'></QcEmptyPage>
          )}
        </View>
      </View>
    );
  }

  config: Config = {
    navigationBarTitleText: "我的优惠券"
  };
}
