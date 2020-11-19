import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, ScrollView } from '@tarojs/components';
import './index.scss';

import { LoadingBox, QcEmptyPage } from '@/components/common';
import { ActivityItem } from '@/components/cowebs';
// import LoadingBox from '@/components/common/loading-wrap'
// import QcEmptyPage from '@/components/common/empty-page'
// import ActivityItem from '@/components/cowebs/activity-item'

import api from '@/api/cowebs';

// 最新活动
export default function QcActivityGroup() {
  const [list, setList] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  // const [ scrollLeft, setScrollLeft ] = useState(0)

  useEffect(() => {
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
    console.log('activityPage 调用');
    try {
      const res = await api.activityPage({ pageSize: 5 });
      setList(res.data.data.list);
      console.log('activityPage', res.data.data);
      setPageLoading(false);
    } catch (err) {
      console.log('activityPage err', err);
    }
  };

  return (
    <View className='qc-activity-group relative'>
      <ScrollView scrollX className='list'>
        {list.length > 0
          ? list.map((item: any, index: number) => {
              return <ActivityItem item={item} index={index} key={item.id} type='scrollX' />;
            })
          : !pageLoading && <QcEmptyPage icon='none' size='mini'></QcEmptyPage>}
        <LoadingBox visible={pageLoading} size='mini' />
      </ScrollView>
    </View>
  );
}

QcActivityGroup.options = {
  addGlobalClass: true
};
