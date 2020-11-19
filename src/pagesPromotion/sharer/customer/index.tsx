import Taro, { useReachBottom, usePullDownRefresh } from '@tarojs/taro';
import { View } from '@tarojs/components';
import './index.scss';

import useGetListData from '@/useHooks/useGetListData';
import { LoadingBox, LogoWrap, QcEmptyPage, FixedBox, SearchWrap } from '@/components/common';
import { CustomerItem } from '@/components/promotion';

export default function Index() {
  const { list, pageLoading, load, searchData, handleSearch } = useGetListData(
    'sharerCustomers',
    {
      appellation: ''
    },
    true
  );

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
        {list.length > 0 ? (
          list.map((item, index) => {
            return <CustomerItem key={item.id} item={item} index={index} />;
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
  navigationBarTitleText: '累计客户'
};
