import Taro, { useState, useEffect, useReachBottom, usePullDownRefresh } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import api from '@/api/cowebs';
import util from '@/utils/util';
import { QcEmptyPage, LoadingBox, TabsWrap, FixedBox, ThemeView } from '@/components/common';
import { NewsItem, AlumniCard } from '@/components/cowebs';
import './index.scss';

export default function Class() {
  const [pageLoading, setPageLoading] = useState(true);
  const [tabList] = useState<any[]>([{ title: '动态', id: 'news' }, { title: '同学', id: 'student' }]);
  const [tabId, setTabId] = useState<any>('news');

  const [classList] = useState<any[]>([{ id: '1', name: '史丹佛的' }, { id: '2', name: '23f4d' }]);
  const [classId, setClassId] = useState('1');
  const [detail, setDetail] = useState<any>({
    name: '羽毛球1班',
    admin: '琳琳',
    num: 34
  });

  const [searchData, setSearchData] = useState<any>({
    pageSize: 20,
    pageNum: 1,
    total: 0
  });
  let [list, setList] = useState<any[]>([]);

  useEffect(() => {
    getClassInfo();
  }, []);

  useReachBottom(() => {
    console.log('onReachBottom');
    if (util.isHasNextPage(searchData, list.length)) {
      getPage(true);
    }
  });

  usePullDownRefresh(() => {
    getPage();
  });

  const getClassInfo = async () => {
    await api.getClassInfo();
  };

  const handleClickTabs = (e: string | number) => {
    setTabId(e);
  };
  useEffect(() => {
    getPage();
  }, [tabId]);

  const handleTabs = (id: string) => {
    setClassId(id);
  };

  // 列表
  const getPage = async (isLoadMore?: boolean) => {
    let _list = list;
    if (!isLoadMore) {
      setPageLoading(true);
      searchData.pageNum = 0;
      searchData.total = 0;
      _list = [];
    }
    searchData.pageNum++;
    console.log('tabId', tabId);
    const res = await api[tabId === 'news' ? 'singleContentPage' : 'getContactsList'](searchData);
    // const res = await api.singleContentPage(searchData);
    const data = res.data.data;
    if (data.total) searchData.total = data.total;
    setList([..._list, ...data.list]);
    setSearchData(searchData);
    setPageLoading(false);
    Taro.stopPullDownRefresh();
  };

  return (
    <ThemeView>
      <View className='class-page'>
        <LoadingBox visible={pageLoading} />

        <FixedBox height={390} style={{ background: '#fff' }}>
          <View className='bg-top'></View>
          <TabsWrap
            tabs={classList}
            current={classId}
            onClickTabs={handleTabs}
            activeColorStyle='white'
            bgStyle='primary'
          />

          <View className='class-info-wrap'>
            <View className='title'>{detail.name}</View>
            <View className='desc'>
              <Text>班长：{detail.admin}</Text>
              <Text className='line'>|</Text>
              <Text>人数：{detail.num}</Text>
            </View>
          </View>

          <TabsWrap
            tabs={tabList}
            current={tabId}
            onClickTabs={handleClickTabs}
            scroll={false}
            style={{ background: '#fff' }}
            bottomLine
          />
        </FixedBox>

        {list.length > 0 ? (
          list.map((item, index) => {
            return tabId === 'news' ? (
              <NewsItem item={item} key={item.id} />
            ) : (
              <AlumniCard item={item} key={item.id} index={index} />
            );
          })
        ) : (
          <QcEmptyPage icon='none'></QcEmptyPage>
        )}
      </View>
    </ThemeView>
  );
}

Class.config = {
  navigationBarTitleText: '我的班级',
  enablePullDownRefresh: true
};
