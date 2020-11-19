import Taro, { useState, useEffect, useDidShow, useReachBottom, usePullDownRefresh } from '@tarojs/taro';
import { View, Text, Button, Input } from '@tarojs/components';
import './index.scss';

import util from '@/utils/util';
import { LoadingBox, LogoWrap, QcEmptyPage } from '@/components/common';

import useGetListData from '@/useHooks/useGetListData';

const statusObj = {
  ongoing: '处理中',
  fail: '失败',
  finish: '提现完成'
};

function combination(props: any[]) {
  let monthList = [...props.map((item: any) => item.month)];
  monthList = [...new Set(monthList)];
  // 存储处理返回的数据格式
  let stateArray = monthList.map((item: any) => {
    return {
      month: item,
      items: []
    };
  });

  props.map((next: any) => {
    stateArray.map((item: any) => {
      if (next.month === item.month) {
        item.items.push(next);
      }
    });
  });

  // 对列表按照日期大小排序
  stateArray = stateArray.sort((a, b) => {
    let a1 = new Date(a.month).getTime();
    let b1 = new Date(b.month).getTime();
    return b1 - a1;
  });

  return stateArray;
}

export default function Index() {
  const { packList, pageLoading, load } = useGetListData('withdrawPage', {}, true, combination);

  useReachBottom(() => {
    load(true);
  });

  usePullDownRefresh(() => {
    load();
  });

  return (
    <View className='account-details'>
      <LoadingBox visible={pageLoading} />

      <View className='relative'>
        {packList.length > 0 ? (
          packList.map(item => {
            return (
              <View key={item.id} className='account-group'>
                <View className='date'>{item.month}</View>
                <View className='account-card box-shadow'>
                  {item.items.map((label: any) => {
                    return (
                      <View
                        key={label.id}
                        className='account-item'
                        onClick={() =>
                          util.navigateTo(`/pagesPromotion/sharer/withdrawal-status/index?id=${label.id}`)
                        }>
                        <View className='left'>
                          <View className='title'>{label.name}</View>
                          <View className={`status ${label.status}`}>{statusObj[label.status]}</View>
                          <View className='time'>{label.createTime}</View>
                        </View>
                        <View className='right'>
                          <View className='price'>{util.filterPrice(label.amount)}</View>
                          <View className='qcfont qc-icon-chevron-right' />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
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
  navigationBarTitleText: '账户明细',
  enablePullDownRefresh: true
};
