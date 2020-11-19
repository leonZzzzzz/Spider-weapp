import Taro, { useState, useReachBottom, usePullDownRefresh } from '@tarojs/taro';
import { View } from '@tarojs/components';
import './index.scss';

import { QcEmptyPage, LogoWrap, LoadingBox, TabsWrap, FixedBox, AuthorizeWrap } from '@/components/common';
import { AfterSalesOrderItem } from '@/components/mall';

import api from '@/api/mall';
import util from '@/utils/util';
import useGetListData from '@/useHooks/useGetListData';

export default function Index() {
  const [tabList] = useState<any[]>([
    { title: '全部', id: '' },
    { title: '进行中', id: 'ongoing' },
    { title: '已完成', id: 'finish' }
  ]);

  const { list, pageLoading, load, searchData, handleSearch, authorizeVisible } = useGetListData('afterSalePage', {
    status: ''
  });

  useReachBottom(() => {
    load(true);
  });

  usePullDownRefresh(() => {
    load();
  });

  // 取消订单提示
  const cancelTip = (id: string) => {
    Taro.showModal({
      title: '提示',
      content: '是否取消该订单？'
    }).then(res => {
      if (res.confirm) {
        util.showLoading(true, '提交中');
        cancelOrder(id);
      }
    });
  };
  // 取消订单
  const cancelOrder = async (id: string) => {
    await api.cancelOrder({ id });
    util.showToast('取消成功');
    load(false, 'refresh', id);
  };

  return (
    <View>
      <LoadingBox visible={pageLoading} />

      <FixedBox height={90}>
        <TabsWrap
          scroll={false}
          tabs={tabList}
          current={searchData.status}
          onClickTabs={(e: string) => handleSearch('status', e)}
          style={{ background: '#fff' }}
        />
      </FixedBox>

      <View className='relative'>
        {list.length > 0 ? (
          list.map((item: any) => {
            return <AfterSalesOrderItem item={item} key={item.id} onCancel={cancelTip} />;
          })
        ) : (
          <QcEmptyPage icon='none' text='暂无相关订单'></QcEmptyPage>
        )}
      </View>

      <LogoWrap />

      <AuthorizeWrap visible={authorizeVisible} />
    </View>
  );
}

Index.config = {
  navigationBarTitleText: '售后订单',
  enablePullDownRefresh: true
};
