import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './index.scss';

import { QcEmptyPage, LoadingBox, TabsWrap } from '@/components/common';
import { ResourceItem } from '@/components/cowebs';
// import LoadingBox from '@/components/common/loading-wrap'
// import QcEmptyPage from '@/components/common/empty-page'
// import TabsWrap from '@/components/common/tab-wrap'
// import ResourceItem from '@/components/cowebs/resource-item'

import api from '@/api/cowebs';

// 资源对接
export default function QcResourceDocking() {
  const [pageLoading, setPageLoading] = useState(true);
  const [list, setList] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([{ id: '', name: '全部' }]);
  const [searchData, setSearchData] = useState<any>({
    categoryId: '',
    pageSize: 5,
    pageNum: 1
  });

  useEffect(() => {
    categoryListByType();
    informationPage();

    Taro.eventCenter.on('pullDownRefresh', () => {
      console.log('pullDownRefresh');
      setPageLoading(true);
      searchData.categoryId = '';
      setSearchData(searchData);
      // setList([])
      categoryListByType();
      informationPage();
    });

    return () => {
      Taro.eventCenter.off('pullDownRefresh');
    };
  }, []);

  const categoryListByType = async () => {
    const res = await api.categoryListByType({ type: 13 });
    if (res.data.data.length > 0) {
      // categoryList.push(...res.data.data)
      // setCategoryList(categoryList)
      setCategoryList([{ id: '', name: '全部' }, ...res.data.data]);
    } else {
      setPageLoading(false);
    }
  };

  const informationPage = async () => {
    setPageLoading(true);
    const res = await api.informationPages(searchData);
    setList(res.data.data.list);
    setPageLoading(false);
  };

  const handleClickTabs = (e: string | number) => {
    searchData.categoryId = e;
    setSearchData(searchData);
    informationPage();
    Taro.eventCenter.trigger('eventCategoryId', e || 'all', 'information');
  };

  return (
    <View className='resource-docking relative'>
      <View>
        <TabsWrap tabs={categoryList} current={searchData.categoryId} onClickTabs={handleClickTabs} />
      </View>

      <View>
        <LoadingBox visible={pageLoading} size='mini' />
        {list.length > 0
          ? list.map(item => {
              return <ResourceItem item={item} key={item.id} />;
            })
          : !pageLoading && <QcEmptyPage icon='none' size='mini'></QcEmptyPage>}
      </View>
    </View>
  );
}

QcResourceDocking.options = {
  addGlobalClass: true
};
