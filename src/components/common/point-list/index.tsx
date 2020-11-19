import Taro, { useEffect, useState } from '@tarojs/taro';
import { View, Image, Text, Block } from '@tarojs/components';
import { ThemeView } from '@/components/common';

import './index.scss';

export default function PointList(props: any) {
  const { detail } = props;
  console.log(detail)
  return (
    <Block>
      {detail.map(item => {
        return (
          <View className='lists bor-bot'>
            <View className='nobor'>
              <View className='row'>
                <Text>{item.rank}</Text>
                <Image src={item.headImage}></Image>
                <Text>{item.appellation}</Text>
              </View>
              <View className='row'>
                <Text>{item.point}分</Text>
              </View>
            </View>
          </View>
        )
      })}
    </Block>

  );
}

PointList.options = {
  addGlobalClass: true
};

PointList.defaultProps = {
  detail: []
};

