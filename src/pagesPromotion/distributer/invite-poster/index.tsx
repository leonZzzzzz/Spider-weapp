import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, Button, CoverView } from '@tarojs/components';
import DrawImageData from './json';
import api from '@/api/index';
import util from '@/utils/util';
import { LoadingBox } from '@/components/common';
import './index.scss';

import { useSelector } from '@tarojs/redux';

export default function InvitePoster() {
  const { user } = useSelector((state: any) => state.distributer);
  const [pageLoading, setPageLoading] = useState(true);
  const [template, setTemplate] = useState<any>({});
  const [posterUrl, setPosterUrl] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    generatePoster(user);
  }, []);

  const navigateBack = (message: string, duration: number = 2000) => {
    util.showToast(message);
    setTimeout(() => {
      Taro.navigateBack();
    }, duration);
  };

  const getBgUrl = async () => {
    try {
      const res = await api.distributerPosterBackgroundIndexGet();
      return res.data.data;
    } catch (err) {
      navigateBack(err.data.message);
    }
  };

  const getQrcode = async () => {
    try {
      const res = await api.distributerQrcodeGet();
      return res.data.data;
    } catch (err) {
      navigateBack(err.data.message);
    }
  };

  const generatePoster = async (memberInfo?: any) => {
    const bgUrlData = await getBgUrl();
    const qrcodeData = await getQrcode();
    setTemplate(new DrawImageData().palette(memberInfo, bgUrlData, qrcodeData));
    setPageLoading(false);
  };

  const handleImgOK = (e: any) => {
    console.warn('handleImgOK', e);
    setPosterUrl(e.detail.path);
    setPageLoading(false);
  };

  const saveImage = async () => {
    Taro.showLoading({
      title: '生成图片中',
      mask: true
    });
    setBtnLoading(true);
    try {
      const res = await Taro.saveImageToPhotosAlbum({
        filePath: posterUrl
      });
      console.log(res);
      Taro.hideLoading();
      Taro.showToast({
        title: '已保存到本地'
      });
      setBtnLoading(false);
    } catch (err) {
      setBtnLoading(false);
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

  const handleImgErr = (e: any) => {
    console.error('handleImgErr', e);
    Taro.showModal({
      title: '提示',
      content: JSON.stringify(e)
    });
  };

  return (
    <View>
      <LoadingBox visible={pageLoading} />

      <painter palette={template} onimgOK={handleImgOK} onimgErr={handleImgErr} />

      <CoverView className='btn-fixd'>
        <Button onClick={saveImage} loading={btnLoading} disabled={pageLoading} hoverClass='hover-button'>
          保存图片到相册
        </Button>
      </CoverView>
    </View>
  );
}

InvitePoster.config = {
  navigationBarTitleText: '邀请好友',
  usingComponents: {
    painter: '../../../components/Painter/painter'
  }
};
