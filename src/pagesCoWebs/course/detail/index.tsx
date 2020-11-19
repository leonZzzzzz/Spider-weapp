import { View, Image, Text, Button } from '@tarojs/components';
import Taro, { useState, useEffect, useShareAppMessage, useDidShow, usePullDownRefresh } from '@tarojs/taro';
import api from '@/api/index';
import util from '@/utils/util';
import withShare from '@/utils/withShare';

import { IMG_HOST } from '@/config';
import {
  LoadingBox,
  LogoWrap,
  ContentWrap,
  BottomBar,
  ShareWrap,
  ThemeView,
  CommentWrap,
  CanvasShareImg,
  Dialog
} from '@/components/common';
import { checkAuthorize, checkVisitor } from '@/utils/authorize';
import './index.scss';

import DrawImageData from './json';

export default function ActivityDetail() {
  const [pageLoading, setPageLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const [shareVisible, setShareVisible] = useState(false);
  const [posterVisible, setPosterVisible] = useState(false);
  const [posterLoading, setPosterLoading] = useState(true);
  const [posterUrl, setPosterUrl] = useState('');
  const [template, setTemplate] = useState<any>({});
  const [QRCodeUrl, setQRCodeUrl] = useState('');
  const [weappName, setWeappName] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [query, setQuery] = useState<any>({});

  useEffect(() => {
    initialize(this.$router.params);
  }, []);

  useDidShow(() => {
    if (query.id) courseGet(query);
  });

  usePullDownRefresh(() => {
    courseGet(query);
    if (detail.isEnableComment) Taro.eventCenter.trigger('commentPage');
  });

  useShareAppMessage(() => {
    return withShare({
      title: detail.title,
      // imageUrl: IMG_HOST + detail.iconUrl,
      imageUrl,
      path: `/pagesCoWebs/course/detail/index?id=${detail.id}`
    });
  });

  useEffect(() => {
    console.log('useEffect query', query);
    if (query.id) courseGet(query);
  }, [query]);

  const initialize = async (params: any) => {
    let model: any = {
      id: params.id,
      shareMemberId: params.shareMemberId,
      checkinSettingId: params.checkinSettingId
    };
    if (params.scene) {
      const sceneData = await sceneWxQRCode(params.scene);
      model.id = sceneData.id;
      model.shareMemberId = sceneData.shareMemberId;
    }
    setQuery(model);
  };
  const sceneWxQRCode = async scene => {
    const res = await api.sceneWxQRCode({ scene });
    const data = res.data.data;
    return data;
  };

  // useDidShow(() => {
  //   let _params = JSON.parse(JSON.stringify(params));
  //   if (_params.scene && !_params.id) {
  //     _params.id = _params.scene;
  //     delete _params.scene;
  //   }
  //   setQuery(_params);
  //   console.log('query', params, _params);
  //   courseGet(_params.id);
  // });

  // usePullDownRefresh(() => {
  //   courseGet(query.id);
  //   Taro.eventCenter.trigger('commentPage');
  // });

  // useShareAppMessage(() => {
  //   return withShare({
  //     title: detail.title,
  //     imageUrl: IMG_HOST + detail.iconUrl,
  //     path: `/pagesCoWebs/course/detail/index?id=${detail.id}`
  //   });
  // });

  const courseGet = async params => {
    const res = await api.courseGet(params);
    const data = res.data.data;
    setDetail(data);
    setPageLoading(false);
    util.setNavigationBarTitle(data.title);
    Taro.stopPullDownRefresh();
  };

  const activityPay = async () => {
    setBtnLoading(true);
    try {
      let payRes = await api.activityPay({
        orderId: detail.sign.id,
        orderType: 3,
        mchType: 3
      });
      let payData = payRes.data.data;
      let params = {
        timeStamp: payData.timeStamp,
        nonceStr: payData.nonceString,
        package: payData.pack,
        signType: payData.signType,
        paySign: payData.paySign
      };
      requestPayment(params);
    } catch (err) {
      setBtnLoading(false);
    }
  };
  const requestPayment = async (params: any) => {
    try {
      await api.requestPayment(params);
      setBtnLoading(false);
      let url = `/pagesCoWebs/course/success/index`;
      Taro.navigateTo({
        url
      });
    } catch (err) {
      console.log(err);
      setBtnLoading(false);
      Taro.showToast({
        title: '取消支付',
        icon: 'none'
      });
    }
  };

  const signUp = (e: any) => {
    checkVisitor(e).then(() => {
      if (detail.signScope == 'all') {
        Taro.navigateTo({
          url: `/pagesCoWebs/course/join/index?${util.toQueryString(query)}`
        });
      } else {
        checkAuthorize({
          success: () => {
            Taro.navigateTo({
              url: `/pagesCoWebs/course/join/index?${util.toQueryString(query)}`
            });
          }
        });
      }
    });
  };

  const generatePoster = async () => {
    setPosterVisible(true);
    const memberInfo = Taro.getStorageSync('memberInfo') || {};
    console.log('memberInfo', memberInfo);
    if (!memberInfo.headImage && (!memberInfo.name || !memberInfo.appellation)) {
      const { userInfo } = (await Taro.getUserInfo()) as any;
      console.log('getUserInfo', userInfo);
      memberInfo.headImage = userInfo.avatarUrl;
      memberInfo.name = userInfo.nickName;
    }
    const bgUrl: string = '/attachments/null/f1e6239e63434a65950ddb464aac4bd7.png';
    try {
      let _weappName = weappName;
      if (!_weappName) {
        const resName = await api.getName();
        _weappName = resName.data.message;
        setWeappName(_weappName);
      }
      let _QRCodeUrl = QRCodeUrl;
      if (!_QRCodeUrl) {
        const res = await api.getWxQRCode({ sourceId: detail.id, name: 'course' });
        _QRCodeUrl = res.data.message;
        setQRCodeUrl(_QRCodeUrl);
      }

      setTemplate(new DrawImageData().palette(memberInfo, bgUrl, _QRCodeUrl, detail, _weappName));
    } catch (err) {
      setPosterVisible(false);
    }
  };

  const handleImgOK = (e: any) => {
    console.warn('handleImgOK', e);
    setPosterUrl(e.detail.path);
    setPosterLoading(false);
  };

  const savePoster = async () => {
    util.showLoading(true, '生成图片中');
    setPosterLoading(true);
    try {
      await Taro.saveImageToPhotosAlbum({
        filePath: posterUrl
      });
      util.showToast('已保存到本地');
      setPosterLoading(false);
    } catch (err) {
      setPosterLoading(false);
      console.log(err);
      Taro.hideLoading();
      if (/saveImageToPhotosAlbum/.test(err.errMsg)) util.checkAuthorizeWritePhotosAlbum();
      else {
        util.showToast('取消保存，可重试');
      }
    }
  };
  const shareCourse = async () => {
    setShareVisible(true)
    const res = await api.postSharecourse(query.id)
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

  return (
    <ThemeView>
      {detail.iconUrl && (
        <CanvasShareImg
          imgUrl={IMG_HOST + detail.iconUrl}
          onGetImg={(img: string) => {
            console.log('onGetImg', img);
            setImageUrl(img);
          }}
        />
      )}

      <View className='detail'>
        <LoadingBox visible={pageLoading} />
        <View className='relative'>
          <View className='cover-wrap'>
            {detail.iconUrl && <Image src={IMG_HOST + detail.iconUrl} mode='widthFix' />}
          </View>

          <View className='title-wrap'>
            <View className='title'>{detail.title}</View>
            {detail.courseTagList && detail.courseTagList.length > 0 && (
              <View className='tags'>
                {detail.courseTagList.map((tag: any) => {
                  return (
                    <Text className='tag' key={tag.id}>
                      {tag.name}
                    </Text>
                  );
                })}
              </View>
            )}
            <View className='desc-wrap'>
              <View className='price-wrap'>
                <Text>学费：</Text>
                {detail.openPrepayment ? (
                  <Text className='price'>{detail.price}</Text>
                ) : (
                    <Text className='price'>{util.filterPrice(detail.advanceCharge)}</Text>
                  )}
              </View>
              <View className='time-wrap'>
                <Text>学制：</Text>
                <Text className='time'>{detail.educationalSystem}</Text>
              </View>
            </View>
          </View>
          {detail.isShowSignMembers && (
            <View>
              <View className='grey-line' />
              <View className='items'>
                <View
                  className='item'
                  hoverClass='hover-white-color'
                  onClick={() => {
                    Taro.navigateTo({
                      url: `/pagesCoWebs/course/sign/index?id=${detail.id}&signNum=${detail.signNum}`
                    });
                  }}>
                  <View className='label'>
                    <Text className='qc-icon-fensi qcfont' />
                    <Text>已报名({detail.signNum})</Text>
                  </View>
                  <View className='right'>
                    <View className='sign-list'>
                      {detail.imageList &&
                        detail.imageList.length &&
                        detail.imageList.map((item: any) => {
                          return (
                            <View key={item} className='head-wrap'>
                              <Image src={item} mode='widthFix' />
                            </View>
                          );
                        })}
                    </View>
                    <View className='qc-icon-chevron-right qcfont' />
                  </View>
                </View>
              </View>
            </View>
          )}
          <View className='grey-line' />
          <ContentWrap title='课程详情' content={detail.content} />
        </View>

        {detail.isEnableComment && (
          <CommentWrap
            sourceId={query.id}
            sourceType={4}
            isEnableCommentAudit={detail.isEnableCommentAudit}
            refresh={() => courseGet(query.id)}
          />
        )}

        <LogoWrap bottom={110} />

        <BottomBar
          showPraise={false}
          showComment={detail.isEnableComment}
          isPoster={true}
          onShare={shareCourse}
          onComment={() => Taro.eventCenter.trigger('handleComment')}>
          {detail.sign && detail.sign.status == 1 ? (
            <Button style={{ width: Taro.pxTransform(280) }} className='sign-btn disabled'>
              审核中
            </Button>
          ) : detail.sign &&
            detail.sign.status == 4 &&
            (detail.payWay == 'online' || detail.payWay == '' || detail.payWay == undefined) ? (
                <Button
                  style={{ width: Taro.pxTransform(280) }}
                  className='sign-btn pay'
                  hoverClass='hover-button'
                  onClick={activityPay}
                  loading={btnLoading}>
                  微信支付
                </Button>
              ) : detail.sign && detail.sign.status == 6 ? (
                <Button
                  style={{ width: Taro.pxTransform(280) }}
                  className='sign-btn'
                // onClick={signUp}
                >
                  报名成功
                </Button>
              ) : (
                  <Button
                    style={{ width: Taro.pxTransform(280) }}
                    className='sign-btn'
                    hoverClass='hover-button'
                    openType='getUserInfo'
                    onGetUserInfo={signUp}
                    loading={btnLoading}>
                    我要报名
                  </Button>
                )}
        </BottomBar>

        {/* 分享组件 */}
        <ShareWrap visible={shareVisible} onClose={() => setShareVisible(false)} onPoster={() => generatePoster()} />

        {/* 海报弹窗 */}
        <Dialog visible={posterVisible} position='center' onClose={() => setPosterVisible(false)}>
          <View className='poster-dialog'>
            <View className='poster-wrap'>{posterUrl && <Image src={posterUrl} mode='widthFix' />}</View>
            <Button type='primary' onClick={savePoster} loading={posterLoading}>
              {posterLoading ? '生成海报中...' : '保存到手机'}
            </Button>
          </View>
        </Dialog>

        <painter palette={template} onImgOK={handleImgOK} style='position:fixed;top:-9999rpx' />
      </View>
    </ThemeView>
  );
}

ActivityDetail.config = {
  navigationBarTitleText: '课程详情',
  enablePullDownRefresh: true,
  usingComponents: {
    painter: '../../../components/Painter/painter'
  }
};
