import Taro, { useState, useEffect, useReachBottom, usePullDownRefresh, usePageScroll } from '@tarojs/taro';
import { View, Text, Button } from '@tarojs/components';
import api from '@/api/cowebs';
import util from '@/utils/util';
import { IMG_HOST } from '@/config';
import { QcEmptyPage, LoadingBox, TabsWrap, Avatar, ThemeView } from '@/components/common';
import { NewsItem, AlumniCard } from '@/components/cowebs';
import { throttle, debounce } from 'throttle-debounce';
import './index.scss';
export default function CircleDetail() {
  const systemInfo = Taro.getSystemInfoSync();
  const [pageLoading, setPageLoading] = useState(true);
  const [detail, setDetail] = useState<any>({
    name: '80后',
    iconUrl: '/attachments/null/b2ab4baed665453c8ddfd318b3d9c36f.png',
    admin: '林琳',
    visitQuantity: 34,
    intro:
      '搜集覅手动阀山东覅搜搜集覅手动阀山东覅搜集覅手动阀山东覅就是否山东覅是的史丹佛的是就是否山东覅是的史丹佛的是集覅手动阀山东覅就是否山东覅是的史丹佛的是就是否山东覅是的史丹佛的是'
  });
  const [tabList] = useState<any[]>([{ title: '动态', id: 'news' }, { title: '成员', id: 'student' }]);
  const [tabId, setTabId] = useState<any>('news');

  const [classList] = useState<any[]>([{ id: '1', name: '史丹佛的' }, { id: '2', name: '23f4d' }]);
  const [classId, setClassId] = useState('1');

  const [searchData, setSearchData] = useState<any>({
    pageSize: 20,
    pageNum: 1,
    total: 0
  });
  let [list, setList] = useState<any[]>([]);

  const [scrollTop, setScrollTop] = useState(0);
  const [fixed, setFixed] = useState(false);
  const [fixedHeight, setFixedHeight] = useState(0);
  useEffect(() => {
    getClassInfo();
    getHeight();
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

  usePageScroll(e => {
    setScrollTop(e.scrollTop);
  });

  useEffect(() => {
    throttled();
    return () => {
      throttled.cancel();
    };
  }, [scrollTop]);

  const handleFixed = () => {
    if (scrollTop > fixedHeight) setFixed(true);
    else setFixed(false);
  };

  const throttled = throttle(50, handleFixed);

  const getHeight = () => {
    const screen = systemInfo.screenWidth / 750;
    const query = Taro.createSelectorQuery();
    query.select('.circle-info-wrap').boundingClientRect();
    query.exec(res => {
      const height = res[0].height + 60 * screen;
      setFixedHeight(height);
      console.log('getHeight', height);
    });
  };

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
        <View className='bg-top'></View>

        <View className='circle-info-wrap'>
          <View className='top-box'>
            <View className='left'>
              <Avatar imgUrl={IMG_HOST + detail.iconUrl} width={100} />
              <View className='info'>
                <View>{detail.name}</View>
                <View className='gly'>管理员 {detail.admin}</View>
              </View>
            </View>
            <View className='right'>
              {/* <Button className="add">+ 加入圈子</Button> */}
              <View></View>
              <View className='read'>
                <Text className='qcfont qc-icon-yanjing' />
                <Text>234</Text>
              </View>
            </View>
          </View>
          <View className='intro'>{detail.intro}</View>
        </View>

        <View className={`${fixed ? 'fixed__tabs' : ''}`}>
          <TabsWrap
            tabs={tabList}
            current={tabId}
            onClickTabs={handleClickTabs}
            scroll={false}
            style={{ background: '#fff' }}
            bottomLine
          />
        </View>

        {fixed && <View style={{ height: Taro.pxTransform(100) }} />}

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

CircleDetail.config = {
  navigationBarTitleText: '圈子动态',
  enablePullDownRefresh: true
};
