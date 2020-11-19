import Taro, { useState, useEffect, useReachBottom, usePullDownRefresh } from '@tarojs/taro';
import { View } from '@tarojs/components';
import api from '@/api/cowebs';
import util from '@/utils/util';
import { QcEmptyPage, LoadingBox, ThemeView } from '@/components/common';
import { AlumniCard } from '@/components/cowebs';
import './index.scss';

export default function Follows() {
  const [pageLoading, setPageLoading] = useState(true);
  const [searchData, setSearchData] = useState<any>({
    pageSize: 20,
    pageNum: 1,
    total: 0
  });
  let [list, setList] = useState<any[]>([]);

  useEffect(() => {
    getContactsList();
  }, []);

  useReachBottom(() => {
    console.log('onReachBottom');
    if (util.isHasNextPage(searchData, list.length)) {
      getContactsList(true);
    }
  });

  usePullDownRefresh(() => {
    getContactsList();
  });

  // 列表
  const getContactsList = async (isLoadMore?: boolean) => {
    let _list = list;
    if (!isLoadMore) {
      setPageLoading(true);
      searchData.pageNum = 0;
      searchData.total = 0;
      _list = [];
    }
    searchData.pageNum++;

    const res = await api.getContactsList(searchData);

    const data = res.data.data;
    if (data.total) searchData.total = data.total;

    setList([..._list, ...data.list]);
    setSearchData(searchData);
    setPageLoading(false);
    Taro.stopPullDownRefresh();
  };

  return (
    <ThemeView>
      <View className='alumni-contacts'>
        <LoadingBox visible={pageLoading} />

        {list.length > 0 ? (
          list.map((item, index) => {
            return <AlumniCard item={item} index={index} key={item.id} />;
          })
        ) : (
          <QcEmptyPage icon='none'></QcEmptyPage>
        )}
      </View>
    </ThemeView>
  );
}

Follows.config = {
  navigationBarTitleText: '关注',
  enablePullDownRefresh: true
};
