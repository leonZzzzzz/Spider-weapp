import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, Image, Button, Text } from '@tarojs/components';
import { IMG_HOST } from '@/config';
import util from '@/utils/util';
import './index.scss';
import { checkVisitor } from '@/utils/authorize';

import { useSelector } from '@tarojs/redux';

export default function PromotionItem(props: any) {
  const { sharer, distributer } = useSelector((state: any) => state);
  // const { distributer } = useSelector((state: any) => state.distributer);
  const { item, index, onPoster, type } = props;

  const navigateTo = () => {
    util.navigateTo(
      `/pagesCoWebs/activity/${item.showStyle === 2 ? 'detail-commission' : 'detail'}/index?id=${item.id}&type=${type}`
    );
  };

  return (
    <View className={`promotion-item ${index > 0 ? 'promotion-item-line' : ''}`} key={item.id} onClick={navigateTo}>
      <View className='promotion-item__left'>
        <Image mode='aspectFill' src={IMG_HOST + item.iconUrl} />
      </View>
      <View className='promotion-item__right'>
        <View className='title'>{item.title}</View>
        <View className='p-bottom-wrap'>
          <View className='price-wrap'>
            <View className='price'>{util.filterPrice(item.price)}</View>
            <View className='yongjin'>
              <Text className='text'>佣金</Text>
              <Text className='amount'>
                ￥
                {util.filterPrice(
                  util.mul(
                    item.commission,
                    util.chu(type === 'distributer' ? distributer.user.commissionRate : sharer.user.commissionRate, 100)
                  )
                )}
              </Text>
            </View>
          </View>
          <Button
            className='tui'
            openType='getUserInfo'
            onClick={e => e.stopPropagation()}
            onGetUserInfo={e => {
              checkVisitor(e).then(() => {
                onPoster && onPoster(item);
              });
            }}>
            推广
          </Button>
        </View>
      </View>
    </View>
  );
}

PromotionItem.defaultProps = {
  item: {},
  type: ''
};

PromotionItem.options = {
  addGlobalClass: true
};
