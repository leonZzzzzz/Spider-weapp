import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, ScrollView } from '@tarojs/components';
import './index.scss';

import { ActivityItem } from '@/components/cowebs';
import { QcEmptyPage, LoadingBox } from '@/components/common';

import api from '@/api/cowebs';
import { useTheme } from '@/useHooks/useFlywheel';

// 最新活动
export default function QcCategoryActivityGroup(props: any) {
  const { options } = props;

  const [list, setList] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [scrollIntoView, setScrollIntoView] = useState('');
  const [tabList, setTabList] = useState<any[]>([]);
  const [searchData, setSearchData] = useState<any>({
    categoryId: '',
    pageSize: 5
  });
  const theme =useTheme()
  useEffect(() => {
    setTabList(options.categoryList || []);

    if (options.categoryList.length > 0) {
      searchData.categoryId = options.categoryList[0].id || '';
      setSearchData(searchData);
    }
    console.log('useEffect activityPage');
    activityPage();

    Taro.eventCenter.on('pullDownRefresh', () => {
      console.log('pullDownRefresh');
      setPageLoading(true);
      activityPage();
    });

    return () => {
      Taro.eventCenter.off('pullDownRefresh');
    };
  }, []);

  // 列表
  const activityPage = async () => {
    console.log('activityPage 调用', searchData);
    setPageLoading(true);
    try {
      const res = await api.activityPage(searchData);
      setList(res.data.data.list);
      console.log('activityPage', res.data.data);
      setPageLoading(false);
    } catch (err) {
      setPageLoading(false);
      console.log('activityPage err', err);
    }
  };

  const handleClickTabs = (e: string | number, idx: number) => {
    searchData.categoryId = e;
    setSearchData(searchData);
    activityPage();
    const index = Math.max(idx - 1, 0);
    setScrollIntoView(`tab${index}`);
    Taro.eventCenter.trigger('eventCategoryId', e || 'all', 'activity');
  };
  return (
    <View className='qc-category-activity-group relative' style={theme}>
      {tabList.length > 0 && (
        <ScrollView scrollX className='category-tabs' scrollIntoView={scrollIntoView} scrollWithAnimation>
          {tabList.length > 0 &&
            tabList.map((tab: any, idx: number) => {
              return (
                <View
                  id={`tab${idx}`}
                  className={`category-tabs__item ${tab.id === searchData.categoryId ? 'category-tabs__active' : ''}`}
                  key={tab.id}>
                  <View
                    className='text'
                    style={{ color: tab.id === searchData.categoryId ? options.activeColor || '' : options.color }}
                    onClick={() => handleClickTabs(tab.id, idx)}>
                    {tab.name}
                  </View>
                </View>
              );
            })}
        </ScrollView>
      )}
      <LoadingBox visible={pageLoading} size='mini' />

      <ScrollView scrollX className='list'>
        {list.length > 0
          ? list.map((item: any, index: number) => {
              return <ActivityItem item={item} index={index} key={item.id} type='scrollX' showCategory={false} />;
            })
          : !pageLoading && <QcEmptyPage icon='none' size='mini'></QcEmptyPage>}
      </ScrollView>
    </View>
  );
}

QcCategoryActivityGroup.options = {
  addGlobalClass: true
};
