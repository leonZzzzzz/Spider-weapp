import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';

type Props = {
  options: {
    height: number;
    backgroundColor: string;
  };
};
export default function QcSplit(props: Props) {
  const { options } = props;
  let style = {
    // height: options.height * 2 + 'rpx',
    height: Taro.pxTransform(options.height * 2),
    backgroundColor: options.backgroundColor
  };
  return <View style={style} className='relative' />;
}

QcSplit.defaultProps = {
  options: {}
};

QcSplit.options = {
  addGlobalClass: true
};
