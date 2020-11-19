import Taro, {
  useState,
  useEffect,
  useReachBottom,
  usePullDownRefresh,
  useDidShow,
  usePageScroll,
  useShareAppMessage
} from '@tarojs/taro';
import { View, Text, Button } from '@tarojs/components';
import './index.scss';

import api from '@/api/index';
import util from '@/utils/util';
import useGetListData from '@/useHooks/useGetListData';
import withShare from '@/utils/withShare';
import { IMG_HOST } from '@/config';

import {
  QcEmptyPage,
  LoadingBox,
  TabsWrap,
  LogoWrap,
  Avatar,
  DividingLine,
  ThemeView,
  ShareWrap
} from '@/components/common';
import { PromotionItem } from '@/components/promotion';

import { useSelector, useDispatch } from '@tarojs/redux';
import { distributerInitUser, distributerInitSummary } from '@/store/actions/distributer';
import { checkVisitor } from '@/utils/authorize';

export default function Index() {
  const { user, summary } = useSelector((state: any) => state.distributer);
  const dispatch = useDispatch();

  const [pageLoading, setPageLoading] = useState(true);
  const [tabList] = useState<any[]>([
    { title: '推广活动', id: 0, apiStr: 'activityDistributerPage' }
    // { title: '推广课程', id: 1, apiStr: 'activityPage' },
    // { title: '推广商品', id: 2, apiStr: 'coursePage' },
  ]);
  const [current, setCurrent] = useState(0);
  const [isFixed, setIsFixed] = useState(false);
  const [tabsTop, setTabsTop] = useState(0);
  const [shareVisible, setShareVisible] = useState(false);
  const [shareData, setShareData] = useState<any>({});
  const { list, load, setApiStr } = useGetListData('activityDistributerPage', {}, false);

  useEffect(() => {
    distributerGet();
    getHeight();
  }, []);

  useReachBottom(() => {
    load(true);
  });

  usePullDownRefresh(() => {
    distributerGet();
  });

  // useShareAppMessage(() => {
  //   return withShare();
  // });
  useShareAppMessage(() => {
    return withShare({
      title: shareData.title,
      imageUrl: IMG_HOST + shareData.iconUrl,
      path: `/pagesCoWebs/activity/${shareData.showStyle === 2 ? 'detail-commission' : 'detail'}/index?id=${
        shareData.id
      }&bindScene=${shareData.scene}&type=distributer`
    });
  });

  usePageScroll(res => {
    setIsFixed(res.scrollTop > tabsTop);
  });

  const distributerGet = async () => {
    try {
      const res = await api.distributerGet();
      const data = res.data.data;
      if (data.isDistributer) {
        load();
        distributerSummary();
        setPageLoading(false);
        dispatch(distributerInitUser(data));
        if (data.status === 'waiting-audit') {
          showModal();
        }
      } else {
        Taro.redirectTo({
          url: '/pagesPromotion/distributer/recruit/index'
        });
      }
    } catch (err) {
      util.showToast(err.data.message);
      setTimeout(() => {
        Taro.navigateBack();
      }, 2000);
    }
  };

  const distributerSummary = async () => {
    const res = await api.distributerSummary();
    // setSummary(res.data.data)
    dispatch(distributerInitSummary(res.data.data));
  };

  const getHeight = () => {
    const query = Taro.createSelectorQuery();
    query.select('.tabs').boundingClientRect();
    query.exec(res => {
      setTabsTop(res[0] ? res[0].top : 0);
    });
  };

  const handleClickTabs = (e: number) => {
    setCurrent(e);
    setApiStr(tabList[e].apiStr);
  };

  const handleGetUserInfo = async (e, type: 'poster' | 'share') => {
    const {
      detail: { userInfo }
    } = e;
    if (userInfo) {
      const url =
        type === 'poster' ? '/pagesCoWebs/my/invite-poster/index' : '/pagesPromotion/distributer/invite-poster/index';

      const memberInfo = Taro.getStorageSync('memberInfo') || {};
      if (!memberInfo.id || !memberInfo.headImage || !memberInfo.name) {
        await checkVisitor(e);
        await distributerGet();
      }
      util.navigateTo(url);
    }
  };

  const showModal = async () => {
    const { confirm } = await Taro.showModal({
      title: '提示',
      content: '审核中，请等待',
      confirmText: '返回',
      showCancel: false
    });
    if (confirm) {
      Taro.navigateBack();
    }
  };

  const handlePoster = async (item: any) => {
    if (shareData.id === item.id) {
      setShareVisible(true);
      return;
    }
    util.showLoading(true);
    const res = await api.distributerQrcodeGetActivity({
      activityId: item.id,
      showStyle: item.showStyle,
      page: 'pagesPromotion/transfer/index'
    });
    setShareData({ ...item, scene: res.data.data.scene });
    setShareVisible(true);
    util.showLoading(false);
  };

  return (
    <ThemeView>
      <View className='promotion'>
        <LoadingBox visible={pageLoading} />

        <View className='user-container'>
          <View className='user-wrap'>
            <View className='info'>
              <Avatar imgUrl={user.headImage} width={70} />
              <View className='name-text'>
                <View className='name'>{user.name}</View>
              </View>
            </View>
            <View className='rule' onClick={() => util.navigateTo('/pagesPromotion/distributer/rule/index')}>
              <Text>推广规则</Text>
              <Text className='qcfont qc-icon-chevron-right' />
            </View>
          </View>
          <View className='summary-flex'>
            <View className='item' onClick={() => util.navigateTo('/pagesPromotion/distributer/customer/index')}>
              <View className='num'>{summary.customerQuantity || 0}</View>
              <View className='item-desc'>累计客户(人)</View>
            </View>
            <View className='item' onClick={() => util.navigateTo('/pagesPromotion/distributer/team/index')}>
              <View className='num'>{summary.friendQuantity || 0}</View>
              <View className='item-desc'>我的团队(人)</View>
            </View>
            <View className='item' onClick={() => util.navigateTo('/pagesPromotion/distributer/order/index')}>
              <View className='num'>{summary.customerOrderQuantity || 0}</View>
              <View className='item-desc'>推广订单(笔)</View>
            </View>
          </View>
          <View className='price-wrap box-shadow'>
            <View className='total-wrap'>
              <View className='top-price'>
                <View>当前推广收益</View>
                <View className='total-price'>{util.filterPrice(summary.currentCommission)}</View>
              </View>
              <View className='top-price'>
                <View>累计推广收益</View>
                <View className='total-price'>{util.filterPrice(summary.totalCommission)}</View>
              </View>
            </View>
            <Button onClick={() => util.navigateTo('/pagesPromotion/distributer/account/index')} className='tixian-btn'>
              提现
            </Button>
          </View>

          <View className='btn-wrap'>
            <Button
              className='border'
              openType='getUserInfo'
              onGetUserInfo={e => {
                handleGetUserInfo(e, 'poster');
              }}>
              <Text>推广海报</Text>
              <Text className='qcfont qc-icon-chevron-right' />
            </Button>
            {/* <Button
            className='primary'
            openType='getUserInfo'
            onGetUserInfo={e => {
              handleGetUserInfo(e, 'share');
            }}>
            <Text>邀请好友</Text>
            <Text className='qcfont qc-icon-chevron-right' />
          </Button> */}
          </View>
        </View>

        <View className={`${isFixed ? 'fixed-top' : 'tabs'}`}>
          <TabsWrap
            tabs={tabList}
            current={current}
            onClickTabs={handleClickTabs}
            style={{ background: '#fff' }}
            scroll={false}
            bottomLine
          />
        </View>
        {isFixed && <DividingLine height={90} />}

        <View className='relative'>
          {list.length > 0 ? (
            list.map((item, index) => {
              return (
                <PromotionItem item={item} index={index} key={item.id} type='distributer' onPoster={handlePoster} />
              );
            })
          ) : (
            <QcEmptyPage icon='none'></QcEmptyPage>
          )}
        </View>

        <LogoWrap />
      </View>

      {/* 分享组件 */}
      <ShareWrap
        visible={shareVisible}
        onClose={() => {
          // setShareData({});
          setShareVisible(false);
        }}
        onPoster={() =>
          util.navigateTo(
            `/pagesPromotion/distributer/sales-poster/index?id=${shareData.id}&showStyle=${shareData.showStyle}&title=${shareData.title}&iconUrl=${shareData.iconUrl}`
          )
        }
      />
    </ThemeView>
  );
}

Index.config = {
  navigationBarTitleText: '销售推广中心',
  enablePullDownRefresh: true
};
