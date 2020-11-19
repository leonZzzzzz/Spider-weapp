import Taro, { useReachBottom, usePullDownRefresh } from '@tarojs/taro';
import { View } from '@tarojs/components';
import './index.scss';

import useGetListData from '@/useHooks/useGetListData';

import { QcEmptyPage, LoadingBox, LogoWrap } from '@/components/common';
import { WalletItem } from '@/components/mall';

export default function Index() {
  const { list, pageLoading, load } = useGetListData('walletPage');

  useReachBottom(() => {
    load(true);
  });

  usePullDownRefresh(() => {
    load();
  });

  return (
    <View>
      <LoadingBox visible={pageLoading} />

      <View className='relative'>
        {list.length > 0 ? (
          list.map((item: any, index: number) => {
            return <WalletItem item={item} index={index} key={item.id} />;
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
  navigationBarTitleText: '我的钱包',
  enablePullDownRefresh: true
};
