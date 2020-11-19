import Taro, { useState, useEffect, useReachBottom, usePullDownRefresh, useDidShow } from '@tarojs/taro';
import { View } from '@tarojs/components';
import './index.scss';

import api from '@/api/cowebs';
import useGetListData from '@/useHooks/useGetListData';

import { QcEmptyPage, LoadingBox, SearchWrap, TabsWrap, LogoWrap, FixedBox } from '@/components/common';
import { ActivityItem } from '@/components/cowebs';

export default function Index() {
  const [tabList, setTabList] = useState<any[]>([{ title: '全部', id: '' }]);
  const { list, pageLoading, isMount, load, searchData, setSearchData, handleSearch } = useGetListData(
    'activityPage',
    {
      title: '',
      categoryId: ''
    },
    false
  );

  useEffect(() => {
    const moreCategoryId = Taro.getStorageSync('moreCategoryId');
    apiCategoryListByType(moreCategoryId);
    if (!moreCategoryId) {
      load();
    }
  }, []);

  useDidShow(() => {
    if (!isMount) return;
    const moreCategoryId = Taro.getStorageSync('moreCategoryId');
    if (moreCategoryId) {
      Taro.removeStorageSync('moreCategoryId');
      if ((moreCategoryId === 'all' && searchData.categoryId === '') || moreCategoryId === searchData.categoryId)
        return;
      searchData.categoryId = moreCategoryId === 'all' ? '' : moreCategoryId;
      setSearchData(searchData);
      load();
    }
  });

  useReachBottom(() => {
    load(true);
  });

  usePullDownRefresh(() => {
    apiCategoryListByType(searchData.categoryId || 'all');
  });

  // 分类
  const apiCategoryListByType = async (categoryId: string) => {
    const res = await api.categoryListByType({ type: 2 });
    let data = res.data.data;
    let idx = data.findIndex((item: any) => item.parentId == 0);
    if (idx > -1) data.splice(idx, 1);
    setTabList([{ title: '全部', id: '' }, ...data]);
    if (categoryId) {
      let _idx = data.findIndex((item: any) => item.id == categoryId);
      if (_idx === -1) categoryId = 'all';
      searchData.categoryId = categoryId === 'all' ? '' : categoryId;
      setSearchData(searchData);
      load();
      Taro.removeStorageSync('moreCategoryId');
    }
  };

  return (
    <View>
      <LoadingBox visible={pageLoading} />

      <FixedBox height={190}>
        <SearchWrap
          isInput={true}
          value={searchData.title}
          onConfirm={(e: string) => handleSearch('title', e)}
          onClear={() => handleSearch('title')}
        />
        <TabsWrap
          tabs={tabList}
          current={searchData.categoryId}
          onClickTabs={(e: string) => handleSearch('categoryId', e)}
          style={{ background: '#fff' }}
        />
      </FixedBox>

      <View className='relative'>
        {list.length > 0 ? (
          list.map((item, index) => {
            return <ActivityItem item={item} index={index} key={item.id} />;
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
  navigationBarTitleText: '活动',
  enablePullDownRefresh: true
};

// export default Index
