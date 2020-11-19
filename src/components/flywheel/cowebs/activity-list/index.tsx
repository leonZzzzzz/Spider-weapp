import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, ScrollView } from '@tarojs/components';
import './index.scss';

import { LoadingBox, QcEmptyPage } from '@/components/common';
import { ActivityItem } from '@/components/cowebs';

import api from '@/api/cowebs';

// 最新活动
export default function QcActivityList(props) {
  const [list, setList] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  // const [ scrollLeft, setScrollLeft ] = useState(0)

  useEffect(() => {
    if (props.options.item.length > 0) {
      const ids = props.options.item.map(item => item.id);
      activityPageByIds(ids.join(','));
    } else {
      console.log('useEffect activityPage');
      activityPage();
    }
    Taro.eventCenter.on('pullDownRefresh', () => {
      console.log('pullDownRefresh');
      setPageLoading(true);
      // activityPage();
      if (props.options.item.length > 0) {
        const ids = props.options.item.map(item => item.id);
        activityPageByIds(ids.join(','));
      } else {
        console.log('useEffect activityPage');
        activityPage();
      }
    });

    return () => {
      Taro.eventCenter.off('pullDownRefresh');
    };
  }, []);
  const activityPageByIds = async ids => {
    console.log('activityPage 调用');
    try {
      const res = await api.activityPageByIds({ ids });
      setList(res.data.data.list);
      console.log('activityPage', res.data.data);
      setPageLoading(false);
    } catch (err) {
      console.log('activityPage err', err);
    }
  };
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
    <View className='qc-activity-list relative'>
      <ScrollView scrollX className='list'>
        {list.length > 0
          ? list.map((item: any, index: number) => {
              return <ActivityItem item={item} index={index} key={item.id} />;
            })
          : !pageLoading && <QcEmptyPage icon='none' size='mini'></QcEmptyPage>}
        <LoadingBox visible={pageLoading} size='mini' />
      </ScrollView>
    </View>
  );
}

QcActivityList.options = {
  addGlobalClass: true
};
