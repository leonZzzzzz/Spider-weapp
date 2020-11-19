import Taro, { useState, useEffect, useReachBottom, usePullDownRefresh } from '@tarojs/taro';
import { View } from '@tarojs/components';
import './index.scss';

import api from '@/api/cowebs';
import useGetListData from '@/useHooks/useGetListData';

import { QcEmptyPage, LoadingBox, XiaoetchCoursevipItem, LogoWrap } from '@/components/common';
import { useTabbar } from '@/useHooks/useFlywheel';

export default function Index() {
  // const [tabList, setTabList] = useState<any[]>([{ title: '全部', id: '' }]);

  const { list, pageLoading, load } = useGetListData('courseVipPage');
  useTabbar();
  // useEffect(() => {
  //   apiCategoryListByType();
  // }, []);

  useReachBottom(() => {
    load(true);
  });

  usePullDownRefresh(() => {
    // apiCategoryListByType();
    load();
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

      <View className='relative'>
        {list.length > 0 ? (
          list.map((item, index) => {
            return <XiaoetchCoursevipItem item={item} index={index} key={item.id} />;
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
  navigationBarTitleText: '小鹅通VIP会员课程包',
  enablePullDownRefresh: true
};
