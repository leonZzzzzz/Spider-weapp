import { View, Image, Text, Button, Swiper, SwiperItem } from '@tarojs/components';
import Taro, { useState, useEffect, useShareAppMessage, useDidShow, usePullDownRefresh } from '@tarojs/taro';
import api from '@/api/index';
import util from '@/utils/util';
import withShare from '@/utils/withShare';
import { IMG_HOST } from '@/config';
import {
  LogoWrap,
  LoadingBox,
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
import { useDispatch } from '@tarojs/redux';
import { sharerInitUser } from '@/store/actions/sharer';
import { distributerInitUser } from '@/store/actions/distributer';

import DrawImageData from './json';
import DrawImagetwo from './jsontwo';

export default function ActivityDetail() {
  const dispatch = useDispatch();
  const [pageLoading, setPageLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const [matchTime, setMatchTime] = useState(0);
  const [shareVisible, setShareVisible] = useState(false);
  const [posterVisible, setPosterVisible] = useState(false);
  const [posterLoading, setPosterLoading] = useState(true);
  const [posterUrl, setPosterUrl] = useState('');
  const [direction, setDirection] = useState('left');
  const [posterTwo, setPosterTwo] = useState('');
  const [template, setTemplate] = useState<any>({});
  const [templatetwo, setTemplatetwo] = useState<any>({});
  const [QRCodeUrl, setQRCodeUrl] = useState('');
  const [weappName, setWeappName] = useState('');
  const [qrcodeData, setQrcodeData] = useState<any>({});
  const [imageUrl, setImageUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [sharer, setSharer] = useState<any>({});
  const [distributer, setDistributer] = useState<any>({});
  const [query, setQuery] = useState<any>({});

  useEffect(() => {
    Taro.hideShareMenu();
    initialize(this.$router.params);
  }, []);

  useDidShow(() => {
    if (query.id) activityGet(query);
    Taro.removeStorageSync('activityshare')
  });

  usePullDownRefresh(() => {
    activityGet(query);
    if (detail.isEnableComment) Taro.eventCenter.trigger('commentPage');
  });

  useShareAppMessage(() => {
    const path = `/pagesCoWebs/activity/detail/index?id=${detail.id}${
      isOpen && (sharer.isSharer || distributer.isDistributer) ? `&bindScene=${qrcodeData.scene}` : ''
      }`;
    return withShare({
      title: detail.title,
      // imageUrl: IMG_HOST + detail.iconUrl,
      imageUrl,
      path
    });
  });

  useEffect(() => {
    console.log('useEffect query', query);
    if (query.id) activityGet(query);
  }, [query]);

  const initialize = async (params: any) => {
    console.log('initialize params', params);
    let model: any = {
      id: params.id,
      shareMemberId: params.shareMemberId,
      checkinSettingId: params.checkinSettingId,
      type: params.type || ''
    };
    if (params.channelCodeId) {
      model.channelCodeId = params.channelCodeId
    }
    if (params.scene) {
      const sceneData = await sceneWxQRCode(params.scene);
      model.id = sceneData.id;
      model.shareMemberId = sceneData.shareMemberId;
    }
    setQuery(model);
    if (params.bindScene) distributerScanBind(params.bindScene);
  };
  const sceneWxQRCode = async scene => {
    const res = await api.sceneWxQRCode({ scene });
    const data = res.data.data;
    return data;
  };

  // 绑定
  const distributerScanBind = async (scene: any) => {
    const res = await api.distributerScanBind({ scene });
    const data = res.data.data;
    console.log('扫码绑定---------distributerScanBind', data);
  };

  const activityGet = async (params: any) => {
    const res = await api.activityGet(params);
    const data = res.data.data;
    if (data.isEnableFee) {
      if (data.activityFee.price > 0) {
        data.activityFee.price = parseFloat(data.activityFee.price / 100).toFixed(2)
      }
    }
    setDetail(data);
    getMatchTime(data);
    setPageLoading(false);
    util.setNavigationBarTitle(data.title);
    Taro.stopPullDownRefresh();

    const statusRes = await api.abilityIsOpenShareActivity();
    setIsOpen(statusRes.data.data || false);

    if (statusRes.data.data) {
      console.log('query.type', query.type);
      if (query.type === 'distributer') distributerGet();
      else sharerGet();
    }
  };

  // 推广者
  const sharerGet = async () => {
    try {
      const res = await api.sharerGet();
      const data = res.data.data;
      if (data.isSharer) {
        dispatch(sharerInitUser(data));
        const resSummary = await api.sharerSummary();
        const summary = resSummary.data.data;
        setSharer({ ...data, ...summary });
      }
    } catch (err) {
      console.log('sharerGet', err);
    }
    setPageLoading(false);
  };
  // 销售者
  const distributerGet = async () => {
    try {
      const res = await api.distributerGet();
      const data = res.data.data;
      if (data.isDistributer) {
        dispatch(distributerInitUser(data));
        const resSummary = await api.distributerSummary();
        const summary = resSummary.data.data;
        // summary.currentCommission = 100;
        setDistributer({ ...data, ...summary });
      }
    } catch (err) {
      console.log('sharerGet', err);
    }
    setPageLoading(false);
  };

  const getMatchTime = (detail: any) => {
    let startTime = detail.activitySignSetting.signStartTime.replace(/-/g, '/');
    let endTime = detail.activitySignSetting.signEndTime.replace(/-/g, '/');
    let time = 0;
    if (new Date(startTime) > new Date()) {
      // 活动未开始
      console.log('活动状态=======>未开始');
      time = 0;
    } else if (new Date(endTime) < new Date()) {
      // 活动已结束
      console.log('活动状态=======>已结束');
      time = 1;
    } else {
      // 可以报名
      console.log('活动状态=======>进行中');
      time = 2;
    }
    setMatchTime(time);
  };

  const cacelTip = () => {
    Taro.showModal({
      title: '提示',
      content: '是否取消本次报名？'
    }).then(res => {
      if (res.confirm) {
        activityCancel();
      }
    });
  };
  const activityCancel = async () => {
    setBtnLoading(true);
    try {
      console.log('activityCancel', detail.sign.id);
      await api.activitySignCancel({ id: detail.sign.id });
      Taro.showToast({
        title: '取消成功',
        icon: 'none'
      });
      activityGet(query);
      setBtnLoading(false);
    } catch (err) {
      setBtnLoading(false);
    }
  };

  const activityPay = async () => {
    // setBtnLoading(true);
    if (detail.activitySignSetting.signScope == 'all') {
      console.log(query)
      Taro.navigateTo({
        url: `/pagesCoWebs/activity/join/index?${util.toQueryString(query)}`
      });
    } else {
      checkAuthorize({
        success: () => {
          Taro.navigateTo({
            url: `/pagesCoWebs/activity/join/index?${util.toQueryString(query)}`
          });
        }
      });
    }

    // try {
    //   let payRes = await api.activityPay({
    //     orderId: detail.sign.id,
    //     orderType: 2,
    //     mchType: 3
    //   });
    //   let payData = payRes.data.data;
    //   let params = {
    //     timeStamp: payData.timeStamp,
    //     nonceStr: payData.nonceString,
    //     package: payData.pack,
    //     signType: payData.signType,
    //     paySign: payData.paySign
    //   };
    //   requestPayment(params);
    // } catch (err) {
    //   setBtnLoading(false);
    // }
  };
  const requestPayment = async (params: any) => {
    try {
      await api.requestPayment(params);
      setBtnLoading(false);
      let url = `/pagesCoWebs/activity/success/index`;
      Taro.navigateTo({
        url
      });
    } catch (err) {
      setBtnLoading(false);
      Taro.showToast({
        title: '取消支付',
        icon: 'none'
      });
    }
  };

  const signUp = (e: any) => {
    checkVisitor(e).then(() => {
      if (detail.activitySignSetting.signScope == 'all') {
        Taro.navigateTo({
          url: `/pagesCoWebs/activity/join/index?${util.toQueryString(query)}`
        });
      } else {
        checkAuthorize({
          success: () => {
            Taro.navigateTo({
              url: `/pagesCoWebs/activity/join/index?${util.toQueryString(query)}`
            });
          }
        });
      }
    });
  };

  const generatePoster = async () => {
    getSharePoint(detail.id)
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
        const res = await api.getWxQRCode({ sourceId: detail.id, name: 'activityDetail' });
        _QRCodeUrl = res.data.message;
        setQRCodeUrl(_QRCodeUrl);
      }
      setTemplate(new DrawImageData().palette(memberInfo, bgUrl, _QRCodeUrl, detail, _weappName));
      if (detail.enableSharePosterBackground) {
        setTemplatetwo(new DrawImagetwo().palette(memberInfo, detail.sharePosterBackground, _QRCodeUrl));
      }
    } catch (err) {
      setPosterVisible(false);
    }
  };
  const handleImgOK = (e: any) => {
    console.log('handleImgOK', e);
    setPosterUrl(e.detail.path);
    setPosterLoading(false);
  };
  const handleImgTwo = (e: any) => {
    console.log('handleImgTwo', e);
    setPosterTwo(e.detail.path);
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
  const twoPoster = async () => {
    util.showLoading(true, '生成图片中');
    setPosterLoading(true);
    try {
      await Taro.saveImageToPhotosAlbum({
        filePath: posterTwo
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

  const qrcodeGetActivity = async (
    activityId: string,
    showStyle: number = 1,
    apiStr: string = 'sharerQrcodeGetActivity'
  ) => {
    const res = await api[apiStr]({ activityId, showStyle, page: 'pagesPromotion/transfer/index' });
    return res.data.data;
  };

  const getShareMessage = async () => {
    if (isOpen && (sharer.isSharer || distributer.isDistributer)) {
      util.showLoading(true);
      if (!qrcodeData || !qrcodeData.scene) {
        const _qrcodeData = await qrcodeGetActivity(
          detail.id,
          detail.showStyle,
          query.type === 'distributer' ? 'distributerQrcodeGetActivity' : 'sharerQrcodeGetActivity'
        );
        console.log('qrcodeData ------', qrcodeData);
        setQrcodeData(_qrcodeData);
      }
      // getSharePoint(detail.id)
      Taro.setStorageSync('activityshare', { type: 'activity', id: detail.id })
      setShareVisible(true);
      util.showLoading(false);
    } else {
      setShareVisible(true);
    }
  };
  // 分享获取积分
  const getSharePoint = async (id) => {
    var params = { id }
    const res = await api.getSharePoint(params)
    if (res.data.code == 20000) {
      if (res.data.data >= 0) {
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
  };
  const onScrolltoupper = (e) => {
    console.log(e)
    setDirection(e.detail.direction)
  }
  const onScrolltolower = (e) => {
    console.log(e)
    setDirection(e.detail.direction)
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

          <View className='title'>{detail.title}</View>
          <View className='tags-read'>
            {detail.activityTagList && detail.activityTagList.length > 0 && (
              <View className='tags'>
                {detail.activityTagList.map((tag: any) => {
                  return (
                    <Text className='tag' key={tag.id}>
                      {tag.name}
                    </Text>
                  );
                })}
              </View>
            )}
            <View className='price price1' style='color:red'>
              {detail.isEnableFee ? (
                <Block>
                  {detail.activityFee.price > 0 && (<Text>￥{detail.activityFee.price} </Text>)}
                  {(detail.activityFee.price > 0 && detail.activityFee.point > 0) && (<text>|</text>)}
                  {detail.activityFee.point > 0 && (<Text> {detail.activityFee.point}积分</Text>)}
                </Block>
              ) : (
                  <Text>免费</Text>
                )}
            </View>
            {detail.activitySignSetting.isShowSignMembers && (
              <View className='num'>
                <Text>{detail.activitySignSetting.signNum || 0}</Text>人已报名
              </View>
            )}
          </View>

          <View className='items mb-20'>
            {detail.activitySignSetting.isShowSignMembers && (
              <View
                className='item'
                hoverClass='hover-white-color'
                onClick={() => {
                  if (detail.activitySignSetting.isShowSignMembers) {
                    Taro.navigateTo({
                      url: `/pagesCoWebs/activity/sign/index?id=${detail.id}&signNum=${detail.activitySignSetting.signNum}&maxNum=${detail.activitySignSetting.maxNum}`
                    });
                  }
                }}>
                <View className='label'>
                  <Text className='qc-icon-fensi qcfont' />
                  <Text>
                    已报名({detail.activitySignSetting.signNum}/
                    {detail.activitySignSetting.maxNum ? detail.activitySignSetting.maxNum : '不限制'})
                  </Text>
                </View>
                <View className='right'>
                  <View className='sign-list'>
                    {detail.activitySignSetting.imageList &&
                      detail.activitySignSetting.imageList.length &&
                      detail.activitySignSetting.imageList.map((item: any) => {
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
            )}
            <View className='item'>
              <View className='label'>
                <Text className='qc-icon-shijian2 qcfont' />
                <Text>{detail.startTimeStr + ' - ' + detail.endTimeStr}</Text>
              </View>
            </View>
            {detail.address && (
              <View className='item'>
                <View className='label'>
                  <Text className='qc-icon-didian3 qcfont' />
                  <Text>{detail.address}</Text>
                </View>
              </View>
            )}
          </View>
          <ContentWrap title='活动介绍' content={detail.content} />
        </View>

        {detail.isEnableComment && (
          <CommentWrap
            sourceId={query.id}
            sourceType={1}
            isEnableCommentAudit={detail.isEnableCommentAudit}
            refresh={() => activityGet(query)}
          />
        )}

        <LogoWrap bottom={110} />

        <BottomBar
          showPraise={false}
          showComment={detail.isEnableComment}
          isPoster={true}
          onShare={getShareMessage}
          onComment={() => Taro.eventCenter.trigger('handleComment')}>
          {detail.sign && detail.sign.firstCheckinTime ? (
            <Button
              style={{ width: detail.isEnableComment ? Taro.pxTransform(280) : Taro.pxTransform(380) }}
              className='sign-btn'>
              已签到
            </Button>
          ) : matchTime === 0 ? (
            <Button
              style={{ width: detail.isEnableComment ? Taro.pxTransform(280) : Taro.pxTransform(380) }}
              className='sign-btn disabled'>
              报名未开始
            </Button>
          ) : matchTime === 1 ? (
            <Button
              style={{ width: detail.isEnableComment ? Taro.pxTransform(280) : Taro.pxTransform(380) }}
              className='sign-btn disabled'>
              报名已截止
            </Button>
          ) : detail.sign && detail.sign.status == 1 ? (
            <Button
              style={{ width: detail.isEnableComment ? Taro.pxTransform(280) : Taro.pxTransform(380) }}
              className='sign-btn disabled'>
              审核中
            </Button>
          ) : detail.sign &&
            detail.sign.status == 4 &&
            (detail.payWay == 'online' || detail.payWay == '' || detail.payWay == undefined) ? (
                      <Button
                        style={{ width: detail.isEnableComment ? Taro.pxTransform(280) : Taro.pxTransform(380) }}
                        className='sign-btn pay'
                        hoverClass='hover-button'
                        onClick={activityPay}
                        loading={btnLoading}>
                        支付
                      </Button>
                    ) : detail.activitySignSetting && detail.activitySignSetting.isEnableUnsign && detail.sign ? (
                      <Button
                        style={{ width: detail.isEnableComment ? Taro.pxTransform(280) : Taro.pxTransform(380) }}
                        className='sign-btn'
                        hoverClass='hover-button'
                        loading={btnLoading}
                        onClick={cacelTip}>
                        取消报名
                      </Button>
                    ) : (detail.sign && detail.sign.status == 6) ||
                      (detail.sign && detail.sign.status == 4 && detail.payWay == 'offline') ? (
                          <Button
                            style={{ width: detail.isEnableComment ? Taro.pxTransform(280) : Taro.pxTransform(380) }}
                            className='sign-btn'
                          // onClick={signUp}
                          >
                            报名成功
                          </Button>
                        ) : detail.isEnableFee ? (
                          <Button
                            style={{ width: detail.isEnableComment ? Taro.pxTransform(280) : Taro.pxTransform(380) }}
                            className='sign-btn'
                            hoverClass='hover-button'
                            openType='getUserInfo'
                            onGetUserInfo={signUp}
                            loading={btnLoading}>
                            {detail.activitySignSetting.signTips || '我要报名'}
                          </Button>
                        ) : (
                            <Button
                              style={{ width: detail.isEnableComment ? Taro.pxTransform(280) : Taro.pxTransform(380) }}
                              className='sign-btn'
                              hoverClass='hover-button'
                              openType='getUserInfo'
                              onGetUserInfo={signUp}
                              loading={btnLoading}>
                              {detail.activitySignSetting.signTips || '我要报名'}
                            </Button>
                          )}
        </BottomBar>

        {/* 分享组件 */}
        <ShareWrap visible={shareVisible} onClose={() => setShareVisible(false)} onPoster={() => generatePoster()} />
        {/* <ShareWrap
          visible={shareVisible}
          onClose={() => setShareVisible(false)}
          onPoster={() => {
            if (isOpen && (sharer.isSharer || distributer.isDistributer)) {
              util.navigateTo(
                `/pagesPromotion/${query.type || 'sharer'}/sales-poster/index?id=${detail.id}&showStyle=${
                detail.showStyle
                }&title=${detail.title}&iconUrl=${detail.iconUrl}`
              );
              getSharePoint(detail.id)
            } else {
              generatePoster();
            }
          }}
        /> */}

        {/* 海报弹窗 */}
        <Dialog visible={posterVisible} position='center' onClose={() => setPosterVisible(false)}>
          <View className='poster-dialog' style={detail.enableSharePosterBackground ? 'width:690rpx' : 'width:650rpx'}>
            {detail.enableSharePosterBackground ? (
              <Block>
                <ScrollView className='tabs-scroll-wrap' scrollX onScrolltoupper={onScrolltoupper} onScrolltolower={onScrolltolower}>
                  <View className='scroll-item' style='margin-right:30rpx;'>
                    <View className='poster-wrap'>{posterTwo && <Image src={posterTwo} mode='widthFix' />}</View>
                    {/* <Button type='primary' onClick={direction == 'left' ? twoPoster : savePoster} loading={posterLoading}>
                    {posterLoading ? '生成海报中...' : '保存到手机'}
                  </Button> */}
                  </View>
                  <View className='scroll-item'>
                    <View className='poster-wrap'>{posterUrl && <Image src={posterUrl} mode='widthFix' />}</View>
                    {/* <Button type='primary' onClick={savePoster} loading={posterLoading}>
                    {posterLoading ? '生成海报中...' : '保存到手机'}
                  </Button> */}
                  </View>
                </ScrollView>
                <Button type='primary' onClick={direction == 'left' ? twoPoster : savePoster} loading={posterLoading}>
                  {posterLoading ? '生成海报中...' : '保存到手机'}
                </Button>
              </Block>
            ) : (
                <Block>
                  <View className='poster-wrap'>{posterUrl && <Image src={posterUrl} mode='widthFix' />}</View>
                  <Button type='primary' onClick={savePoster} loading={posterLoading}>
                    {posterLoading ? '生成海报中...' : '保存到手机'}
                  </Button>
                </Block>
              )}
          </View>
        </Dialog>

        <painter palette={template} onImgOK={handleImgOK} style='position:fixed;top:-9999rpx' />
        {detail.enableSharePosterBackground && (
          <painter palette={templatetwo} onImgOK={handleImgTwo} style='position:fixed;top:-9999rpx' />
        )}

      </View>
    </ThemeView>
  );
}

ActivityDetail.config = {
  navigationBarTitleText: '活动详情',
  enablePullDownRefresh: true,
  usingComponents: {
    painter: '../../../components/Painter/painter'
  }
};
