import Taro, { useState, useEffect, useReachBottom, usePullDownRefresh, useShareAppMessage } from '@tarojs/taro';
import { View } from '@tarojs/components';
import './index.scss';

import { IMG_HOST } from '@/config';
import useGetListData from '@/useHooks/useGetListData';

import { QcEmptyPage, LogoWrap, LoadingBox, TabsWrap, FixedBox, AuthorizeWrap } from '@/components/common';
import { GroupOrderItem } from '@/components/mall';

import withShare from '@/utils/withShare';

export default function Index() {
  const [tabList] = useState<any[]>([
    { title: '全部', id: '' },
    { title: '进行中', id: 1 },
    { title: '已完成', id: 2 },
    { title: '已过期', id: -1 }
  ]);

  const { list, pageLoading, load, searchData, handleSearch, authorizeVisible } = useGetListData('groupOrderPage', {
    groupStatus: ''
  });

  useEffect(() => {
    Taro.hideShareMenu();
  }, []);

  useShareAppMessage((res?: any) => {
    if (res.from === 'button') {
      const { title, coverurl, id } = res.target.dataset;
      return withShare({
        title,
        imageUrl: IMG_HOST + coverurl,
        path: `/pagesMall/join-group/index?id=${id}`
      });
    }
  });

  useReachBottom(() => {
    load(true);
  });

  usePullDownRefresh(() => {
    load();
  });

  const handleEnd = (id: string) => {
    load(false, 'refresh', id);
  };

  return (
    <View>
      <LoadingBox visible={pageLoading} />

      <FixedBox height={90}>
        <TabsWrap
          scroll={false}
          tabs={tabList}
          current={searchData.groupStatus}
          onClickTabs={(e: string) => handleSearch('groupStatus', e)}
          style={{ background: '#fff' }}
        />
      </FixedBox>

      <View className='relative'>
        {list.length > 0 ? (
          list.map((item: any) => {
            return <GroupOrderItem item={item} key={item.id} onEnd={handleEnd} />;
          })
        ) : (
          <QcEmptyPage icon='none' text='暂无相关订单'></QcEmptyPage>
        )}
      </View>

      <LogoWrap />
      <AuthorizeWrap visible={authorizeVisible} />
    </View>
  );
}

Index.config = {
  navigationBarTitleText: '商品拼团',
  enablePullDownRefresh: true
};
