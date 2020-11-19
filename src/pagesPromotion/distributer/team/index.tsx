import Taro, { useState, useEffect, useDidShow, useReachBottom, usePullDownRefresh } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './index.scss';

import useGetListData from '@/useHooks/useGetListData';
import { LoadingBox, LogoWrap, QcEmptyPage, FixedBox, SearchWrap } from '@/components/common';
import { CustomerItem } from '@/components/promotion';

export default function Index() {
  // const [ pageLoading, setPageLoading ] = useState(true)

  const { list, pageLoading, isMount, load, searchData, handleSearch } = useGetListData(
    'distributerFriends',
    {
      appellation: ''
    },
    true
  );

  // useDidShow(() => {
  //   if (!isMount) return
  //   load(false, 'didShow')
  // })

  useReachBottom(() => {
    load(true);
  });

  usePullDownRefresh(() => {
    load();
  });

  return (
    <View>
      <LoadingBox visible={pageLoading} />

      <FixedBox>
        <SearchWrap
          isInput={true}
          value={searchData.appellation}
          placeholderText='客户名搜索'
          onConfirm={(e: string) => handleSearch('appellation', e)}
          onClear={() => handleSearch('appellation')}
        />
      </FixedBox>

      <View className='relative'>
        <View className='team-title'>
          <Text>我邀请的好友</Text>
          <Text>邀请奖励</Text>
        </View>
        {list.length > 0 ? (
          list.map((item, index) => {
            return <CustomerItem key={item.id} item={item} index={index} type='team' />;
          })
        ) : (
          <QcEmptyPage icon='none'></QcEmptyPage>
        )}
      </View>

      <LogoWrap />
    </View>
  );
}

Index.config = {
  navigationBarTitleText: '我的团队',
  enablePullDownRefresh: true
};
