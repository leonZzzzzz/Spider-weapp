import { View, Image, Text, Button, Block } from '@tarojs/components';
import Taro, { useState, useEffect, useDidShow } from '@tarojs/taro';
import api from '@/api/index';
import util from '@/utils/util';
import { AuthorizeWrap, LogoWrap, Dialog, ThemeView } from '@/components/common';
import { IMG_HOST, baseUrl } from '@/config';
import { checkAuthorize } from '@/utils/authorize';
import { personalMall, getprivatefolder } from '@/api/common';
import './index.scss';

export const MyIndex = () => {
  const [authorizeVisible, setAuthorizeVisible] = useState(false);
  const [member, setMember] = useState<any>({});
  const [contactsInfo, setContactsInfo] = useState<any>({});
  const [userauthorize, setUserauthorize] = useState<any>({});
  const [customerVisible, setCustomerVisible] = useState(false);
  const [phone, setPhone] = useState('');
  const [menu, setMenu] = useState<any[]>([]);
  const [orderCountGroup, setOrderCountGroup] = useState<any[]>([
    {
      id: 0,
      title: '待支付',
      icon: 'qc-icon-qianbao',
      count: 0,
      path: '/pagesMall/order/list/index?type=0'
    },
    {
      id: 1,
      title: '待发货',
      icon: 'qc-icon-daifahuo11',
      count: 0,
      path: '/pagesMall/order/list/index?type=1'
    },
    {
      id: 2,
      title: '待收货',
      icon: 'qc-icon-daishouhuo',
      count: 0,
      path: '/pagesMall/order/list/index?type=2'
    },
    {
      id: 10,
      title: '已完成',
      icon: 'qc-icon-yiwancheng',
      count: 0,
      path: '/pagesMall/order/list/index?type=10'
    },
    {
      id: 4,
      title: '售后',
      icon: 'qc-icon-shouhou',
      count: 0,
      path: '/pagesMall/after-sales-order/index'
    }
  ]);
  const [sumGroup, setSumGroup] = useState<any>({
    collection: 0,
    balance: 0,
    shopCart: 0
  });
  const [visibleMallWrap, setVisibleMallWrap] = useState('0');
  const [membership, setMembership] = useState<any>({});
  const [visibleMemberShip, setVisibleMemberShip] = useState(false);
  const [memberLevelFeeTip, setMemberLevelFeeTip] = useState('');

  useEffect(() => {
    myMenu();
    getAppCustomer();
    personalMall().then(res => {
      if (res.data.data) {
        setVisibleMallWrap(res.data.data.value);
      }
    });
  }, []);
  useDidShow(async () => {
    const memberInfo = Taro.getStorageSync('memberInfo');
    const contacts = Taro.getStorageSync('contactsInfo');
    setMember(memberInfo);
    setContactsInfo(contacts);
    // if (visibleMallWrap == '1' && memberInfo) {
    //   getOrderCount();
    //   getSumGroupData();
    // }
    initMemberLevelData(memberInfo);
    if (memberInfo.id) {
      contactsGet()
    }

  });

  useEffect(() => {
    if (visibleMallWrap == '1' && member.id) {
      getOrderCount();
      getSumGroupData();
    }
  }, [visibleMallWrap, member]);

  const contactsGet = async () => {
    try {
      const res = await api.contactsGet();
      setContactsInfo(res.data.data);
    } catch (error) {
      setContactsInfo({});
    }
  };
  const getAppCustomer = async () => {
    const res = await api.getAppCustomer();
    const data = res.data.data || {};
    setPhone(data.value || '');
  };
  const myMenu = async () => {
    const res = await api.myMenu();
    setMenu(res.data.data);
  };

  const navigateTo = async (item: any) => {
    if (/客服/.test(item.showName)) {
      setCustomerVisible(true);
      return;
    }
    // if (/校友录/.test(item.showName) && !contactsInfo) {
    //   Taro.showToast({ title: '暂无权限', icon: 'none' });
    //   return;
    // }
    if (/校友录/.test(item.showName)) {
      const res = await getprivatefolder()
      setUserauthorize(res.data.data.contactStatus)
      if (res.data.data.contactStatus != 2) {
        Taro.showToast({ title: '您不是认证会员，暂无查看权限', icon: 'none' });
        return;
      }
    }
    // checkAuthorize({
    //   success: () => {
    util.navigateTo(item.path);
    //   }
    // });
  };

  const makePhoneCall = async () => {
    if (!phone) {
      Taro.showToast({
        title: '没有号码，请先配置',
        icon: 'none'
      });
      return;
    }
    try {
      await Taro.makePhoneCall({
        phoneNumber: phone || ''
      });
    } catch (err) {
      console.log(err);
    }
  };

  // 订单
  const getOrderCount = async () => {
    const res = await api.getOrderCount();
    const data = res.data.data;
    console.log('getOrderCount', data);
    setOrderCountGroup(prev => {
      prev[0].count = data.unpaidQuantity;
      prev[1].count = data.undeliveredQuantity;
      prev[2].count = data.unreceivedQuantity;
      prev[3].count = data.finishQuantity;
      prev[4].count = data.afterSaleQuantity;
      return [...prev];
    });
  };

  const getSumGroupData = async () => {
    const promiseArray = [api.walletGetAmount(), api.productCollectionGetQuantity(), api.getCartNum()];
    const result = await Promise.all(promiseArray);
    setSumGroup({
      balance: result[0].data.data.amount,
      collection: result[1].data.data.quantity,
      shopCart: result[2].data.data.qty
    });
  };

  // 获取会费配置和头衔
  const initMemberLevelData = async memberInfo => {
    let promises = [api.memberLevelFeeGetTips()];
    if (memberInfo.id) promises.push(api.memberLevelJoinGetMember());
    const result = await Promise.all(promises);
    const _messageTips = result[0].data.message || '';
    if (_messageTips) {
      setMemberLevelFeeTip(_messageTips);
      setVisibleMemberShip(true);
    }
    if (!memberInfo.id) return;
    const _membership = result[1].data.data || {};
    if (_membership.memberLevelId) {
      const res = await api.getIsAllowUnexpiredRenewal();
      _membership.isAllowUnexpiredRenewal = res.data.data;
      setMembership(_membership);
    }
  };

  return (
    <ThemeView>
      <View className='my-index'>
        <View className='relative'>
          <View className='info-wrap'>
            <View className='info'>
              <View className='head-image'>
                {member.id ? (
                  <Image src={member.headImage || `${IMG_HOST}/static/avatar.png`} mode='aspectFill' />
                ) : (
                    <Text className='qcfont qc-icon--user default-head' />
                  )}
              </View>
              <View className='text-wrap'>
                <View className='name'>
                  {member.id ? (
                    <View className='name-line'>
                      <Text>{member.name || member.appellation}</Text>
                      {membership.memberLevelId && membership.memberLevel && (
                        <View className='title-rank'>
                          <View className='icon'>
                            <Image src={IMG_HOST + membership.memberLevel.iconUrl} mode='aspectFill' />
                          </View>
                          <Text className='rank-name'>{membership.memberLevel.name}</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                      <Text
                        onClick={() => {
                          checkAuthorize({});
                        }}>
                        立刻登录
                      </Text>
                    )}
                  {/* <Text className="class">{member.className}</Text> */}
                  {contactsInfo.isBind && <Text className='qcfont qc-icon-renzheng tag' />}
                </View>
                <View className='mt-20'>{member.mobile || member.phone}</View>
              </View>
            </View>
            {/* {contactsInfo.isBind && (
              <View style='color:#fff' onClick={() => Taro.navigateTo({ url: '/pagesCoWebs/perfectInfo/index' })}>完善资料
                <Text className="qcfont qc-icon-chevron-right"></Text>
              </View>
            )} */}

            {contactsInfo.isBind && (
              <View
                className='edit qcfont qc-icon-bianji'
                onClick={() => Taro.navigateTo({ url: '/pagesCoWebs/my/card-edit/index' })}></View>
            )}
          </View>
          {visibleMemberShip && (
            <View
              className='open-member-tip'
              onClick={() => {
                if (member.id) {
                  util.navigateTo('/pagesCoWebs/membership/index/index');
                } else {
                  checkAuthorize({
                    success: () => {
                      util.navigateTo('/pagesCoWebs/membership/index/index');
                    }
                  });
                }
              }}>
              <View className='open-member-tip-text'>
                {membership.memberLevelId ? (
                  <Text>会员有效期至：{membership.endTime.substring(0, 10)}</Text>
                ) : (
                    <Text>{memberLevelFeeTip}</Text>
                  )}
              </View>
              {/* {((membership.memberLevelId && membership.isAllowUnexpiredRenewal) || !membership.memberLevelId) && (
                <View className='open-member-tip-go'>
                  {membership.isAllowUnexpiredRenewal && <Text>立即续费</Text>}
                  <Text className='qcfont qc-icon-chevron-right' />
                </View>
              )} */}
              <View className='open-member-tip-go'>
                {membership.isAllowUnexpiredRenewal && <Text>立即续费</Text>}
                <Text className='qcfont qc-icon-chevron-right' />
              </View>
            </View>
          )}

          {/* <View className="data-items">
          <View className="item" hoverClass="hover-white-color">
            <View className="num">{activityNum}</View>
            <View>参与活动</View>
          </View>
          <View className="item" hoverClass="hover-white-color">
            <View className="num">5624</View>
            <View>我的粉丝</View>
          </View>
          <View className="item" hoverClass="hover-white-color">
            <View className="num">23</View>
            <View>关注名片</View>
          </View>
        </View> */}

          {/* <View className="group-items">
          {groups.map((item: any) => {
            return (
              <View key={item.id} className="item" style={{color: item.color || '#000'}} hoverClass="hover-white-color" onClick={() => navigateTo(item.url)}>
                <View className={`${item.icon} qcfont`} />
                <View className="title">{item.title}</View>
              </View>
            )
          })}
        </View> */}
          {visibleMallWrap === '1' && (
            <Block>
              <View className='mall-sum-wrap'>
                <View className='item' onClick={() => navigateTo({ path: '/pagesMall/product-collection/index' })}>
                  <View className='num'>{sumGroup.collection || 0}</View>
                  <View className='text'>喜欢</View>
                </View>
                <View className='item' onClick={() => navigateTo({ path: '/pagesMall/wallet/index' })}>
                  <View className='num'>{util.filterPrice(sumGroup.balance)}</View>
                  <View className='text'>钱包</View>
                </View>
                <View className='item' onClick={() => navigateTo({ path: '/pages/cart/index' })}>
                  <View className='num'>{sumGroup.shopCart || 0}</View>
                  <View className='text'>
                    <Text>购物车</Text>
                    {sumGroup.shopCart > 0 && <View className='dot' />}
                  </View>
                </View>
              </View>

              <View className='mall-order-items-wrap'>
                <View className='t-wrap'>
                  <View>我的订单</View>
                  <View className='more' onClick={() => navigateTo({ path: '/pagesMall/order/list/index' })}>
                    <Text>查看全部</Text>
                    <Text className='qcfont qc-icon-chevron-right' />
                  </View>
                </View>
                <View className='group'>
                  {orderCountGroup.map((item: any) => {
                    return (
                      <View className='g-item' hoverClass='active' key={item.id} onClick={() => navigateTo(item)}>
                        {item.count && <View className='count'>{item.count}</View>}
                        <View className={`qcfont ${item.icon}`} />
                        <View className='title'>{item.title}</View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </Block>
          )}

          <View className='cell-items'>
            {menu.map((item: any) => {
              return (
                <View key={item.id} className='item' hoverClass='hover-white-color' onClick={() => navigateTo(item)}>
                  <View className='left'>
                    <View className='icon'>
                      <Image src={IMG_HOST + item.icon} mode='aspectFill' />
                    </View>
                    <Text>{item.showName}</Text>
                  </View>
                  <View className='right'>
                    <Text className='qcfont qc-icon-chevron-right' />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
        <LogoWrap />
        <AuthorizeWrap visible={authorizeVisible} isClose={true} onHide={() => setAuthorizeVisible(false)} />

        <Dialog visible={customerVisible} position='center' onClose={() => setCustomerVisible(false)}>
          <View className='kefu-dialog'>
            <View className='kefu-btn'>
              <Button hoverClass='hover-button' onClick={makePhoneCall}>
                一键拨号
              </Button>
            </View>
            <View className='kefu-btn'>
              <Button hoverClass='hover-button' openType='contact'>
                联系微信客服
              </Button>
            </View>
          </View>
        </Dialog>
      </View>
    </ThemeView>
  );
};

MyIndex.config = {
  navigationBarTitleText: '我'
};
