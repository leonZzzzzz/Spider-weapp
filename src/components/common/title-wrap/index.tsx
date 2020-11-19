import Taro, { useEffect, useState } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import util from '@/utils/util';
import './index.scss';

export default function TitleWrap(props: any) {
  const { options } = props;

  const [category, setCategory] = useState<any>({});

  useEffect(() => {
    Taro.eventCenter.on('eventCategoryId', (id, type) => {
      console.log(id, type);
      category.id = id;
      category.type = type;
      setCategory(category);
    });
  });

  const navigationTo = (url: string) => {
    const reg = new RegExp(category.type);
    if (category.id && reg.test(url)) {
      Taro.setStorageSync('moreCategoryId', category.id);
    }
    util.navigateTo(url);
  };

  return (
    <View className='title-wrap-components relative' style={{ backgroundColor: options.backgroundColor || '#fff' }}>
      <View className='title-wrap'>
        <Text className='line' />
        <Text>{options.title}</Text>
      </View>
      {/* <View className="title-line">{options.title}</View> */}
      {options.isMore && (
        <View className='desc' onClick={() => navigationTo(options.href)}>
          <Text>{options.more}</Text>
          <Text className='qcfont qc-icon-chevron-right' />
        </View>
      )}
    </View>
  );
}

TitleWrap.options = {
  addGlobalClass: true
};

TitleWrap.defaultProps = {
  options: {}
};
