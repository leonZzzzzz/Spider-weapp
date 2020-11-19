import Taro, { useDidShow, useState } from '@tarojs/taro';
import { View, Text, Image, Block, Button } from '@tarojs/components';
import { QcMenuCard } from '@/components/common';
import { getOrderStatus } from '@/api/order';
import { getCartNum } from '@/api/cart';
import { userInfo, updateMember, authorize } from '@/api/common';
import './index.scss';
import { useTabbar } from '@/useHooks/useFlywheel';

let orderCount = [
  {
    id: 0,
    title: '待支付',
    icon: 'qc-icon-qianbao',
    count: 0,
    url: '/pagesMall/order/list/index?type=0'
  },
  {
    id: 1,
    title: '待发货',
    icon: 'qc-icon-daifahuo',
    count: 0,
    url: '/pagesMall/order/list/index?type=1'
  },
  {
    id: 2,
    title: '待收货',
    icon: 'qc-icon-daishouhuo',
    count: 0,
    url: '/pagesMall/order/list/index?type=2'
  },
  {
    id: 10,
    title: '已完成',
    icon: 'qc-icon-yiwancheng',
    count: 0,
    url: '/pagesMall/order/list/index?type=10'
  },
  {
    id: 4,
    title: '售后',
    icon: 'qc-icon-shouhou',
    count: 0,
    url: '/pagesMall/after/list-sales-order/index'
  }
];

const serveGroup = [
  {
    id: 8,
    title: '我的地址',
    url: '/pagesMine/mine/address/index',
    icon: 'qc-icon-dizhi'
  }
];

function Personal() {
  const [user, setUser] = useState<any>();
  const [orderCountGroup, setOrderCountGroup] = useState<any[]>(orderCount);
  const [cartCount, setCartCount] = useState<number>(0);
  const [memberId, setMemberId] = useState<string>('');
  useTabbar()
  useDidShow(() => {
    const _memberId = Taro.getStorageSync('memberId');
    if (_memberId) {
      setMemberId(_memberId);
      apiGetOrderStatus();
      apiGetCartNum();
      apiUserInfo();
    }
  });

  async function apiUserInfo() {
    const res = await userInfo();
    setUser(res.data.data);
  }

  async function apiGetCartNum() {
    const res = await getCartNum();
    setCartCount(res.data.data.qty);
  }

  async function apiGetOrderStatus() {
    const res = await getOrderStatus();
    const {
      afterSaleQuantity,
      finishQuantity,
      undeliveredQuantity,
      unpaidQuantity,
      unreceivedQuantity
    } = res.data.data;
    orderCountGroup[0].count = unpaidQuantity;
    orderCountGroup[1].count = undeliveredQuantity;
    orderCountGroup[2].count = unreceivedQuantity;
    orderCountGroup[3].count = finishQuantity;
    orderCountGroup[4].count = afterSaleQuantity;
    setOrderCountGroup(orderCountGroup);
  }
  async function getUserInfo(e: any) {
    if (e.detail.userInfo) {
      // const { avatarUrl, nickName } = e.detail.userInfo;
      // updateMember({ appellation: nickName, headImage: avatarUrl }).then(res => {
      //   console.log(res);
      // });
      await Taro.setStorage({
        key: 'userInfo',
        data: e.detail.userInfo
      });
      const code = await Taro.login();
      const res = await authorize({ code: code.code });
      console.log(res.data.data);
    }
  }
  function onJumpPage() {
    Taro.navigateTo({url:'/pagesCoWebs/authorize/index'})
  }
  return (
    <View className='personal'>
      <View className='circle'></View>
      <View className='personal-content'>
        <View className='personal-content__user'>
          {memberId ? (
            <Block>
              <View className='personal-content__user-info'>
                <Image src={user.headImage} className='personal-content__user-img'></Image>
                <View className='personal-content__user-name'>{user.appellation}</View>
                <View className='personal-content__user-tag'>普通用户</View>
              </View>
              <View className='personal-content__user-detail'>
                <Text>查看资料</Text>
                <Text className='personal-content__user-detail-icon qcfont qc-icon-chevron-right' />
              </View>
            </Block>
          ) : (
            // <Button className='personal-content__user-login' openType='getUserInfo' onGetUserInfo={getUserInfo}>
            //   <View className='personal-content__user-img'></View>
            //   <View className='personal-content__user-name'>登录/注册</View>
            // </Button>
            <Button className='personal-content__user-login' onClick={onJumpPage}>
              <View className='personal-content__user-img'></View>
              <View className='personal-content__user-name'>登录/注册</View>
            </Button>
          )}
        </View>
      </View>

      <View className='price-wrap'>
        <View className='group'>
          <View className='item'>
            <View className='num'>0</View>
            <View className='text'>喜欢</View>
          </View>
          <View className='item'>
            <View className='num'>0</View>
            <View className='text'>钱包</View>
          </View>
          <View className='item'>
            <View className='num'>{cartCount}</View>
            <View className='text'>
              <Text>购物车</Text>
              <View className='dot' />
            </View>
          </View>
        </View>
        {/* <View className="news">
          <View className="title">
            <Text className="t-1">最新</Text>
            <Text className="t-2">消息</Text>
          </View>
          <View className="content">
            <Text className="c-t">12323</Text>
            <Text className="iconfont iyoujiantou" />
          </View>
        </View> */}
      </View>
      <QcMenuCard
        title='我的订单'
        info='查看更多'
        onMore={() => {
          Taro.navigateTo({ url: '/pagesMall/order/list/index' });
        }}>
        <View className='group'>
          {orderCountGroup.map((item: any) => {
            return (
              <View
                className='g-item'
                key={item.id}
                onClick={() => {
                  Taro.navigateTo({ url: item.url });
                }}>
                {item.count && <View className='count'>{item.count}</View>}
                <View className={`qcfont ${item.icon}`} />
                <View className='title'>{item.title}</View>
              </View>
            );
          })}
        </View>
      </QcMenuCard>

      <QcMenuCard title='我的服务'>
        <View className='group'>
          <View className='s-group'>
            {serveGroup.map((item: any) => {
              return (
                <View
                  className='s-item'
                  key={item.id}
                  onClick={() => {
                    Taro.navigateTo({
                      url: '/pagesCommon/address/list/index'
                    });
                  }}>
                  <View className={`qcfont ${item.icon}`} />
                  <View>{item.title}</View>
                </View>
              );
            })}
          </View>
        </View>
      </QcMenuCard>
    </View>
  );
}
Personal.config = {
  navigationBarTitleText: '个人中心'
};
export default Personal;
