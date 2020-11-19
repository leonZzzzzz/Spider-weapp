import Taro, { useState, useEffect, useRouter } from '@tarojs/taro';
import { View, Button, CoverView } from '@tarojs/components';
import DrawImageData from './json';
import api from '@/api/index';
import util from '@/utils/util';
import { LoadingBox } from '@/components/common';
import './index.scss';

import { useSelector, useDispatch } from '@tarojs/redux';
import { sharerInitUser } from '@/store/actions/sharer';

export default function InvitePoster() {
  const { user } = useSelector((state: any) => state.sharer);
  const dispatch = useDispatch();
  const [pageLoading, setPageLoading] = useState(true);
  const [template, setTemplate] = useState<any>({});
  const [posterUrl, setPosterUrl] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);

  const { id, showStyle, title, iconUrl, _QRCodeUrl } = useRouter().params;

  useEffect(() => {
    console.log('user', user);
    if (user.id) {
      generatePoster(user);
    } else {
      sharerGet();
    }
    util.setNavigationBarTitle(title);
  }, []);

  // 推广者
  const sharerGet = async () => {
    try {
      const res = await api.sharerGet();
      const data = res.data.data;
      if (data.isSharer) {
        dispatch(sharerInitUser(data));
        generatePoster(data);
      }
    } catch (err) {
      console.log('sharerGet', err);
    }
  };

  const navigateBack = (message: string, duration: number = 2000) => {
    util.showToast(message);
    setTimeout(() => {
      Taro.navigateBack();
    }, duration);
  };

  const getBgUrl = async () => {
    try {
      const res = await api.distributerPosterBackgroundPopularizationGet();
      if (!res.data.data.url) return { url: '/attachments/null/f1e6239e63434a65950ddb464aac4bd7.png' }
      return res.data.data;
    } catch (err) {
      navigateBack(err.data.message);
    }
  };

  const getQrcode = async () => {
    try {
      const res = await api.sharerQrcodeGetActivity({
        activityId: id,
        showStyle: showStyle,
        page: 'pagesPromotion/transfer/index'
      });
      return res.data.data;
    } catch (err) {
      navigateBack(err.data.message);
    }
  };

  const generatePoster = async (memberInfo: any) => {
    const bgUrlData = await getBgUrl();
    // const qrcodeData = await getQrcode();
    // console.log(memberInfo：头像昵称, bgUrlData：背景, qrcodeData：二维码, title：标题, iconUrl: 图片)
    setTemplate(new DrawImageData().palette(memberInfo, bgUrlData, _QRCodeUrl, { title, iconUrl }));
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
        title: '保存成功'
      });
      setBtnLoading(false);
    } catch (err) {
      setBtnLoading(false);
      console.error(err);
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
          保存图片
        </Button>
      </CoverView>
    </View>
  );
}

InvitePoster.config = {
  navigationBarTitleText: '邀请海报',
  usingComponents: {
    painter: '../../../components/Painter/painter'
  }
};
