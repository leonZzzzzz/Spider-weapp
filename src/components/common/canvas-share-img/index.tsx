import Taro, { useEffect } from '@tarojs/taro';
import { View, Canvas } from '@tarojs/components';
import './index.scss';

// import { IMG_HOST } from '@/config';

export default function Index(props: any) {
  const { imgUrl, onGetImg } = props;

  useEffect(() => {
    console.log('useEffect canvas-share-img', imgUrl);
    if (!imgUrl) return;
    drawImage();
  }, [imgUrl]);

  const drawImage = async () => {
    try {
      const { width, height } = await Taro.getImageInfo({
        src: imgUrl
      });
      const { tempFilePath } = await Taro.downloadFile({
        url: imgUrl
      });
      const ctx = Taro.createCanvasContext('shareImg', this.$scope);
      const scale = 500 / 400;
      if (width / height >= scale) {
        const _width = width * (400 / height);
        const _x = ((_width - 500) / 2) * -1;
        ctx.drawImage(tempFilePath, _x, 0, _width, 400);
      } else {
        const _height = height * (500 / width);
        const _y = ((_height - 400) / 2) * -1;
        ctx.drawImage(tempFilePath, 0, _y, 500, _height);
      }
      ctx.draw(false, async () => {
        const res = await Taro.canvasToTempFilePath(
          {
            x: 0,
            y: 0,
            width: 500,
            height: 400,
            destWidth: 1000,
            destHeight: 800,
            canvasId: 'shareImg'
          },
          this.$scope
        );
        onGetImg && onGetImg(res.tempFilePath);
      });
    } catch (err) {
      console.error('============ drawImage ============', err);
    }
  };

  return (
    <View style={{ position: 'fixed', zIndex: -999, top: Taro.pxTransform(-9999) }}>
      <Canvas canvasId='shareImg' style={{ width: '500px', height: '400px' }} />
    </View>
  );
}
