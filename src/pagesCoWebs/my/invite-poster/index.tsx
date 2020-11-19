import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, Button, CoverView } from '@tarojs/components';
import DrawImageData from './json';
import api from '@/api/index';
import util from '@/utils/util';
import { LoadingBox, AuthorizeWrap, ThemeView } from '@/components/common';
import './index.scss';

export default function InvitePoster() {
  const [authorizeVisible, setAuthorizeVisible] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [member, setMember] = useState<any>({});
  const [template, setTemplate] = useState<any>({});
  const [posterUrl, setPosterUrl] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    getMemberInfo();
  }, []);

  const getMemberInfo = () => {
    const memberInfo = Taro.getStorageSync('memberInfo');
    if (memberInfo) {
      console.log('memberInfo----');
      setMember(memberInfo);
      getTongji(memberInfo);
    } else {
      contactsGet();
    }
  };
  const contactsGet = async () => {
    try {
      const res: any = await api.contactsGet();
      if (res.data.code === 63021) {
        setAuthorizeVisible(true);
        return;
      }
      Taro.setStorageSync('memberInfo', res.data.data);
      const data = res.data.data;
      setMember(data);
      getTongji(data);
    } catch (err) {
      console.error('contactsGet');
    }
  };

  const getTongji = async (memberInfo: any) => {
    try {
      const res = await api.contactsStatistics();
      // 获取海报背景
      let bgUrl = '';
      const resBgUrl = await api.getBgUrl();
      if (resBgUrl.data.data) {
        bgUrl = resBgUrl.data.data.url;
      } else {
        Taro.showToast({
          title: '未配置海报背景图',
          icon: 'none'
        });
        setTimeout(() => {
          Taro.navigateBack();
        }, 1000);
        return;
      }
      // 获取小程序码
      let QRCode = Taro.getStorageSync('QRCode');
      if (!QRCode) {
        const resQRCode = await api.getQRCode();
        QRCode = resQRCode.data.message;
        // const qrcodeData = await getSharerQrcode();
        // QRCode = qrcodeData.url;
        Taro.setStorageSync('QRCode', QRCode);
      }
      // const resQRCode = await api.getQRCode()
      // let QRCode = resQRCode.data.message
      const POSTER_TIPS1 = await api.POSTER_TIPS1();
      const POSTER_TIPS2 = await api.POSTER_TIPS2();
      let tips: any = {};
      if (POSTER_TIPS1.data.data && POSTER_TIPS1.data.data.value) tips.tip1 = POSTER_TIPS1.data.data.value;
      if (POSTER_TIPS2.data.data && POSTER_TIPS2.data.data.value) tips.tip2 = POSTER_TIPS2.data.data.value;
      setTemplate(new DrawImageData().palette(memberInfo, res.data.data, bgUrl, QRCode, tips));
    } catch (err) {
      setPageLoading(false);
      console.error(err);
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    }
  };

  const getSharerQrcode = async () => {
    try {
      const res = await api.sharerQrcodeGet();
      return res.data.data;
    } catch (err) {
      console.error(err);
      // util.showToast(err.data.message);
    }
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
    <ThemeView>
      <LoadingBox visible={pageLoading} />

      {/* <painter palette={template} onImgOK={onImgOK} onImgErr={onImgErr} bind:imgOK="onImgOK" /> */}
      <painter palette={template} onimgOK={handleImgOK} onimgErr={handleImgErr} />

      <CoverView className='btn-fixd'>
        <Button onClick={saveImage} loading={btnLoading} disabled={pageLoading} hoverClass='hover-button'>
          保存图片
        </Button>
      </CoverView>

      <AuthorizeWrap visible={authorizeVisible} />
    </ThemeView>
  );
}

InvitePoster.config = {
  navigationBarTitleText: '邀请海报',
  usingComponents: {
    painter: '../../../components/Painter/painter'
  }
};
