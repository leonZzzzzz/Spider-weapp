import Taro, { useState, useEffect, useReachBottom, usePullDownRefresh, useDidShow, useRouter } from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';

import './index.scss';

import { QcEmptyPage, LoadingBox, AuthorizeWrap, LogoWrap } from '@/components/common';
import { AtRate } from 'taro-ui';

import useGetListData from '@/useHooks/useGetListData';

export default function Index() {
  const { list, pageLoading, load, handleSearch, authorizeVisible } = useGetListData(
    'getProductEvaluate',
    {
      productId: ''
    },
    false
  );

  const { productId } = useRouter().params;

  useEffect(() => {
    handleSearch('productId', productId);
  }, []);

  useReachBottom(() => {
    load(true);
  });

  usePullDownRefresh(() => {
    load();
  });

  return (
    <View className='page-evaluate-list'>
      <LoadingBox visible={pageLoading} />

      <View className='relative'>
        {list.length > 0 ? (
          list.map((item: any) => {
            return (
              <View className='evaluate-item' key={item.id}>
                <View className='user-wrapper'>
                  <View className='info'>
                    <Image className='headimg' mode='aspectFill' src={item.headImage} />
                    <Text className='name'>{item.memberName}</Text>
                    {item.levelIconUrl && <Image className='member-icon' mode='widthFix' src={item.levelIconUrl} />}
                  </View>
                  <View className='spec'>{item.spec}</View>
                </View>
                <View className='content'>{item.content}</View>
                <View className='footer'>
                  <AtRate size={15} value={item.score} />
                  <View className='date'>{item.createTime}</View>
                </View>
              </View>
            );
          })
        ) : (
          <QcEmptyPage icon='none' text='暂无评价'></QcEmptyPage>
        )}
      </View>

      <LogoWrap />

      <AuthorizeWrap visible={authorizeVisible} />
    </View>
  );
}

Index.config = {
  navigationBarTitleText: '评价',
  enablePullDownRefresh: true
};
