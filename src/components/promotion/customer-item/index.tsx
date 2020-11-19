import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, Image, Button } from '@tarojs/components';
import { IMG_HOST } from '@/config';
import util from '@/utils/util';
import './index.scss';

import { Avatar } from '@/components/common';

export default function CustomerItem(props: any) {
  const { item, index, type } = props;

  return (
    <View className={`customer-item ${index > 0 ? 'top-line' : ''}`}>
      <Avatar imgUrl={item.headImage} width={70} />
      {type === 'team' ? (
        <View className='info-wrap'>
          <View className='line'>
            <View className='name'>{item.appellation}</View>
            <View className={`amount ${item.commission > 0 ? 'amount-success' : ''}`}>
              ￥{util.filterPrice(item.commission)}
            </View>
          </View>
          <View className='line'>
            <View>{item.bindTime}</View>
          </View>
        </View>
      ) : (
        <View className='info-wrap'>
          <View className='line'>
            <View className='name'>{item.appellation}</View>
            {item.expireDescription && <View className='day'>{item.expireDescription}</View>}
          </View>
          <View className='line'>
            <View className='price'>成交额：￥{util.filterPrice(item.amount)}</View>
            {item.insteadDesciption && <View>{item.insteadDesciption}</View>}
          </View>
        </View>
      )}
    </View>
  );
}

CustomerItem.defaultProps = {
  item: {},
  type: ''
};

CustomerItem.options = {
  addGlobalClass: true
};
