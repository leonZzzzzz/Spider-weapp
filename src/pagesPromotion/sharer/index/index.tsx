import Taro, {
  useState,
  useEffect,
  useReachBottom,
  usePullDownRefresh,
  usePageScroll,
  useShareAppMessage
} from '@tarojs/taro';
import { View, Text, Button, Image } from '@tarojs/components';
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
  ShareWrap,
  ThemeView
} from '@/components/common';
import { PromotionItem } from '@/components/promotion';
import { useSelector, useDispatch } from '@tarojs/redux';
import { sharerInitUser, sharerInitSummary } from '@/store/actions/sharer';
import { checkVisitor } from '@/utils/authorize';
import './index.scss';

export default function Index() {
  const { user, summary } = useSelector((state: any) => state.sharer);
  const dispatch = useDispatch();
  const [pageLoading, setPageLoading] = useState(true);
  const [tabList] = useState<any[]>([
    { title: '推广活动', id: 0, apiStr: 'activitySharerPage' }
    // { title: '推广课程', id: 1, apiStr: 'activityPage' },
    // { title: '推广商品', id: 2, apiStr: 'coursePage' },
  ]);
  const [current, setCurrent] = useState(0);
  const [isFixed, setIsFixed] = useState(false);
  const [tabsTop, setTabsTop] = useState(0);
  const [shareVisible, setShareVisible] = useState(false);
  const [shareData, setShareData] = useState<any>({});
  const { list, load, setApiStr } = useGetListData('activitySharerPage', {}, false);

  useEffect(() => {
    Taro.hideShareMenu();
    sharerGet();
    getHeight();
  }, []);

  useReachBottom(() => {
    load(true);
  });

  usePullDownRefresh(() => {
    sharerGet();
  });

  useShareAppMessage(() => {
    return withShare({
      title: shareData.title,
      imageUrl: IMG_HOST + shareData.iconUrl,
      path: `/pagesCoWebs/activity/${shareData.showStyle === 2 ? 'detail-commission' : 'detail'}/index?id=${
        shareData.id
      }&bindScene=${shareData.scene}`
    });
  });

  usePageScroll(res => {
    setIsFixed(res.scrollTop > tabsTop);
  });

  const sharerGet = async () => {
    try {
      const res = await api.sharerGet();
      const data = res.data.data;
      if (data.isSharer) {
        load();
        sharerSummary();
        setPageLoading(false);
        dispatch(sharerInitUser(data));
      } else {
        sharerRegist();
      }
    } catch (err) {
      util.showToast(err.data && err.data.message);
      setTimeout(() => {
        Taro.navigateBack();
      }, 2000);
    }
  };

  const sharerRegist = async () => {
    await api.sharerRegist();
    sharerGet();
  };

  const sharerSummary = async () => {
    const res = await api.sharerSummary();
    const data = res.data.data;
    // data.wallet = 2;
    dispatch(sharerInitSummary(data));
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
      let url =
        type === 'poster' ? '/pagesCoWebs/my/invite-poster/index' : '/pagesPromotion/sharer/invite-poster/index';
      await checkVisitor(e);
      await sharerGet();
      util.navigateTo(url);
    }
  };

  const handlePoster = async (item: any) => {
    if (shareData.id === item.id) {
      setShareVisible(true);
      return;
    }
    util.showLoading(true);
    const res = await api.sharerQrcodeGetActivity({
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
              <Avatar
                imgUrl={user.headImage || 'https://athena-1255600302.cos.ap-guangzhou.myqcloud.com/static/avatar.png'}
                width={70}
              />
              <View className='name-text'>
                <View className='name'>{user.appellation ? user.appellation : ''}</View>
                {user.isSharer && (
                  <View className='rank'>
                    <View className='icon-img'>
                      {user.levelIcon ? (
                        <View className='img'>
                          <Image src={IMG_HOST + user.levelIcon} mode='aspectFill' />
                        </View>
                      ) : (
                        <View className={`qcfont qc-icon-ji${user.level}`} />
                      )}
                    </View>

                    <Text>{user.levelName}</Text>
                  </View>
                )}
              </View>
            </View>
            <View className='rule' onClick={() => util.navigateTo('/pagesPromotion/sharer/rule/index')}>
              <Text>推广规则</Text>
              <Text className='qcfont qc-icon-chevron-right' />
            </View>
          </View>
          <View className='summary-flex'>
            <View className='item' onClick={() => util.navigateTo('/pagesPromotion/sharer/customer/index')}>
              <View className='num'>{summary.customerQuantity || 0}</View>
              <View className='item-desc'>累计客户(人)</View>
            </View>
            <View className='item' onClick={() => util.navigateTo('/pagesPromotion/sharer/team/index')}>
              <View className='num'>{summary.friendQuantity || 0}</View>
              <View className='item-desc'>我的团队(人)</View>
            </View>
            <View className='item' onClick={() => util.navigateTo('/pagesPromotion/sharer/order/index')}>
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
            <Button onClick={() => util.navigateTo('/pagesPromotion/sharer/account/index')} className='tixian-btn'>
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
            <Button
              className='primary'
              openType='getUserInfo'
              onGetUserInfo={e => {
                handleGetUserInfo(e, 'share');
              }}>
              <Text>邀请好友</Text>
              <Text className='qcfont qc-icon-chevron-right' />
            </Button>
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
              return <PromotionItem item={item} index={index} key={item.id} type='sharer' onPoster={handlePoster} />;
            })
          ) : (
            <QcEmptyPage icon='none'></QcEmptyPage>
          )}
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
              `/pagesPromotion/sharer/sales-poster/index?id=${shareData.id}&showStyle=${shareData.showStyle}&title=${shareData.title}&iconUrl=${shareData.iconUrl}`
            )
          }
        />

        <LogoWrap />
      </View>
    </ThemeView>
  );
}

Index.config = {
  navigationBarTitleText: '推广中心',
  enablePullDownRefresh: true
};
