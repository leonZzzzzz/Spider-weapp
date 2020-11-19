import Taro, { useReachBottom, usePullDownRefresh } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './index.scss';

import useGetListData from '@/useHooks/useGetListData';

import { QcEmptyPage, LoadingBox, LogoWrap } from '@/components/common';
import Utils from '@/utils/util';

export default function Index() {
  const { list, pageLoading, load, searchData } = useGetListData(
    'donateMyOrderPage',
    {},
    true
  );

  // const [list, setList] = useState<any[]>([
  //   // {
  //   //   id: '1',
  //   //   title: '建寺功德-添香油',
  //   //   orderNumber: 123456789,
  //   //   amount: 2000,
  //   //   createTime: '20200529 14:10:00'
  //   // },
  // ])

  useReachBottom(() => {
    load(true);
  });

  usePullDownRefresh(() => {
    
  });

  return (
    <View>
      <LoadingBox visible={pageLoading} />

      <View className='relative'>
        {list.length > 0 && <View className='total'>感谢您一共参加捐款<Text className='yellow-color'>{ searchData.total }</Text>次</View>}
        {list.length > 0 ? (
          list.map((item, index) => {
            return <View className='item' key={item.id}>
              <View className='item-left'>
                {(list.length - index) < 10 ? '0'+(list.length - index) : list.length - index}
                <View className='line'></View>
              </View>
              <View className='item-center'>
                <View className='title'>{item.title +'-'+ item.item}</View>
                <View className='number'>单号：{item.orderNumber}</View>
                <Text className='date'>{Utils.formatDateStr(item.createTime, 'minute')}</Text>
              </View>
              <View className='item-right'>
                <View className='price'>￥{Utils.filterPrice(item.amount)}</View>
                {item.orderStatus == 'refund' && <View className='status-tag'>已退款</View>}
              </View>
            </View>
          })
        ) : (
          <QcEmptyPage icon='none' text='暂无数据'></QcEmptyPage>
        )}
      </View>
      <LogoWrap />
    </View>
  );
}

Index.config = {
  navigationBarTitleText: '我的捐款',
  enablePullDownRefresh: false
};
