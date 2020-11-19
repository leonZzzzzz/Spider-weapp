import Taro, { useState, useReachBottom, usePullDownRefresh } from '@tarojs/taro';
import { View } from '@tarojs/components';
import './index.scss';

// import api from '@/api/cowebs'
import useGetListData from '@/useHooks/useGetListData';
import { QcEmptyPage, SearchWrap, TabsWrap, LogoWrap, FixedBox, LoadingBox } from '@/components/common';
import { OrderItem } from '@/components/promotion';

export default function Index() {
  const [tabList] = useState<any[]>([
    { title: '活动', id: 'activity-sign' }
    // { title: '课程', id: 'sourse-sign' },
    // { title: '商品', id: 'product-sign' },
  ]);
  const [typeList] = useState<any[]>([
    { title: '全部', id: '' },
    { title: '待奖励', id: 'ongoing' },
    { title: '已奖励', id: 'finish' },
    { title: '已失效', id: 'cancel' }
  ]);

  const { list, pageLoading, load, searchData, handleSearch } = useGetListData(
    'sharerCommissionPage',
    {
      status: '',
      fromOrderType: 'activity-sign'
    },
    true
  );

  useReachBottom(() => {
    load(true);
  });

  usePullDownRefresh(() => {
    load();
  });

  return (
    <View className='order'>
      <LoadingBox visible={pageLoading} />

      <FixedBox height={340}>
        <SearchWrap
          isInput={true}
          value={searchData.fromOrderTitle}
          onConfirm={(e: string) => handleSearch('fromOrderTitle', e)}
          onClear={() => handleSearch('fromOrderTitle')}
        />
        <TabsWrap
          tabs={tabList}
          current={searchData.fromOrderType}
          onClickTabs={(e: string) => handleSearch('fromOrderType', e)}
          style={{ background: '#fff' }}
          scroll={false}
        />

        <View className='type-container'>
          <View className='type-wrap'>
            {typeList.map((item: any) => {
              return (
                <View
                  key={item.id}
                  className={`type-item ${item.id === searchData.status ? 'active' : ''}`}
                  onClick={() => {
                    handleSearch('status', item.id);
                  }}>
                  {item.title}
                </View>
              );
            })}
          </View>
        </View>
      </FixedBox>

      <View className='relative'>
        {list.length > 0 ? (
          list.map((item, index) => {
            return <OrderItem item={item} index={index} key={item.id} />;
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
  navigationBarTitleText: '推广订单'
};
