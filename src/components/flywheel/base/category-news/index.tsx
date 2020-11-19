import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, ScrollView } from '@tarojs/components';
import { NewsItem } from '@/components/cowebs';
import { QcEmptyPage, LoadingBox, ThemeView } from '@/components/common';
import api from '@/api/cowebs';
import './index.scss';

export default function QcCategoryNews(props: any) {
  const { options } = props;
  const [tabList, setTabList] = useState<any[]>([]);
  const [list, setList] = useState<any[]>([]);
  const [scrollIntoView, setScrollIntoView] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [searchData, setSearchData] = useState<any>({
    categoryId: '',
    pageSize: 5
  });
  useEffect(() => {
    setTabList(options.categoryList || []);
    if (options.categoryList.length > 0) {
      searchData.categoryId = options.categoryList[0].id || '';
      setSearchData(searchData);
    }
    singleContentPage();

    Taro.eventCenter.on('pullDownRefresh', () => {
      console.log('pullDownRefresh');
      setPageLoading(true);
      setList([]);
      singleContentPage();
    });

    return () => {
      if (!options.item || options.item.length === 0) Taro.eventCenter.off('pullDownRefresh');
    };
  }, [options]);

  const singleContentPage = async () => {
    const res = await api.singleContentPage(searchData);
    setList(res.data.data.list);
    setPageLoading(false);
  };
  const handleClickTabs = (e: string | number, idx: number) => {
    searchData.categoryId = e;
    setSearchData(searchData);
    singleContentPage();
    const index = Math.max(idx - 1, 0);
    setScrollIntoView(`tab${index}`);
    Taro.eventCenter.trigger('eventCategoryId', e || 'all', 'activity');
  };
  return (
    <ThemeView>
      <View className='qc-category-news relative'>
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
        <View>
          {options.item && options.item.length > 0
            ? options.item.map((item: any, index: number) => {
                return <NewsItem item={item} key={item.id} index={index} />;
              })
            : list.length > 0
            ? list.map((item: any, index: number) => {
                return <NewsItem item={item} key={item.id} index={index} />;
              })
            : !pageLoading && <QcEmptyPage icon='none' size='mini'></QcEmptyPage>}
          <LoadingBox visible={pageLoading} size='mini' />
        </View>
      </View>
    </ThemeView>
  );
}

QcCategoryNews.options = {
  addGlobalClass: true
};

QcCategoryNews.defaultProps = {
  options: {}
};
