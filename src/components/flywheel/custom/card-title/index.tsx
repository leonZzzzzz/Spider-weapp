import Taro from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import { IMG_HOST } from '@/config';
import './index.scss';

type Props = {
  options: {
    icon?: string;
    title: string;
    info: string;
  };
};
function QcCardTitle(props: Props) {
  return (
    <View className='qc-card-title'>
      <View className='qc-card-title__text'>
        {props.options.icon && <Image src={IMG_HOST + props.options.icon}></Image>}
        <View className='qc-card-title__text-title'>{props.options.title}</View>
        <View className='qc-card-title__text-info'>{props.options.info}</View>
      </View>
      <View className='qc-card-title__icon'>
        更多<Text className='qcfont qc-icon-chevron-right'></Text>
      </View>
    </View>
  );
}
QcCardTitle.options = {
  addGlobalClass: true
};
export default QcCardTitle;
