import Taro, { useState, useEffect, useReachBottom, usePullDownRefresh } from '@tarojs/taro';
import { View } from '@tarojs/components';
import './index.scss';

import api from '@/api/cowebs';
import useGetListData from '@/useHooks/useGetListData';

import { QcEmptyPage, LoadingBox, SearchWrap, TabsWrap, LogoWrap, FixedBox } from '@/components/common';
import { NewsItem } from '@/components/cowebs';

export default function Index() {
  const [tabList, setTabList] = useState<any[]>([{ title: '全部', id: '' }]);

  const { list, pageLoading, load, searchData, handleSearch } = useGetListData(
    'singleContentPage',
    {
      title: '',
      categoryId: ''
    },
    false
  );

  useEffect(() => {
    apiCategoryListByType();
  }, []);

  useReachBottom(() => {
    load(true);
  });

  usePullDownRefresh(() => {
    apiCategoryListByType();
  });

  // 分类
  const apiCategoryListByType = async () => {
    const res = await api.categoryListByType({ type: 8 });
    let data = res.data.data;
    let idx = data.findIndex((item: any) => item.parentId == 0);
    if (idx > -1) data.splice(idx, 1);
    setTabList([{ title: '全部', id: '' }, ...data]);
    load();
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
            return <NewsItem item={item} index={index} key={item.id} />;
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
  navigationBarTitleText: '动态',
  enablePullDownRefresh: true
};
