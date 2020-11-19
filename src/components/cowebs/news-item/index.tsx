import Taro, { useEffect, useState } from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';

import { IMG_HOST } from '@/config';

import './index.scss';

export default function NewsItem(props: any) {
  const { item, index } = props;

  const [newShow, setNewShow] = useState(false);

  useEffect(() => {
    if (item) {
      if (item.createTime) {
        const nowTime = new Date().getTime();
        let time = new Date(item.createTime.replace(/\-/g, '/')).getTime();
        let dayTime = 1000 * 60 * 60 * 24 * 7;
        if (nowTime - time < dayTime) {
          setNewShow(true);
        }
      }
    }
  }, [item]);

  const navigateTo = () => {
    Taro.navigateTo({
      url: `/pagesCoWebs/news/detail/index?id=${item.id}`
    });
  };

  return (
    <View className={`news-item ${index > 0 ? 'news-item-line' : ''}`} onClick={navigateTo}>
      <View className='content'>
        <View className='name'>
          {newShow && <Text className='new'>NEW</Text>}
          <Text>{item.title || item.name}</Text>
        </View>
        <View className='desc-wrap'>
          {item.createTime && <View>{item.createTime.substr(0, 10)}</View>}
          <View>{item.visitQuantity !== undefined && <Text>{item.visitQuantity}人已阅</Text>}</View>
        </View>
      </View>
      <View className='cover'>
        <Image src={IMG_HOST + item.iconUrl} mode='aspectFill' />
      </View>
    </View>
  );
}

NewsItem.options = {
  addGlobalClass: true
};

NewsItem.defaultProps = {
  item: {}
};
