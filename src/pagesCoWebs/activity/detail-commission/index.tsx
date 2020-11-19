import { View, Image, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useState, usePullDownRefresh, useShareAppMessage, useDidShow, useEffect } from '@tarojs/taro';
import api from '@/api/index';
import util from '@/utils/util';
import withShare from '@/utils/withShare';
import useCountDown from '@/useHooks/useCountDown';
import { checkVisitor, checkAuthorize } from '@/utils/authorize';
import { useDispatch } from '@tarojs/redux';
import { sharerInitUser } from '@/store/actions/sharer';
import { distributerInitUser } from '@/store/actions/distributer';
import { IMG_HOST } from '@/config';
import {
  LogoWrap,
  LoadingBox,
  AuthorizeWrap,
  ContentWrap,
  BottomBar,
  Avatar,
  ShareWrap,
  ThemeView,
  CanvasShareImg,
  Dialog
} from '@/components/common';
import './index.scss';

import DrawImageData from './json';

export default function ActivityDetail() {
  const dispatch = useDispatch();
  const { day, hours, minutes, seconds, setEndTime, end } = useCountDown();
  const [authorizeVisible, setAuthorizeVisible] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [detail, setDetail] = useState<any>({
    activitySignSetting: {}
  });
  const [signList, setSignList] = useState<any[]>([]);
  const [matchTime, setMatchTime] = useState(0);
  const [shareVisible, setShareVisible] = useState(false);
  const [posterVisible, setPosterVisible] = useState(false);
  const [posterLoading, setPosterLoading] = useState(true);
  const [posterUrl, setPosterUrl] = useState('');
  const [template, setTemplate] = useState<any>({});
  const [QRCodeUrl, setQRCodeUrl] = useState('');
  const [weappName, setWeappName] = useState('');
  const [qrcodeData, setQrcodeData] = useState<any>({});
  const [commentQuantity, setCommentQuantity] = useState(0);
  const [commentList, setCommentList] = useState<any[]>([]);
  const [commentBtnLoading, setCommentBtnLoading] = useState(false);
  const [visibleComment, setVisibleComment] = useState(false);
  const [visibleFocus, setVisibleFocus] = useState(false);
  const [commentModel, setCommentModel] = useState<any>({
    sourceId: '',
    sourceType: 1,
    content: '',
    parentId: '',
    placeholder: '开始您的精彩评论吧...'
  });
  const [sharer, setSharer] = useState<any>({});
  const [distributer, setDistributer] = useState<any>({});
  const [imageUrl, setImageUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const [query, setQuery] = useState<any>({});

  useEffect(() => {
    Taro.hideShareMenu();
    initialize(this.$router.params);
  }, []);

  useEffect(() => {
    console.log('-------useEffect end ------', end);
    if (end) activityGet(query);
  }, [end]);

  useDidShow(() => {
    if (query.id) activityGet(query);
  });

  usePullDownRefresh(() => {
    activityGet(query);
  });

  useShareAppMessage(() => {
    const path = `/pagesCoWebs/activity/detail-commission/index?id=${detail.id}${
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
    setQuery(model);
    if (params.bindScene) distributerScanBind(params.bindScene);
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
    setEndTime(data.endTime);
    setDetail(data);
    signMembers(data.id);
    getMatchTime(data);

    util.setNavigationBarTitle(data.title);
    Taro.stopPullDownRefresh();
    const statusRes = await api.abilityIsOpenShareActivity();
    setIsOpen(statusRes.data.data || false);
    if (statusRes.data.data) {
      console.log('query.type', query.type);
      if (query.type === 'distributer') distributerGet();
      else sharerGet();
    }
    setPageLoading(false);
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

  const signMembers = async (sourceId: string) => {
    let res = await api.activitySignMembers({ sourceId });
    const list = res.data.data.list;
    list.map((item: any) => {
      item.signDataList.map((label: any) => {
        if (label.name === '姓名') item.name = label.value;
        if (label.name === '手机') item.mobile = label.value;
      });
    });
    setSignList(list);
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
    setBtnLoading(true);
    try {
      let payRes = await api.activityPay({
        orderId: detail.sign.id,
        orderType: 2,
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
      let url = `/pagesCoWebs/activity/success/index`;
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
    let _query = JSON.parse(JSON.stringify(query));
    checkVisitor(e).then(() => {
      if (detail.activitySignSetting.signScope == 'all') {
        Taro.navigateTo({
          url: `/pagesCoWebs/activity/join/index?${util.toQueryString(_query)}&bindScene=${qrcodeData.scene}`
        });
      } else {
        checkAuthorize({
          success: () => {
            Taro.navigateTo({
              url: `/pagesCoWebs/activity/join/index?${util.toQueryString(_query)}&bindScene=${qrcodeData.scene}`
            });
          }
        });
      }
    });
  };

  const qrcodeGetActivity = async (
    activityId: string,
    showStyle: number = 1,
    apiStr: string = 'sharerQrcodeGetActivity'
  ) => {
    const res = await api[apiStr]({ activityId, showStyle, page: 'pagesPromotion/transfer/index' });
    return res.data.data;
  };

  const getComments = async (sourceId: string) => {
    const res = await api.commentPage({ sourceId });
    setCommentList(res.data.data.list);
    setCommentQuantity(res.data.data.total);
  };

  const sendComment = (e: any) => {
    if (!commentModel.content) {
      Taro.showToast({
        title: '请输入留言内容',
        icon: 'none'
      });
      return;
    }
    if (util.checkAuthorize()) {
      setAuthorizeVisible(true);
      commentModel.content = '';
      setCommentModel(commentModel);
      return;
    }
    setCommentBtnLoading(true);
    Taro.showLoading({
      title: '发送中…',
      mask: true
    });
    commentModel.wxMiniFormId = e.detail.formId;
    commentInsert(commentModel);
  };
  const commentInsert = async (params: any) => {
    try {
      const res = await api.commentInsert(params);
      console.log('commentInsert', res);
      Taro.showToast({
        title: '留言成功',
        icon: 'none'
      });
      handleComment(false);
      getComments(detail.id);
      setCommentBtnLoading(false);
      if (!params.parentId) scrollComment();
    } catch (err) {
      setCommentBtnLoading(false);
      commentModel.content = '';
      setCommentModel(commentModel);
    }
  };

  const scrollComment = () => {
    const query = Taro.createSelectorQuery();
    query.select('.comment-box').boundingClientRect();
    query.exec(res => {
      console.log('scrollComment', res[0]);
      if (res[0] && res[0].top) {
        const scrollTop = res[0].top - 10;
        Taro.pageScrollTo({
          scrollTop,
          duration: 200
        });
      }
    });
  };

  const handleComment = (state: boolean, item?: any) => {
    console.log('handleComment', state);
    if (state) {
      if (util.checkAuthorize()) {
        setAuthorizeVisible(true);
        return;
      }
      commentModel.sourceId = '';
      commentModel.parentId = '';
      commentModel.content = '';
      commentModel.placeholder = '开始您的精彩评论吧...';
      if (item && item.id) {
        commentModel.sourceId = item.sourceId;
        commentModel.parentId = item.id;
        commentModel.placeholder = `回复:${item.memberName}（不可大于64字）`;
      } else {
        commentModel.sourceId = detail.id;
      }
    }
    setVisibleComment(state);
    setCommentModel(commentModel);
    setTimeout(() => {
      setVisibleFocus(state);
    }, 100);
  };

  const handleGetUserInfo = async (e: any) => {
    if (isOpen && (sharer.isSharer || distributer.isDistributer)) {
      checkVisitor(e).then(() => {
        checkAuthorize({
          success: async () => {
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
            setShareVisible(true);
            util.showLoading(false);
          }
        });
      });
    } else {
      setShareVisible(true);
    }
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
        const res = await api.getWxQRCode({ sourceId: detail.id, name: 'activityDetail' });
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
          {isOpen &&
            (query.type === 'distributer' ? distributer.isDistributer : sharer.isSharer) &&
            (query.type === 'distributer' ? distributer.currentCommission : sharer.currentCommission) > 0 && (
              <Button
                className='float-box'
                openType='getUserInfo'
                onGetUserInfo={e => {
                  checkVisitor(e).then(() => {
                    util.navigateTo(`/pagesPromotion/${query.type || 'sharer'}/index/index`);
                  });
                }}>
                <View className='qcfont qc-icon-huoyan' />
                <View className='share-info'>
                  <View className='share-info-title'>当前奖金</View>
                  <Text className='share-info-price'>
                    ￥
                    {util.filterPrice(
                      query.type === 'distributer' ? distributer.currentCommission : sharer.currentCommission
                    )}
                  </Text>
                </View>
                <View className='qcfont qc-icon-chevron-right' />
              </Button>
            )}
          <View className='cover-wrap'>
            {detail.iconUrl && <Image src={IMG_HOST + detail.iconUrl} mode='widthFix' />}
          </View>

          <View className='title'>{detail.title}</View>
          <View className='tags-read'>
            {detail.isEnableFee ? (
              <View className='t-price'>￥{util.filterPrice(detail.activityFee.price)}</View>
            ) : (
              <View className='t-price'>免费</View>
            )}
            <View className='num'>
              <Text>{detail.visitQuantity || 0}</Text>人已阅
            </View>
          </View>

          <View className='sign-info-wrap'>
            <View className='count-down'>
              <View>距离活动结束仅剩：</View>
              <View className='time-wrap'>
                <Text className='border'>{day}</Text>
                <Text>天</Text>
                <Text className='border'>{hours}</Text>
                <Text>时</Text>
                <Text className='border'>{minutes}</Text>
                <Text>分</Text>
                <Text className='border'>{seconds}</Text>
                <Text>秒</Text>
              </View>
            </View>
            {detail.activitySignSetting.isShowSignMembers && (
              <View className='sign-avatar'>
                <View>
                  已报名(
                  <Text className='sum'>{detail.activitySignSetting.signNum}</Text>/{detail.activitySignSetting.maxNum})
                </View>
                <View className='right'>
                  <View className='sign-list'>
                    {detail.activitySignSetting.imageList &&
                      detail.activitySignSetting.imageList.length &&
                      detail.activitySignSetting.imageList.map((item: any, i: number) => {
                        return (
                          i < 8 && (
                            <View key={item} className='head-wrap'>
                              <Image src={item} mode='widthFix' />
                            </View>
                          )
                        );
                      })}
                    <View className='head-wrap'>
                      <View className='qcfont qc-icon-gengduo' />
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>

          <ContentWrap content={detail.content} />

          {detail.activitySignSetting.isShowSignMembers && signList && signList.length > 0 && (
            <View className='sign-scroll-wrap'>
              <View className='title'>
                <Text className='num'>— </Text>
                <Text>共</Text>
                <Text className='num'>{detail.activitySignSetting.signNum}</Text>
                <Text>人报名成功</Text>
                <Text className='num'> —</Text>
              </View>
              <ScrollView className='scroll-wrap' scrollY>
                {signList.map((item: any) => {
                  return (
                    <View className='item' key={item.id}>
                      <Avatar imgUrl={item.headImage} width={90} />
                      <View className='info-wrap'>
                        <View className='label'>
                          <View className='name'>{item.name}</View>
                          {/* <View className='success'>报名成功</View> */}
                        </View>
                        <View className='label'>
                          <View className='time'>{item.mobile}</View>
                          <View className='time'>{item.signTimeStr}</View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>

        <LogoWrap bottom={110} />

        <BottomBar showPraise={false} showComment={false} showShare={false} showHome={false} showMy={true}>
          {detail.sign && detail.sign.firstCheckinTime ? (
            <Button style={{ width: Taro.pxTransform(280) }} className='sign-btn'>
              已签到
            </Button>
          ) : matchTime === 0 ? (
            <Button style={{ width: Taro.pxTransform(280) }} className='sign-btn disabled'>
              报名未开始
            </Button>
          ) : matchTime === 1 ? (
            <Button style={{ width: Taro.pxTransform(280) }} className='sign-btn disabled'>
              报名已截止
            </Button>
          ) : detail.sign && detail.sign.status == 1 ? (
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
              // onClick={signUp}
              loading={btnLoading}>
              微信支付{util.filterPrice(detail.activityFee.price)}
            </Button>
          ) : detail.activitySignSetting && detail.activitySignSetting.isEnableUnsign && detail.sign ? (
            <Button
              style={{ width: Taro.pxTransform(280) }}
              className='sign-btn'
              hoverClass='hover-button'
              loading={btnLoading}
              onClick={cacelTip}>
              取消报名
            </Button>
          ) : (detail.sign && detail.sign.status == 6) ||
            (detail.sign && detail.sign.status == 4 && detail.payWay == 'offline') ? (
            <Button style={{ width: Taro.pxTransform(280) }} className='sign-btn'>
              报名成功
            </Button>
          ) : detail.isEnableFee ? (
            <Button
              style={{ width: Taro.pxTransform(280) }}
              className='sign-btn qiang flex-btn'
              hoverClass='hover-button'
              openType='getUserInfo'
              onGetUserInfo={signUp}
              loading={btnLoading}>
              <View className='qcfont qc-icon-qianggou' />
              <View className='btn-text'>
                <View>我要{isOpen ? '抢购' : '报名'}</View>
                <View>￥{util.filterPrice(detail.activityFee.price)}</View>
              </View>
            </Button>
          ) : (
            <Button
              style={{ width: Taro.pxTransform(280) }}
              className='sign-btn flex-btn'
              hoverClass='hover-button'
              openType='getUserInfo'
              onGetUserInfo={signUp}
              loading={btnLoading}>
              <View className='qcfont qc-icon-qianggou' />
              <View className='btn-text'>
                <View>我要{isOpen ? '抢购' : '报名'}</View>
                {/* <View>￥0.99</View> */}
              </View>
            </Button>
          )}

          <Button
            style={{ width: Taro.pxTransform(280) }}
            className='sign-btn yongjin flex-btn'
            openType='getUserInfo'
            onGetUserInfo={handleGetUserInfo}>
            {isOpen && (sharer.isSharer || distributer.isDistributer) && <View className='qcfont qc-icon-huoyan' />}

            {isOpen && (sharer.isSharer || distributer.isDistributer) ? (
              <View className='btn-text'>
                <View>去赚奖金</View>
                <View>
                  ￥
                  {util.filterPrice(
                    util.mul(
                      detail.activityFee
                        ? query.type === 'distributer'
                          ? detail.activityFee.distributerCommission
                          : detail.activityFee.sharerCommission
                        : 0,
                      util.chu(
                        (query.type === 'distributer' ? distributer.commissionRate : sharer.commissionRate) || 10,
                        100
                      )
                    )
                  )}
                </View>
              </View>
            ) : (
              <View className='btn-text'>分享</View>
            )}
          </Button>
        </BottomBar>

        <AuthorizeWrap visible={authorizeVisible} onHide={() => setAuthorizeVisible(false)} isClose={true} />

        {/* 分享组件 */}
        <ShareWrap
          visible={shareVisible}
          onClose={() => setShareVisible(false)}
          onPoster={() => {
            if (isOpen && (sharer.isSharer || distributer.isDistributer)) {
              util.navigateTo(
                `/pagesPromotion/${query.type || 'sharer'}/sales-poster/index?id=${detail.id}&showStyle=${
                  detail.showStyle
                }&title=${detail.title}&iconUrl=${detail.iconUrl}`
              );
            } else {
              generatePoster();
            }
          }}
        />

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
  navigationBarTitleText: '活动详情',
  enablePullDownRefresh: true,
  usingComponents: {
    painter: '../../../components/Painter/painter'
  }
};
