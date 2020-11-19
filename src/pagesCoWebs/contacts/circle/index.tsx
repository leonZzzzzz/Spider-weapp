import Taro, { useState } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { TabsWrap, FixedBox, ThemeView } from '@/components/common';
import { CircleItem } from '@/components/cowebs';
import './index.scss';

export default function Circle() {
  const [categoryList] = useState<any[]>([
    { id: '', name: '全部' },
    { id: '1', name: '运动类' },
    { id: '2', name: '公益类' },
    { id: '3', name: '年代圈' },
    { id: '4', name: '旅游圈' },
    { id: '5', name: '旅游圈' }
  ]);
  const [searchData, setSearchData] = useState<any>({
    categoryId: ''
  });

  const [list, setList] = useState<any[]>([
    {
      id: '1',
      name: '80后',
      iconUrl: '/attachments/null/b2ab4baed665453c8ddfd318b3d9c36f.png',
      url: ''
    },
    {
      id: '13',
      name: '太极俱乐部多少',
      iconUrl: '/attachments/null/b2ab4baed665453c8ddfd318b3d9c36f.png',
      url: ''
    },
    {
      id: '1',
      name: '80后',
      iconUrl: '/attachments/null/b2ab4baed665453c8ddfd318b3d9c36f.png',
      url: ''
    },
    {
      id: '13',
      name: '太极俱乐部',
      iconUrl: '/attachments/null/b2ab4baed665453c8ddfd318b3d9c36f.png',
      url: ''
    },
    {
      id: '13',
      name: '太极俱乐部多少圣诞氛围',
      iconUrl: '/attachments/null/b2ab4baed665453c8ddfd318b3d9c36f.png',
      url: ''
    },
    {
      id: '1',
      name: '80后',
      iconUrl: '/attachments/null/b2ab4baed665453c8ddfd318b3d9c36f.png',
      url: ''
    }
  ]);

  const handleClickTabs = (e: string | number) => {
    searchData.categoryId = e;
    setSearchData(searchData);
  };

  return (
    <ThemeView>
      <View className='circle'>
        <FixedBox>
          <TabsWrap
            tabs={categoryList}
            current={searchData.categoryId}
            onClickTabs={handleClickTabs}
            style={{ background: '#fff' }}
          />
        </FixedBox>
        <View style={{ height: Taro.pxTransform(20), background: '#f3f3f3' }} />
        <View className='circle-box'>
          <View className='title'>我的圈子</View>
          <View className='icon-tags'>
            {list.map((item: any) => {
              return <CircleItem item={item} key={item.id} />;
            })}
          </View>
        </View>
        <View style={{ height: Taro.pxTransform(20), background: '#f3f3f3' }} />
        <View className='circle-box'>
          <View className='title'>
            <View>我的圈子</View>
            <View className='move'>
              <Text>更多</Text>
              <Text className='qcfont qc-icon-chevron-right' />
            </View>
          </View>
          <View className='icon-tags'>
            {list.map((item: any) => {
              return <CircleItem item={item} key={item.id} />;
            })}
          </View>
        </View>
      </View>
    </ThemeView>
  );
}

Circle.config = {
  navigationBarTitleText: '圈子'
};
