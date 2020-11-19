import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import { IMG_HOST } from '@/config';
import { usePageConfig } from '@/useHooks/useFlywheel';
import './index.scss';

type Props = {
  options: {
    data: {
      iconUrl: string;
      item: [{ left: number; top: number; width: number; height: number; url: string }];
    };
  };
};

function QcHotZone(props: Props) {
  const { background } = usePageConfig((Number(this.$router.path.substr(-1)) || 1) - 1);

  return (
    <View style={{ position: 'relative', zIndex: 1, background }} className='qc-hot-zone'>
      <Image src={IMG_HOST + props.options.data.iconUrl} style='width:100%' mode='widthFix'></Image>
      {props.options &&
        props.options.data.item &&
        props.options.data.item.map((item, index) => {
          return (
            <View
              key={index + 'a'}
              style={{
                position: 'absolute',
                left: item.left * 2 + 'rpx',
                top: item.top * 2 + 'rpx',
                width: item.width * 2 + 'rpx',
                height: item.height * 2 + 'rpx'
              }}
              onClick={() => {
                Taro.navigateTo({ url: item.url }).catch(() => {
                  Taro.switchTab({ url: item.url });
                });
              }}></View>
          );
        })}
    </View>
  );
}

QcHotZone.defaultProps = {
  options: {
    data: {}
  }
};
export default QcHotZone;
