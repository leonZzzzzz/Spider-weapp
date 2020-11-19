import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './index.scss';
import { ThemeView } from '@/components/common';

export default function NoticeWrap(props: any) {
  let { title } = props;

  return (
    <ThemeView>
      <View className='qc-notice-wrap'>
        <Text className='qcfont qc-icon-lingsheng' />
        <Text className='title'>{title}</Text>
      </View>
    </ThemeView>
  );
}

NoticeWrap.options = {
  addGlobalClass: true
};
