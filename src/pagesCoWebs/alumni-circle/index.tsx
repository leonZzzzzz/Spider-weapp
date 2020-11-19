import Taro, { useState, useEffect, useReachBottom, usePullDownRefresh, useDidShow } from '@tarojs/taro';
import { View, Text, Image, Swiper, SwiperItem, Button, Canvas, CoverView } from '@tarojs/components';
import './index.scss';

import api from '@/api/cowebs';
import util from '@/utils/util';
import { IMG_HOST } from '@/config';
import DrawImageData from './json';

import { LogoWrap, Dialog, ShareWrap } from '@/components/common';
import { AlumniSidebar, NavigationBar } from '@/components/cowebs';
import { useTabbar } from '@/useHooks/useFlywheel';

export default function Index() {
  const systemInfo = Taro.getSystemInfoSync();
  const [template, setTemplate] = useState<any>({});
  const [shareVisible, setShareVisible] = useState(false);
  const [posterVisible, setPosterVisible] = useState(false);
  const [posterLoading, setPosterLoading] = useState(true);
  const [posterUrl, setPosterUrl] = useState('');
  const [shareItem, setShareItem] = useState<any>({});
  const [list, setList] = useState<any>([
    {
      id: '21321',
      name: '的司法',
      desc:
        '山东积分哦上帝感觉佛i较高的多发几个东莞附件送i的风景山东覅就送到附近广佛i附件狗覅就多发几个发动攻击地方各级大哥东莞附件的风格哦技术都覅 山东佛',
      tag: '80后,天河同学会',
      img: '/attachments/null/b2ab4baed665453c8ddfd318b3d9c36f.png',
      headImage:
        'https://wx.qlogo.cn/mmopen/vi_32/bibvvqkcqNem9RVG1o0HjFUdtpSBY3awDZZ0jrkuiaib7DBiamMcOMlWCiaanLaEZzNckqb3NA133gg89uf7qEV9PiaA/132',
      like: true
    },
    {
      id: '213221',
      name: '的司东覅法',
      desc:
        '山东积分哦上帝感觉佛i较高的多发几个东莞附件送i的风景山东覅就送到附近广佛i附件狗覅就多发几个发动攻击地方各级大哥东莞附件的风格哦技术都覅 山东佛',
      tag: '80后,天河同学会',
      img: '/attachments/null/b2ab4baed665453c8ddfd318b3d9c36f.png',
      headImage:
        'https://wx.qlogo.cn/mmopen/vi_32/bibvvqkcqNem9RVG1o0HjFUdtpSBY3awDZZ0jrkuiaib7DBiamMcOMlWCiaanLaEZzNckqb3NA133gg89uf7qEV9PiaA/132',
      like: false
    }
  ]);
  useTabbar();
  // useEffect(() => {
  //   setShareItem(list[0])
  // }, [])
  // useEffect(() => {
  //   setTimeout(() => {

  //     if (shareItem.id) generatePoster()
  //   }, 2000)
  // }, [shareItem])

  const handleLike = (index: number) => {
    list[index].like = !list[index].like;
    setList(list);
    Taro.showToast({
      title: `${list[index].like ? '已关注' : '取消关注'}`,
      icon: 'none'
    });
  };

  const generatePoster = async () => {
    setPosterVisible(true);
    console.log('generatePoster', shareItem);
    // 获取小程序码
    let QRCode = Taro.getStorageSync('QRCode');
    if (!QRCode) {
      const resQRCode = await api.getQRCode();
      QRCode = resQRCode.data.message;
      Taro.setStorageSync('QRCode', resQRCode.data.message);
    }
    const textWidthList = measureText(shareItem.tag ? shareItem.tag.split(',') : []);
    setTemplate(new DrawImageData().palette(shareItem, textWidthList, QRCode));
  };

  const measureText = (tags: any[]) => {
    if (tags.length === 0) return [];
    const screenK = systemInfo.screenWidth / 750;
    console.log('screenK', screenK);
    const ctx = Taro.createCanvasContext('t-canvas', this);
    ctx.setFontSize(26 * screenK);
    const textWidthList = tags.map(res => {
      const textWidth = ctx.measureText(res).width;
      console.log(res, textWidth);
      return Math.ceil(textWidth / screenK);
      // Math.round(value * screenK);
    });
    console.log('textWidthList', textWidthList);

    // const query = Taro.createSelectorQuery()
    // query.selectAll('.tag_text').boundingClientRect()
    // query.exec(res => {
    //   console.log(res)
    // })

    return textWidthList;
  };

  const handleImgOK = (e: any) => {
    console.warn('handleImgOK', e);
    setPosterUrl(e.detail.path);
    setPosterLoading(false);
  };

  const savePoster = async () => {
    Taro.showLoading({
      title: '生成图片中',
      mask: true
    });
    setPosterLoading(true);
    try {
      const res = await Taro.saveImageToPhotosAlbum({
        filePath: posterUrl
      });
      console.log(res);
      Taro.hideLoading();
      Taro.showToast({
        title: '已保存到本地'
      });
      setPosterLoading(false);
    } catch (err) {
      setPosterLoading(false);
      console.log(err);
      Taro.hideLoading();
      if (/fail auth deny/.test(err.errMsg)) util.checkAuthorizeWritePhotosAlbum();
      else {
        Taro.showToast({
          title: '取消保存，可重试',
          icon: 'none'
        });
      }
    }
  };

  return (
    <View className='alumni-circle'>
      <NavigationBar />

      <Swiper vertical className='card__swiper'>
        {list.map((item: any, idx: number) => {
          return (
            <SwiperItem className='card__swiper-item' key={item.id}>
              <Image src={IMG_HOST + item.img} mode='aspectFill' />
              <View className='user-card'>
                <View className='name'>{item.name}</View>
                <View className='desc'>{item.desc}</View>
                {item.tag && (
                  <View className='user__tags'>
                    {item.tag.split(',').map((tag: string) => {
                      return (
                        <Text className='tag' key={tag}>
                          {tag}
                        </Text>
                      );
                    })}
                  </View>
                )}
              </View>
              <AlumniSidebar
                showLike={true}
                isLike={item.like}
                headImage={item.headImage}
                onLike={handleLike}
                index={idx}
                onShare={() => {
                  setShareItem(item);
                  setShareVisible(true);
                }}
              />
            </SwiperItem>
          );
        })}
      </Swiper>

      <LogoWrap />

      {/* 分享组件 */}
      <ShareWrap visible={shareVisible} onClose={() => setShareVisible(false)} onPoster={generatePoster} />

      {/* 海报弹窗 */}
      <Dialog
        visible={posterVisible}
        position='center'
        onClose={() => setPosterVisible(false)}
        styles={{ top: '55%' }}
        isMaskClick={false}>
        <View className='poster-dialog'>
          <View className='poster-wrap'>
            <Canvas canvasId='t-canvas' style='position: absolute; z-index: -1; width: 100px; height: 0;' />
            <painter palette={template} onImgOK={handleImgOK} />
            <CoverView className='qcfont qc-icon-close close' onClick={() => setPosterVisible(false)} />
          </View>
          <Button type='primary' onClick={savePoster} loading={posterLoading}>
            {posterLoading ? '生成海报中...' : '保存到手机'}
          </Button>
        </View>
      </Dialog>
    </View>
  );
}

Index.config = {
  navigationStyle: 'custom',
  usingComponents: {
    painter: '../components/Painter/painter'
  }
};
