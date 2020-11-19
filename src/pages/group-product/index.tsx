import Taro, { useState, useReachBottom, usePullDownRefresh } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './index.scss';

import util from '@/utils/util';
import useGetListData from '@/useHooks/useGetListData';

import { QcEmptyPage, LoadingBox, SearchWrap, LogoWrap, FixedBox } from '@/components/common';
import { GroupProductItem } from '@/components/mall';
import { useTabbar } from '@/useHooks/useFlywheel';

export default function Index() {
  const [typeList] = useState<any[]>([
    {
      id: 1,
      name: '全部',
      asc: '',
      orderBy: ''
    },
    {
      id: 2,
      name: '发布',
      asc: 0,
      orderBy: 'createTime'
    },
    {
      id: 3,
      name: '价格',
      asc: 0,
      orderBy: 'price'
    },
    {
      id: 4,
      name: '销售',
      asc: 0,
      orderBy: 'salesQty'
    }
  ]);
  const [current, setCurrent] = useState(0);

  const { list, pageLoading, setSearchData, load, searchData, handleSearch } = useGetListData('groupProductPage', {
    name: '',
    orderBy: '',
    asc: ''
    // storeId: Taro.getStorageSync('storeId')
  });
  useTabbar();
  useReachBottom(() => {
    load(true);
  });

  usePullDownRefresh(() => {
    load();
  });

  const handleType = (item: any, index: number) => {
    console.log('handleType----------', item, searchData.orderBy);
    if (item.orderBy === '' && searchData.orderBy === '') return;
    if (item.orderBy === searchData.orderBy) {
      searchData.asc = searchData.asc === 1 ? 0 : 1;
    } else {
      searchData.orderBy = item.orderBy;
      searchData.asc = 0;
      if (index === 0) searchData.asc = '';
    }
    setSearchData(searchData);
    setCurrent(index);
    load();
    util.pageScrollTo();
  };

  return (
    <View>
      <LoadingBox visible={pageLoading} />

      <FixedBox height={190}>
        <SearchWrap
          isInput={true}
          value={searchData.name}
          onConfirm={(e: string) => handleSearch('name', e)}
          onClear={() => handleSearch('name')}
        />

        <View className='type-wrap'>
          {typeList.map((item: any, index: number) => {
            return (
              <View
                className={`item ${current === index ? 'active' : ''}`}
                key={item.id}
                onClick={() => handleType(item, index)}>
                <Text>{item.name}</Text>
                {index > 0 && (
                  <View className='icon-wrap'>
                    <View
                      className={`qcfont qc-icon-shangjiantou ${
                        searchData.asc === 0 && item.orderBy === searchData.orderBy ? 'black' : ''
                      }`}
                    />
                    <View
                      className={`qcfont qc-icon-xiajiantou1 ${
                        searchData.asc === 1 && item.orderBy === searchData.orderBy ? 'black' : ''
                      }`}
                    />
                  </View>
                )}
                <View className='tabs__item-underline'></View>
              </View>
            );
          })}
        </View>
      </FixedBox>

      <View className='relative'>
        {list.length > 0 ? (
          list.map((item, index) => {
            return <GroupProductItem item={item} index={index} key={item.id} />;
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
  navigationBarTitleText: '超值拼团',
  enablePullDownRefresh: true
};
