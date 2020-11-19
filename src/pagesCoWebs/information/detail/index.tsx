import Taro, { useState, useEffect, useRouter, useShareAppMessage, usePullDownRefresh } from '@tarojs/taro';
import { View, Text, Button, Form, Input, ScrollView, Image, CoverView } from '@tarojs/components';
import { IMG_HOST, APPID } from '@/config';
import {
  Avatar,
  LoadingBox,
  Dialog,
  ShareWrap,
  LogoWrap,
  BottomBar,
  ThemeView,
  CommentWrap
} from '@/components/common';
import { AlumniSidebar, CommentItem } from '@/components/cowebs';
import api from '@/api/cowebs';
import util from '@/utils/util';
import withShare from '@/utils/withShare';
import { checkAuthorize, checkVisitor } from '@/utils/authorize';
import DrawImageData from './json';
import './index.scss';

export default function Detail() {
  const [pageLoading, setPageLoading] = useState(true);
  const [detail, setDetail] = useState<any>({});
  const [template, setTemplate] = useState<any>({});
  const [shareVisible, setShareVisible] = useState(false);
  const [posterVisible, setPosterVisible] = useState(false);
  const [posterLoading, setPosterLoading] = useState(true);
  const [posterUrl, setPosterUrl] = useState('');
  const [QRCodeData, setQRCodeData] = useState<any>({});

  const router: any = useRouter();
  const { id, scene } = router.params;

  const path = router.path;
  useShareAppMessage(() => {
    shareInsert();
    return withShare({
      title: '资源对接',
      path: `/pagesCoWebs/information/detail/index?id=${id}`
    });
  });

  useEffect(() => {
    informationPageTitle();
    Taro.hideShareMenu();
    getDetail();
  }, []);

  useEffect(() => {
    if (posterUrl) {
      console.log('setPosterLoading', posterLoading);
      if (posterLoading) setPosterLoading(false);
    }
  }, [posterUrl]);

  usePullDownRefresh(() => {
    getDetail();
    Taro.eventCenter.trigger('commentPage');
  });

  const informationPageTitle = async () => {
    const res = await api.informationPageTitle();
    if (res.data.message) {
      Taro.setNavigationBarTitle({
        title: res.data.message
      });
    }
  };

  const shareInsert = async () => {
    const res = await api.shareInsert({ sourceId: id, url: path, sourceType: 2 });
    if (res.data.data) getDetail('shareInsert');
  };

  const getDetail = async (type?: string) => {
    const res = await api.informationGet({ id: id || scene });
    const data = res.data.data;
    setDetail(data);
    if (type !== 'shareInsert') {
      setPageLoading(false);
      if (!res.data.data.isAudit) {
        unAuditedTip();
      }
    }
    Taro.stopPullDownRefresh();
  };

  const navigateTo = (e: any) => {
    checkVisitor(e).then(() => {
      checkAuthorize({
        success: () => {
          if (Taro.getStorageSync('releaseValue') === 1) {
            navigateToMiniProgram('/pagesCoWebs/information/release/index');
            return;
          }
          Taro.navigateTo({
            url: `/pagesCoWebs/information/release/index`
          });
        }
      });
    });
  };

  const navigateToMiniProgram = async (url: string) => {
    Taro.showLoading({
      title: '跳转中...',
      mask: true
    });
    try {
      let data: any = Taro.getStorageSync('toMiniProgramParams');
      if (!data.memberId || !data.appId) {
        const res = await api.getMemberIdAndAppId();
        data = res.data.data;
        Taro.setStorageSync('toMiniProgramParams', data);
      }
      console.log('getMemberIdAndAppId', data);
      Taro.hideLoading();
      const res = await Taro.navigateToMiniProgram({
        appId: APPID,
        path: `${url}?memberId=${data.memberId}&appId=${data.appId}`,
        envVersion: 'trial'
      });
      console.log(res);
    } catch (err) {
      console.error(err);
      if (/invalid appid/.test(err.errMsg)) {
        Taro.showToast({
          title: '跳转CoWebs失败，无效的appid',
          icon: 'none'
        });
      }
    }
  };

  const handlePraise = (wxMiniFormId: string) => {
    if (!detail.isAudit) {
      unAuditedTip();
      return;
    }
    let type = ``;
    if (detail.isPraise) {
      // 取消点赞
      type = `praiseDelete`;
      detail.isPraise = false;
    } else {
      // 点赞
      type = `praiseInsert`;
      detail.isPraise = true;
    }
    setDetail(detail);
    apiPraise(type, wxMiniFormId);
  };

  const apiPraise = async (type: string, wxMiniFormId: string) => {
    await api[type]({ sourceId: detail.id, wxMiniFormId });
    console.log('点赞功能 请求到数据了');
    getDetail();
  };

  const unAuditedTip = () => {
    Taro.showModal({
      title: '提示',
      content: '未审核的资讯不可转发、留言、点赞。',
      showCancel: false,
      confirmText: '知道了'
    });
  };

  // 预览轮播列表的大图
  const previewImage = (index: number) => {
    let list = detail.imgUrl.split(',').map((img: string) => IMG_HOST + img);
    let current = list[index];
    Taro.previewImage({
      current,
      urls: list
    });
  };

  const generatePoster = async () => {
    setPosterVisible(true);
    let _QRCodeData: any = QRCodeData;
    if (!QRCodeData.name && !QRCodeData.path) {
      try {
        const res = await api.getInformationQRCode({ id: detail.id });
        _QRCodeData = res.data.data;
        setQRCodeData(res.data.data);
      } catch (err) {
        Taro.showModal({
          title: '提示',
          content: '小程序码获取出错'
        });
        setPosterVisible(false);
        setPosterLoading(false);
        return;
      }
    }
    setTemplate(new DrawImageData().palette(detail, _QRCodeData));
  };

  const handleImgOK = (e: any) => {
    console.warn('handleImgOK', e);
    setPosterUrl(e.detail.path);
    // setPosterLoading(false)
  };
  const handleImgErr = (e: any) => {
    console.error('handleImgErr', e);
    Taro.showModal({
      title: '提示',
      content: JSON.stringify(e)
    });
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
  const sharePoint = async () => {
    setShareVisible(true)
    const res = await api.postSharePoint({ id: id })
    if (res.data.code == 20000 && res.data.data) {
      if (res.data.data > 0) {
        Taro.showToast({
          title: `+${res.data.data}积分`,
          icon: 'none'
        })
      }
    } else {
      Taro.showToast({
        title: res.data.message,
        icon: 'none'
      })
    }
  }

  // 举报
  const handleReport = () => {
    checkAuthorize({
      success: () => {
        const memberInfo = Taro.getStorageSync('memberInfo');
        Taro.navigateTo({
          url: `/pagesCoWebs/information/report/index?id=${detail.id}&reportMemberId=${memberInfo.id}&type=1`
        });
      }
    });
  };

  return (
    <ThemeView>
      <View className='information-detail'>
        <LoadingBox visible={pageLoading} />
        <View className='relative'>
          <View className='category'>#{detail.category}#</View>
          <View className='user-wrap'>
            <View
              className='member-box'
              onClick={() =>
                Taro.navigateTo({ url: `/pagesCoWebs/contacts/detail/index?memberId=${detail.memberId}` })
              }>
              <Avatar imgUrl={detail.headImage} width={80} />
              <View className='user__info'>
                <View className='name'>
                  <Text>{detail.username}</Text>
                  {detail.className && (
                    <Text className='class'>
                      {/-\/-/.test(detail.className) ? detail.className.replace('-/-', '-') : detail.className || '无'}
                    </Text>
                  )}
                </View>
                <View className='time'>{detail.createTimeStr}</View>
              </View>
            </View>
            <View className='report-btn'>{detail.isAudit && <Button onClick={handleReport}>举报</Button>}</View>
          </View>

          <View className='content-box'>
            <View className='content'>{detail.content}</View>
            {detail.imgUrl && (
              <View className='img-box'>
                {detail.imgUrl.split(',').map((img: string, idx: number) => {
                  return <Image src={IMG_HOST + img} key={img} mode='widthFix' onClick={() => previewImage(idx)} />;
                })}
              </View>
            )}
          </View>

          <View className='mini-box'>
            <View />
            <View className='icon-group'>
              <View className='i-item'>
                <Text className='qcfont qc-icon-zhuanfa' />
                <Text>{detail.shareQuantity}</Text>
              </View>
              <View className='i-item'>
                <Text className='qcfont qc-icon-liuyan-fill' />
                <Text>{detail.commentQuantity}</Text>
              </View>
              <View className='i-item'>
                <Text className='qcfont qc-icon-yulan' />
                <Text>{detail.visitQuantity}</Text>
              </View>
            </View>
          </View>
        </View>

        {detail.isEnableComment && (
          <CommentWrap
            sourceId={detail.sourceId}
            sourceType={2}
            isEnableCommentAudit={detail.isEnableCommentAudit}
            refresh={() => getDetail()}
          />
        )}

        <BottomBar
          isAudit={detail.isAudit}
          onTip={unAuditedTip}
          onComment={() => Taro.eventCenter.trigger('handleComment')}
          praiseQuantity={detail.praiseQuantity}
          isPraise={detail.isPraise}
          onPraise={handlePraise}
          onShare={sharePoint}
          showComment={detail.isEnableComment}
          isPoster={true}
        />

        <LogoWrap bottom={110} />

        {/* <AlumniSidebar position="top" headImage={detail.headImage} /> */}

        <View className='back-box'>
          <Button className='qcfont qc-icon-jia1' openType='getUserInfo' onGetUserInfo={navigateTo}></Button>
        </View>

        {/* 分享组件 */}
        <ShareWrap visible={shareVisible} pointId={id} onClose={() => setShareVisible(false)} onPoster={generatePoster} />

        {/* 海报弹窗 */}
        <Dialog visible={posterVisible} position='center' onClose={() => setPosterVisible(false)}>
          <View className='poster-dialog'>
            <View className='poster-wrap'>
              <painter palette={template} onImgOK={handleImgOK} onImgErr={handleImgErr} />
            </View>
            <Button type='primary' onClick={savePoster} loading={posterLoading}>
              {posterLoading ? '生成海报中...' : '保存到手机'}
            </Button>
          </View>
        </Dialog>
      </View>
    </ThemeView>
  );
}

Detail.config = {
  navigationBarTitleText: '资源对接',
  enablePullDownRefresh: true,
  usingComponents: {
    painter: '../../../components/Painter/painter'
  }
};
