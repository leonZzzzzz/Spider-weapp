import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import './index.scss';

import { IMG_HOST } from '@/config';

export default function SurveyItem(props: any) {
  const { item } = props;

  const navigateTo = () => {
    Taro.navigateTo({
      url: `/pagesCoWebs/survey/detail/index?id=${item.id}`
    });
  };

  const statusStr = (status: number) => {
    return {
      0: '未开始',
      1: '已开始',
      2: '已结束'
    }[status];
  };

  return (
    <View className={`resource-item-box`}>
      <View className='resource-item box-shadow' onClick={navigateTo}>
        <View className='cover'>
          <Image src={IMG_HOST + item.picture} mode='aspectFill' />
        </View>
        <View className='title'>
          {item.status !== '' && (
            <Text className={`item-status-text ${item.status === 0 ? 'not-start' : item.status === 1 ? 'start' : ''}`}>
              {statusStr(item.status)}
            </Text>
          )}
          <Text>{item.title}</Text>
        </View>
      </View>
    </View>
  );
}

SurveyItem.options = {
  addGlobalClass: true
};

SurveyItem.defaultProps = {
  item: {}
};
