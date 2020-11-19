import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import ThemeView from '../theme-view';
import './index.scss';

function LoadingBox(props: any) {
  const { visible, text, size } = props;
  // console.log(visible, text, size)
  return (
    visible && (
      <ThemeView>
        <View className={`${size === 'mini' ? 'loading-wrapper-mini' : 'loading-wrapper'}`}>
          <View className='loading-box'>
            <View className='loading-border' />
            <View className='loading-text'>{text}</View>
          </View>
        </View>
      </ThemeView>
    )
  );
}

LoadingBox.defaultProps = {
  visible: false,
  text: '加载中'
};

export default LoadingBox;
