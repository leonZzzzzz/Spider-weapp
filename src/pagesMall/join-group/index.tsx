import Taro, { useState, useEffect, useRouter, useDidShow, usePullDownRefresh, useShareAppMessage } from '@tarojs/taro';
import { View, Text, Button, Image } from '@tarojs/components';
import withShare from '@/utils/withShare';
import { LogoWrap, LoadingBox, AuthorizeWrap, ThemeView } from '@/components/common';
import { JoinGroupItem, CountDown, RecommendWrap } from '@/components/mall';
import { IMG_HOST, HOME_PATH } from '@/config';
import api from '@/api/mall';
import util from '@/utils/util';
import './index.scss';
import { checkAuthorize } from '@/utils/authorize';

export default function JoinAssemble() {
  const [authorizeVisible, setAuthorizeVisible] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [list, setList] = useState<any[]>([]);
  const [order, setOrder] = useState<any>({});
  const [self, setSelf] = useState<any>({});
  const [recommendList, setRecommendList] = useState<any[]>([]);
  const [orderId, setOrderId] = useState('');
  const [isMount, setIsMount] = useState(false);
  const { id } = useRouter().params;

  useEffect(() => {
    Taro.hideShareMenu();
    setOrderId(id);
    groupDetail(id);
    groupProductPage();
  }, []);

  useDidShow(() => {
    if (!isMount) return;
    groupDetail(id);
  });

  usePullDownRefresh(() => {
    setPageLoading(true);
    groupDetail(orderId);
    groupProductPage();
  });

  useShareAppMessage(() => {
    return withShare({
      title: order.orderItems[0].name,
      imageUrl: IMG_HOST + order.orderItems[0].iconUrl,
      path: `/pagesMall/join-group/index?id=${orderId}`
    });
  });

  /**
   * 商品订单参团情况
   * @param orderId 订单id
   */
  const groupDetail = async (orderId: string) => {
    try {
      const res = await api.groupDetail({ orderId });
      let data = res.data.data;
      setList(data.list);
      setOrder(data.order);
      setSelf(data.self);
      setPageLoading(false);
      Taro.stopPullDownRefresh();
      setIsMount(true);
    } catch (err) {
      setIsMount(true);
      Taro.stopPullDownRefresh();
      // setPageLoading(false)
      // const memberId = Taro.getStorageSync('memberId');
      // if (!memberId) setAuthorizeVisible(true);
    }
  };

  const groupProductPage = async () => {
    let params = {
      pageNum: 1,
      pageSize: 10,
      storeId: Taro.getStorageSync('storeId'),
      orderBy: 'salesQty',
      asc: 0
    };
    const res = await api.groupProductPage(params);
    setRecommendList(res.data.data.list);
  };

  const handleTimeEnd = () => {
    console.log('handleTimeEnd');
    cancelUnGroup();
    // groupDetail(orderId);
  };

  const cancelUnGroup = async () => {
    const res = await api.cancelUnGroup({ orderId: id });
    setPageLoading(true);
    groupDetail(orderId);
  };

  return (
    <ThemeView>
      <LoadingBox visible={pageLoading} />

      <View className='page relative'>
        <View className='red'></View>
        {order.orderItems &&
          order.orderItems.map((item: any) => {
            return (
              <JoinGroupItem
                key={item.id}
                item={item}
                state={order.groupStatus}
                groupQuantity={order.groupQuantity}
                type='product'
              />
            );
          })}

        {/* <Button onClick={cancelUnGroup} type='primary'>
          取消
        </Button> */}

        <View className='time-wrap'>
          {order.groupStatus === 2 ? (
            <View className='success-state'>恭喜拼团成功！</View>
          ) : order.groupStatus === -1 ? (
            <View className='fail-state'>
              还差
              <Text>{order.groupNeedQuantity}</Text>
              人，拼团失败！
            </View>
          ) : (
            <View>
              <View className='divider-wrap'>
                <View className='line left'></View>
                <View className='text'>距离结束还剩</View>
                <View className='line right'></View>
              </View>
              <View className='count-down'>
                <CountDown endTime={order.groupExpireTime} onEnd={handleTimeEnd} />
              </View>
              <View className='num-wrap'>
                <Text>{order.groupQuantity}</Text>人成团，还差
                <Text>{order.groupNeedQuantity}</Text>人
              </View>
            </View>
          )}

          <View className='chengtuan-wrap'>
            {list.map((item: any) => {
              return (
                <View className='item' key={item.id}>
                  {item.organizer && <View className='top'>团长</View>}
                  <View className='head'>
                    <Image mode='widthFix' src={item.buyerHeader} />
                  </View>
                  <View className='name'>{item.buyerName}</View>
                </View>
              );
            })}
            {order.groupNeedQuantity && (
              <View className='item not'>
                <View className='head'>
                  <Text className='iconfont icon-share' />
                </View>
                <View className='name'>待参团</View>
              </View>
            )}
          </View>

          {/* 未参团，拼团成功或失败 */}
          {(order.groupStatus === 2 || order.groupStatus === -1) && !self.isJoined && !self.isOrganizer && (
            <View className='button-wrap'>
              <Button
                className='primary'
                onClick={() => util.navigateTo(`/pagesMall/group-product/detail/index?id=${order.groupShoppingId}`)}>
                我要开团
              </Button>
              <Button className='border d-line' onClick={() => util.navigateTo(HOME_PATH)}>
                返回首页
              </Button>
            </View>
          )}

          {/* 已参团，拼团进行中 */}
          {order.groupStatus === 1 && self.isJoined && (
            <View className='button-wrap'>
              <View className='text'>拼团正在进行，赶快邀请好友加入吧~</View>
              <Button openType='share' className='primary'>
                邀请小伙伴
              </Button>

              <Button
                className='primary d-line'
                onClick={() => util.navigateTo(`/pagesMall/order/detail/index?id=${self.orderId}`)}>
                查看订单
              </Button>
              <Button className='border d-line' onClick={() => util.navigateTo(HOME_PATH)}>
                返回首页
              </Button>
            </View>
          )}

          {/* 未参团，拼团进行中 */}
          {order.groupStatus === 1 && !self.isJoined && !self.isOrganizer && (
            <View className='button-wrap'>
              <View className='text'>拼团正在进行，一起享受最优惠的价格吧~</View>

              <Button
                className='primary'
                onClick={() =>
                  util.navigateTo(
                    `/pagesMall/group-product/detail/index?join=1&id=${order.groupShoppingId}&organizeOrderId=${order.organizeOrderId}`
                  )
                }>
                我也要参团
              </Button>
              <Button className='border d-line' onClick={() => util.navigateTo(HOME_PATH)}>
                返回首页
              </Button>
            </View>
          )}

          {/* 已参团，拼团成功 */}
          {self.isJoined && order.groupStatus === 2 && (
            <View className='button-wrap'>
              <Button
                className='primary'
                onClick={() => util.navigateTo(`/pagesMall/order/detail/index?id=${self.orderId}`)}>
                查看订单
              </Button>
              <Button className='border d-line' onClick={() => util.navigateTo(HOME_PATH)}>
                返回首页
              </Button>
            </View>
          )}

          {/* 已参团，拼团失败 */}
          {self.isJoined && order.groupStatus === -1 && (
            <View className='button-wrap'>
              <View className='text'>优惠不可等，再次发起拼团吧~</View>
              <Button
                className='primary'
                onClick={() => util.navigateTo(`/pagesMall/group-product/detail/index?id=${order.groupShoppingId}`)}>
                再来一单
              </Button>
              <Button className='border d-line' onClick={() => util.navigateTo(HOME_PATH)}>
                返回首页
              </Button>
            </View>
          )}
        </View>

        <RecommendWrap list={recommendList} url='/pagesMall/group-product/index/index' title='大家都在拼' />
      </View>
      <LogoWrap />
      <AuthorizeWrap visible={authorizeVisible} />
    </ThemeView>
  );
}

JoinAssemble.config = {
  navigationBarTitleText: '拼团详情',
  enablePullDownRefresh: true
};
