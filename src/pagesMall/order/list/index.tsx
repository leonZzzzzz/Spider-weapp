import Taro, { useState, useEffect, useReachBottom, usePullDownRefresh, useRouter } from '@tarojs/taro';
import { View } from '@tarojs/components';
import './index.scss';

import { QcEmptyPage, LogoWrap, LoadingBox, TabsWrap, FixedBox } from '@/components/common';
import { OrderItem } from '@/components/mall';

import api from '@/api/mall';
import util from '@/utils/util';
import useGetListData from '@/useHooks/useGetListData';

export default function Index() {
  const [tabList] = useState<any[]>([
    { title: '全部', id: '' },
    { title: '待支付', id: 0 },
    { title: '待发货', id: 1 },
    { title: '待收货', id: 2 },
    { title: '已完成', id: 10 }
  ]);

  const { list, pageLoading, load, searchData, handleSearch } = useGetListData(
    'getOrderList',
    {
      status: ''
    },
    false
  );

  const { type } = useRouter().params;

  useEffect(() => {
    console.log('type', type);
    handleSearch('status', type !== undefined ? Number(type) : '');
  }, []);

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
    console.log('cancelOrder');
    load(false, 'refresh', id);
  };

  const receiveOrderTip = async (id: string) => {
    const res = await Taro.showModal({
      title: '收货提示',
      content: '是否确认收货?'
    });
    if (res.confirm) {
      util.showLoading(true, '提交中');
      handleReceiveOrder(id);
    }
  };

  const handleReceiveOrder = async (id: string) => {
    await api.receiveOrder({ id });
    util.showToast('操作成功');
    console.log('handleReceiveOrder');
    load(false, 'refresh', id);
  };

  const handleEnd = (id: string) => {
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
          onClickTabs={(e: string | number) => handleSearch('status', e)}
          style={{ background: '#fff' }}
        />
      </FixedBox>

      <View className='relative'>
        {list.length > 0 ? (
          list.map((item: any, i) => {
            return (
              <OrderItem
                item={item}
                key={item.id}
                index={i}
                onCancel={cancelTip}
                onReceiveOrder={receiveOrderTip}
                onEnd={handleEnd}
              />
            );
          })
        ) : (
          <QcEmptyPage icon='none' text='暂无相关订单'></QcEmptyPage>
        )}
      </View>

      <LogoWrap />
    </View>
  );
}

Index.config = {
  navigationBarTitleText: '我的订单',
  enablePullDownRefresh: true
};
