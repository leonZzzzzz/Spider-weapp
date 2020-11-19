import Taro, { useState, useEffect, useRouter, useDidShow, usePullDownRefresh } from '@tarojs/taro';
import { View, Text, Textarea, Button, Form, Block, Input, ScrollView } from '@tarojs/components';
import util from '@/utils/util';
import api from '@/api/mall';
import apiCowebs from '@/api/cowebs';
import { listAddress } from '@/api/address';
import { myCouponList, canUseCouponList } from "@/api/coupon";
import { LoadingBox, LogoWrap, DividingLine, ThemeView, Dialog } from '@/components/common';
import { ConfirmOrderGoodsItem } from '@/components/mall';
import './index.scss';

export default function ConfirmOrder() {
  const [code, setCode] = useState<string>('');
  const [pageLoading, setPageLoading] = useState(true);
  const [requiredAddress, setRequiredAddress] = useState(false);
  const [couponVisible, setCouponVisible] = useState(false);
  const [address, setAddress] = useState<any>({});
  const [model, setModel] = useState<any>({
    // 商品总数
    qty: 0,
    // 需支付金额
    totalAmount: 0,
    // 运费
    transportAmount: 0,
    // 订单令牌
    orderToken: '',
    // 备注
    remark: ''
  });

  const [btnLoading, setBtnLoading] = useState(false);
  const [couponList, setCouponList] = useState<any[]>([]);
  // 是否显示优惠券选项
  const [showCoupon, setShowCoupon] = useState<boolean>(true)
  // 记录选中的优惠券
  const [selectCoupon, setSelectCoupon] = useState<any>({noRequest: true})
  //用来暂存优惠券的字段,点完成按钮后再修改赋值给上面的selectCoupon
  const [selectCouponCopy, setSelectCouponCopy] = useState<any>({noRequest: true})

  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [memberStatus, setMemberStatus] = useState('');
  const [isMount, setIsMount] = useState(false);

  const { id, formId, type, organizeOrderId } = useRouter().params;

  useEffect(() => {
    initPage()
  }, []);

  usePullDownRefresh(() => {
    initPage()
  })

  const initPage = () => {
    orderPrepare(type, id, formId);
    if (type !== 'help') getAddressList();
    console.log('useEffect', isMount);
    if (isMount && type !== 'help' && requiredAddress) {
      getAddressList();
    }
  }

  // 计算优惠券实际抵扣的金额
  useEffect(() => {
    setSelectCouponCopy(selectCoupon)
    if (organizeOrderId || type == 'group' || type == 'help') {
      // 只有普通订单才能使用优惠券
      setShowCoupon(false)
      return () => {}
    }
    /**
     * noRequest 是本地添加的字段，为true就不请求
     * 预览接口会赋值优惠券，避免这里监听到变化又发起请求 形成循环
     * 保证只有在手动切换优惠券的时候才重新请求
     * 同时第一次进入页面不让它执行，避免调用两次预览
     */
    if (!selectCoupon.noRequest) {
      if (!selectCoupon.id || selectCoupon.id == 'noUse') orderPrepare(type, id, formId, {useCoupon: false}); 
      else orderPrepare(type, id, formId);
    }
    // 已废弃
    // console.log('计算优惠券实际抵扣金额===>', model, selectCoupon)
    // setModel(pre => {
    //   if (selectCoupon.id ) {
    //     // 注意优惠金额不一定 等于 优惠券的面值 （比如订单金额2元，优惠券面值4元，所以实际抵扣的是2元，不是4元
    //     let couponAmount = selectCoupon.amount
    //     let oldAmount = model.storeCouponPayAmount || 0
    //     // 实际抵扣金额 = 商品金额 - 优惠券面值
    //     let newAmount = model.amount > couponAmount ? couponAmount : model.amount
    //     //合计金额 = 预览有自动选中优惠券的，先加上已经去减去优惠金额，再减去当前的优惠金额
    //     let totalAmount = model.totalAmount_2 + oldAmount - newAmount
    //     console.log(totalAmount, oldAmount, newAmount)
    //     return {
    //       ...pre,
    //       totalAmount_2: Math.max(0, totalAmount),
    //       storeCouponPayAmount: newAmount
    //     }
    //   } else {
    //     return {
    //       ...pre,
    //       totalAmount_2: model.totalAmount_2 + model.storeCouponPayAmount,
    //       storeCouponPayAmount: 0,
    //     }
    //   }
    // })
  }, [ selectCoupon ])

  /**
   * 获取订单预览信息
   * @param id 订单ids
   * @param otherData 其他需要携带的数据
   */
  const orderPrepare = async (type: string, id: string, formId: string, otherData = {}) => {
    try {
      let params: any = {};
      // const storeId = Taro.getStorageSync('storeId');
      // params.storeId = storeId;
      // params.useWallet = true
      params =  Object.assign(params, otherData) 
      if (type === 'group') {
        params.groupShoppingItemId = id;
        if (organizeOrderId) params.organizeOrderId = organizeOrderId;
      } else if (type === 'help') {
        params.helpShoppingItemId = id;
        params.requiredDeliver = false;
      } else {
        params.orderItemIds = id;
      }

      // 优惠券id
      let couponIds = (selectCoupon && selectCoupon.id) ? [selectCoupon.id] : [];
      if (couponIds.length > 0) {
        params.couponIds = couponIds.join('_')
        // couponIds.forEach((item, i) => {
        //   params[`couponIds[${i}]`]= item
        // })
      }

      if (formId) params.wxMiniFormId = formId;
      Taro.showLoading({title: '加载中'})
      setBtnLoading(true)
      let res = await api[type === 'group' ? 'groupOrderPrepare' : type === 'help' ? 'helpOrderPrepare' : 'orderPrepare'](
        params
      );
      Taro.hideLoading()
      setBtnLoading(false)
      Taro.stopPullDownRefresh()
      console.log(res.data)
      let data = res.data.data;

      setModel({
        qty: data.qty,
        amount: data.amount,
        totalAmount: data.totalAmount,
        totalAmount_2: data.totalAmount,
        transportAmount: data.transportAmount,
        storeCouponPayAmount: data.storeCouponPayAmount,
        walletAmount: data.walletAmount,
        orderToken: data.orderToken,
        remark: '',
        coupon: data.stores[0].coupon
      });
      setOrderItems(data.stores[0].orderItems);
      // if (!noSetCoupon) {
        if ( data.stores[0].coupon) {
          // noRequest 是本地添加的字段，避免useEffect监听优惠券变化的时候再次发起请求 形成循环
          setSelectCoupon({...data.stores[0].coupon, noRequest: true})
        } else {
          // 因为每次onShow都会请求预览接口，所以之前的totalAmount_2会被覆盖
          // 这样写是为了触发useEffect重新计算优惠券
          // setSelectCoupon(pre => pre)
        }
      // }
      
      setRequiredAddress(data.requiredAddress);
      setPageLoading(false);
      setIsMount(true);
      // 有了可用券列表接口，这里就不需要调我的券列表自己筛选了
      // getMyCouponList(data.amount)
      getCanUseCouponList(data.stores[0].storeId, id)
      if (type !== 'help' && data.requiredAddress) getAddressList();
      if (!data.requiredAddress) {
        Taro.login().then(res => {
          setCode(res.code);
        });
        setAddress(data.address);
      }
    } catch (error) {
      console.log(error)
      Taro.hideLoading()
      setBtnLoading(false)
      if (error && error.data && error.data.message) {
        Taro.showToast({title: error.data.message, icon: 'none'})
      }
    }
  };

  /**
   * 获取地址列表
   */
  const getAddressList = async () => {
    const res = await listAddress();
    const addressList = res.data.data;
    const address = Taro.getStorageSync('address');
    console.log('getStorageSync address', address);
    const list = addressList.filter((res: any) => {
      return address.id ? res.id === address.id : res.isDefault;
    });
    setAddress(list[0] || {});
  };
 
  /**
   * 获取我的优惠券列表 （现在默认是单门店的，以后需要多门店的可能需要传storeId啥的）
   * @parame 商品金额
   */
  const getMyCouponList = async (amount) => {
    // status: 1 进行中, ruleType；1 
    const res = await myCouponList({pageNum: 1, pageSize: 300, ruleType: 1, status: 1});
    let list:any[] = []
    list = res.data.data.list.filter(item => {
      // 商品金额 >= orderAmount才可以用
      if (amount >= item.orderAmount) {
        // scope 优惠券适用范围：201店内所有商品，204指定商品，203指定分类
        // referenceIdList: string 范围对象id，如果couponScope==201可不填，couponScope=204则填对应商品id，203则填对应分类id, 多个id使用英文逗号拼接
        let referenceIdList = item.referenceIdList ? item.referenceIdList.split(',') : []
        if (item.scope === 201) {
          return true
        } else if (item.scope === 203) {
          // categoryId
          // 判断优惠券范围ID数组 里是否有符合条件的商品 返回true表示该券可用
          let orderCategoryIds = orderItems.map(item => item.categoryId)
          let flag = orderCategoryIds.some(item => {
            return referenceIdList.some(l => {
              return l === item.id
            })
          })
          return flag 
        } else if (item.scope === 204) {
          // 判断优惠券范围ID数组 里是否有符合条件的商品 返回true表示该券可用
          let orderProductIds = orderItems.map(item => item.productId)
          let flag = orderProductIds.some(item => {
            return referenceIdList.some(l => {
              return l === item.id
            })
          })
          return flag 
        }
      } else {
        return false
      }
    }).map(item => {
      try {
        item.validTime = item.validTime.slice(0, 10)
        item.expireTime = item.expireTime.slice(0, 10)
        item.validTime = item.validTime.replace(/-/g, '.')
        item.expireTime = item.expireTime.replace(/-/g, '.')
      } catch (error) {
        console.log(error)
      }
      return item
    })
    setCouponList(list)
  };

  const getCanUseCouponList = async (storeId, orderItemId) => {
    let res = await canUseCouponList({storeId, orderItemId})
    let list:any[] = []
    list = res.data.data.filter(item => item.available).map(item => {
      try {
        item.validTime = item.validTime.slice(0, 10)
        item.expireTime = item.expireTime.slice(0, 10)
        item.validTime = item.validTime.replace(/-/g, '.')
        item.expireTime = item.expireTime.replace(/-/g, '.')
      } catch (error) {
        console.log(error)
      }
      return item
    })
    setCouponList(list)
  }

  // phone
  const handleItemPhoneNumber = async (e: any) => {
    console.log('handleItemPhoneNumber', e);
    if (!e.detail.encryptedData) {
      util.showToast('授权失败，请重新授权');
      return;
    }
    util.showLoading(true, '获取中…');
    let params = {
      code,
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv
    };
    try {
      const res = await apiCowebs.decryptPhone(params);
      address.mobile = res.data.message;
      setAddress(prev => {
        return { ...prev, mobile: res.data.message };
      });
      Taro.hideLoading();
    } catch (err) {
      Taro.hideLoading();
    }
  };

  /**
   * 点击提交
   * @param e formId
   */
  const handleConfirmOrder = async (e: any) => {
    console.log('handleConfirmOrder', address, type, requiredAddress);
    if ((!address || !address.id) && type !== 'help' && requiredAddress) {
      util.showToast('请选择收货地址');
      return;
    }
    if (!requiredAddress) {
      if (!address.receiver) {
        util.showToast('请填写收货人');
        return;
      }
      if (!address.mobile) {
        util.showToast('请点击获取手机号');
        return;
      }
    }
    Taro.showLoading({
      title: '提交中',
      mask: true
    });
    // 支付渠道，cash：现金，wechat：微信。join：汇聚
    const payChannel = 'wechat';

    if (organizeOrderId) groupOrderJoin(payChannel);
    else if (type === 'group') groupOrderOrganize(payChannel);
    else if (type === 'help') helpOrderOrganize(payChannel);
    else orderPrepay(payChannel);
    
  };

  /**
   * 普通订单提交
   * @param payChannel 支付渠道，cash：现金，wechat：微信。join：汇聚
   * @param couponIds 优惠券Ids array[string]
   */
  const orderPrepay = async (payChannel: string) => {
    // 优惠券id
    let couponIds = (selectCoupon && selectCoupon.id) ? [selectCoupon.id] : [];
    let params: any = {
      orderItemIds: id.split('_').join(','),
      orderToken: model.orderToken,
      remark: model.remark,
      merchantType: 3,
      payChannel,
      // useWallet: payment.wallet,
      // couponIds
    };
    if (couponIds.length > 0) {
      couponIds.forEach((item, i) => {
        params[`couponIds[${i}]`]= item
      })
    }
    if (requiredAddress) {
      params.addressId = address.id;
    } else {
      params.receiver = address.receiver;
      params.mobile = address.mobile;
    }

    try {
      const res = await api.orderPrepay(params);
      let data = res.data.data;
      if (data.needPay) {
        let payParams = {
          token: data.payId
        };
        payRequestParameter(payParams, data);
      } else {
        let url = `/pagesMall/order/detail/index?id=${data.orderId}`;
        if (type === 'group') url = `/pagesMall/join-group/index?id=${data.orderId}`;
        if (type === 'help') url = `/pagesMall/firend-help/index/index?id=${data.orderId}`;
        Taro.redirectTo({ url });
        Taro.hideLoading();
        console.log('orderPrepay needPay=false');
      }
    } catch (err) {
      console.log(err);
      Taro.hideLoading();
      const data = err.data.data;
      if (data.orderToken) {
        Taro.hideLoading()
        Taro.showToast({title: '请重试', icon: 'none'})
        setModel(prev => {
          return { ...prev, orderToken: data.orderToken };
        });
      }
    }
  };

  /**
   * 团长下单（发起拼团）
   * @param payChannel 支付渠道，cash：现金，wechat：微信。join：汇聚
   * @param couponIds 优惠券Ids array[string] 暂时没有
   */
  const groupOrderOrganize = async (payChannel: string) => {
    let params: any = {
      orderToken: model.orderToken,
      payChannel,
      groupShoppingItemId: id,
      storeId: Taro.getStorageSync('storeId'),
      serviceType: 3,
      remark: model.remark,
    };
    if (requiredAddress) {
      params.addressId = address.id;
    } else {
      params.receiver = address.receiver;
      params.mobile = address.mobile;
    }
    try {
      const res = await api.groupOrderOrganize(params);
      let data = res.data.data;
      if (data.needPay) {
        let payParams = {
          token: data.payId
        };
        payRequestParameter(payParams, data);
      } else {
        let url = `/pagesMall/order/detail/index?id=${data.orderId}`;
        if (type === 'group') url = `/pagesMall/join-group/index?id=${data.orderId}`;
        if (type === 'help') url = `/pagesMall/firend-help/index/index?id=${data.orderId}`;
        Taro.redirectTo({ url });
        Taro.hideLoading();
        console.log('groupOrderOrganize needPay=false');
      }
    } catch (err) {
      console.log(err);
      const data = err.data.data;
      setModel(prev => {
        return { ...prev, orderToken: data.orderToken };
      });
    }
  };

  /**
   * 参团下单（参与拼团）
   * @param payChannel 支付渠道，cash：现金，wechat：微信。join：汇聚
   * @param couponIds 优惠券Ids array[string] 暂时没有
   */
  const groupOrderJoin = async (payChannel: string) => {
    let params: any = {
      orderToken: model.orderToken,
      payChannel,
      // useWallet: payment.wallet,
      groupShoppingItemId: id,
      storeId: Taro.getStorageSync('storeId'),
      serviceType: 3,
      remark: model.remark,
      organizeOrderId: organizeOrderId,
    };
    if (requiredAddress) {
      params.addressId = address.id;
    } else {
      params.receiver = address.receiver;
      params.mobile = address.mobile;
    }
    try {
      const res = await api.groupOrderJoin(params);
      let data = res.data.data;
      if (data.needPay) {
        let payParams = {
          token: data.payId
        };
        payRequestParameter(payParams, data);
      } else {
        let url = `/pagesMall/order/detail/index?id=${data.orderId}`;
        if (type === 'group') url = `/pagesMall/join-group/index?id=${data.orderId}`;
        if (type === 'help') url = `/pagesMall/firend-help/index/index?id=${data.orderId}`;
        Taro.redirectTo({ url });
        Taro.hideLoading();
        console.log('groupOrderJoin needPay=false');
      }
    } catch (err) {
      console.log(err);
      const data = err.data.data;
      setModel(prev => {
        return { ...prev, orderToken: data.orderToken };
      });
    }
  };

  /**
   * 助力下单
   * @param payChannel 支付渠道，cash：现金，wechat：微信。join：汇聚
   * @param couponIds 优惠券Ids array[string] 暂时没有
   */
  const helpOrderOrganize = async (payChannel: string) => {
    let params = {
      orderToken: model.orderToken,
      payChannel,
      // useWallet: payment.wallet,
      helpShoppingItemId: id,
      storeId: Taro.getStorageSync('storeId'),
      serviceType: 3,
      remark: model.remark,
      requiredDeliver: false,
    };
    try {
      const res = await api.helpOrderOrganize(params);
      let data = res.data.data;
      if (data.needPay) {
        let payParams = {
          token: data.payId
        };
        payRequestParameter(payParams, data);
      } else {
        let url = `/pagesMall/order/detail/index?id=${data.orderId}`;
        if (type === 'group') url = `/pagesMall/join-group/index?id=${data.orderId}`;
        if (type === 'help') url = `/pagesMall/firend-help/index/index?id=${data.orderId}`;
        Taro.redirectTo({ url });
        Taro.hideLoading();
        console.log('helpOrderOrganize needPay=false');
      }
    } catch (err) {
      console.log(err);
      const data = err.data.data;
      setModel(prev => {
        return { ...prev, orderToken: data.orderToken };
      });
    }
  };

  const payRequestParameter = async (payParams: any, data: any) => {
    try {
      let payRes = await api.payRequestParameter(payParams);
      let payData = payRes.data.data;
      let params = {
        timeStamp: payData.timeStamp,
        nonceStr: payData.nonceString,
        package: payData.pack,
        signType: payData.signType,
        paySign: payData.paySign
      };
      requestPayment(params, data);
    } catch (err) {
      console.log(err);
      const data = err.data.data;
      setModel(prev => {
        return { ...prev, orderToken: data.orderToken };
      });
    }
  };

  const requestPayment = async (params: any, data: any) => {
    try {
      await api.requestPayment(params);

      // setTimeout(() => {
      let url = `/pagesMall/order/detail/index?id=${data.orderId}`;
      if (type === 'group') url = `/pagesMall/join-group/index?id=${data.orderId}`;
      if (type === 'help') url = `/pagesMall/firend-help/index/index?id=${data.orderId}`;
      Taro.redirectTo({ url });
      Taro.hideLoading();
      // }, 1000);
    } catch (err) {
      console.log(err);
      util.showToast('取消支付');
      if (type === 'group' || type === 'help') {
        orderPrepare(type, id, formId);
      } else {
        let url = `/pagesMall/order/detail/index?id=${data.orderId}`;
        Taro.redirectTo({ url });
      }
    }
  };

  return (
    <ThemeView>
      <View className='confirm-order'>
        <LoadingBox visible={pageLoading} />

        <View className='relative'>
          {type !== 'help' &&
            (requiredAddress ? (
              <Block>
                <View
                  className='address-wrap'
                  onClick={() => util.navigateTo(`/pagesCommon/address/list/index?action=true`)}>
                  <View className='qcfont qc-icon-dizhi place'></View>
                  {address.id ? (
                    <View className='info'>
                      <View className='name'>
                        收货人：{address.receiver} {address.mobile}
                      </View>
                      <View className='address'>地址：{address.fullAddress}</View>
                    </View>
                  ) : (
                    <View className='info'>
                      <View className='name'>请选择收货地址</View>
                    </View>
                  )}
                  <View className='qcfont qc-icon-chevron-right arrow'></View>
                </View>
                <DividingLine />
              </Block>
            ) : (
              <Block>
                <View className='address-wrap'>
                  <View className='input-box'>
                    <View className='cell'>
                      <View className='label'>收货人</View>
                      <View className='value'>
                        <Input
                          placeholder='请输入收货人'
                          value={address.receiver}
                          onInput={(e: any) => {
                            setAddress(prev => {
                              return { ...prev, receiver: e.detail.value };
                            });
                          }}
                        />
                      </View>
                    </View>
                    <View className='cell'>
                      <View className='label'>手机号</View>
                      <View className='value'>
                        <Input placeholder='请点击获取手机号' value={address.mobile} disabled />
                        <Button
                          openType='getPhoneNumber'
                          hoverClass='hover-button'
                          onGetPhoneNumber={e => handleItemPhoneNumber(e)}>
                          获取
                        </Button>
                      </View>
                    </View>
                  </View>
                </View>
                <DividingLine />
              </Block>
            ))}

          <View className='content'>
            {orderItems.length &&
              orderItems.map((item: any) => {
                return <ConfirmOrderGoodsItem item={item} key={item.id} memberStatus={memberStatus} />;
              })}
            {requiredAddress && (
              <View className='payway-wrap'>
                <View className='way'>配送方式</View>
                {type === 'help' ? (
                  <View>现场领取</View>
                ) : (
                  <View>
                    快递 {model.transportAmount > 0 ? `${util.filterPrice(model.transportAmount)}元` : '包邮'}
                  </View>
                )}
              </View>
            )}
            {/* 优惠券 */}
            {showCoupon && (
            <View className='coupon-wrap' onClick={() => setCouponVisible(true)}>
              <View className='left'>优惠券</View>
              <View className='right'>
                {model.storeCouponPayAmount ? '-￥'+util.filterPrice(model.storeCouponPayAmount) : (couponList.length > 0 ? couponList.length+'张可用' : '暂无可用')} 
                <Text className='qcfont qc-icon-chevron-right'></Text>
              </View>
            </View>)}
            
            {!couponVisible && (<View className='comment-wrap'>
              <View className='name'>留言</View>
              {!pageLoading && (
                <Textarea
                  value={model.remark}
                  placeholder={`${pageLoading ? '' : '说点什么吧~（选填，不可大于64字）'}`}
                  maxlength={64}
                  className='area'
                  onInput={e => {
                    setModel((prev: any) => {
                      return { ...prev, remark: e.detail.value };
                    });
                  }}
                />
              )}
            </View>)}
          </View>
        </View>

        <LogoWrap bottom={110} />

        <Form onSubmit={handleConfirmOrder}>
          <View className='bottom-bar'>
            <View className='left'>
              <View className='top'>
                <Text>合计：</Text>
                <Text className='price'>{util.filterPrice(model.totalAmount_2)}</Text>
              </View>
              {/* <View className="sheng">会员已省￥20.00</View> */}
            </View>
            <Button className='jiesuan' formType='submit' loading={btnLoading} disabled={btnLoading}>
              去结算
            </Button>
          </View>
        </Form>
      </View>

      {/* 优惠券弹窗 */}
      <Dialog visible={couponVisible} 
        position='bottom' 
        onClose={() => setCouponVisible(false)}
        >
        <View className='dialog-coupon'>
          <View className='dialog-coupon__header'>
            <Text>可用优惠券</Text>
            {/* <Text 
                className='qcfont 
                qc-icon-close' 
                onClick={() => setCouponVisible(false)}></Text> */}
          </View>
          <ScrollView className='dialog-coupon__body' scrollY >
            {!couponList.length && <View className='no-coupon'>暂无可用优惠券</View>}
            {couponList.map(item => {
              return (
                <View className='item' key={item.id} onClick={() => {
                  setSelectCouponCopy(item)
                  // setCouponVisible(false)
                  // orderPrepare(type, id, formId, {'couponIds[0]': item.id})
                }}>
                  <View className='item__left'>
                    <Text className='price'>{util.chu(item.amount, 100)}</Text>
                  </View>
                  <View className='item__right'>
                    <View className='item--title'>{item.title}</View>
                    <View className='item--rule'>{item.ruleName}</View>
                    <View className='item--date'>有效期 {item.validTime}-{item.expireTime}</View>
                  </View>
                  <View className='item__check'>
                    {selectCouponCopy.id == item.id 
                      ? <Text className='qcfont qc-icon-checked'></Text>
                      : <Text className='qcfont qc-icon-check'></Text>
                    }
                  </View>
                </View>
              )
            })}
            {couponList.length && (
              <View className='item-nouse' onClick={() => {
                setSelectCouponCopy({id: 'noUse'})
                // setCouponVisible(false)
              }}>
                <View className='item-nouse__left'>不使用优惠券</View>
                <View className='item-nouse__check'>
                  {selectCouponCopy.id == 'noUse'
                    ? <Text className='qcfont qc-icon-checked'></Text>
                    : <Text className='qcfont qc-icon-check'></Text>
                  }
                </View>
              </View>
            )}
          </ScrollView>
          <View className='dialog-coupon__bottom'>
            {/* <View className='btn' onClick={() => {
              setSelectCoupon({})
              setCouponVisible(false)
            }}>不使用优惠券</View> */}
            <View className='btn' onClick={() => {
              setCouponVisible(false)
              setSelectCoupon({...selectCouponCopy, id: selectCouponCopy.id == 'noUse' ? '' : selectCouponCopy.id})
            }}>完成</View>
          </View>
        </View>
      </Dialog>
    </ThemeView>
  );
}

ConfirmOrder.config = {
  navigationBarTitleText: '确认订单',
  enablePullDownRefresh: true,
};
