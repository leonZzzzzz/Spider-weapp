import Taro, { useState, useEffect, useRouter, useReachBottom, usePullDownRefresh } from '@tarojs/taro';
import { View } from '@tarojs/components';
import './index.scss';

import useGetListData from '@/useHooks/useGetListData';

import { QcEmptyPage, LoadingBox, LogoWrap } from '@/components/common';
import { DonateItem } from '@/components/cowebs';

export default function Index() {
  const { id } = useRouter().params;
  const [total, setTotal] = useState<number>(0);
  const { list, pageLoading, load, searchData } = useGetListData(
    'donateDetailOrderPage',
    {
      activityId: id
    },
    true
  );

  useReachBottom(() => {
    load(true);
  });

  usePullDownRefresh(() => {
    Taro.stopPullDownRefresh()
  });

  return (
    <View>
      <LoadingBox visible={pageLoading} />

      <View className='relative'>
        {list.length > 0 && <View className='total'>{ searchData.total }人已参与</View>}
        {list.length > 0 ? (
          list.map((item, index) => {
            return <View className='item-wrap'><DonateItem item={item} index={index} key={item.id} /></View>
          })
        ) : (
          <QcEmptyPage icon='none' text='暂无捐款记录'></QcEmptyPage>
        )}
      </View>
      <LogoWrap />
    </View>
  );
}

Index.config = {
  navigationBarTitleText: '捐款名单',
  enablePullDownRefresh: false
};
