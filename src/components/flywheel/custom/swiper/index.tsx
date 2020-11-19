import Taro from '@tarojs/taro';
import { SwiperItem, Swiper, Image, Block, View } from '@tarojs/components';
import { IMG_HOST } from '@/config';
import QcLayoutSplit from '../layout-split';
import util from '@/utils/util';
import { ThemeView } from '@/components/common';
import './index.scss';

type Props = {
  options: {
    needSplit: boolean;
    autoplay: boolean;
    indicatorDots: boolean;
    height: number;
    interval: number;
    margin: number;
    item: {
      url: string;
      iconUrl: string;
      name?: string;
    }[];
  };
};
export default function QcSwiper(props: Props) {
  const { options } = props;
  const navigateTo = (url: string) => {
    if (!url) return;
    util.navigateTo(url);
  };

  const style = { width: '100%', height: props.options.height * 2 + 'rpx', borderRadius: options.borderRadius + 'px' };
  return (
    <QcLayoutSplit needSplit={options.needSplit}>
      <ThemeView>
        <View className='qc-swiper-box' style={{ padding: `2px ${Taro.pxTransform(options.margin * 2)}` }}>
          {/* <View className="bg-top" /> */}
          <Swiper
            className='qc-swiper'
            style={style}
            indicatorDots={options.indicatorDots}
            autoplay={options.autoplay}
            circular
            interval={options.interval}>
            {options.item.map(item => {
              return (
                <Block key={item.iconUrl}>
                  <SwiperItem
                    className='qc-swiper_item'
                    onClick={() => {
                      navigateTo(item.url);
                    }}>
                    <Image style={style} mode='aspectFill' src={IMG_HOST + item.iconUrl}></Image>
                  </SwiperItem>
                </Block>
              );
            })}
          </Swiper>
        </View>
      </ThemeView>
    </QcLayoutSplit>
  );
}

QcSwiper.defaultProps = {
  options: {
    needSplit: false,
    item: []
  }
};

QcSwiper.options = {
  addGlobalClass: true
};
