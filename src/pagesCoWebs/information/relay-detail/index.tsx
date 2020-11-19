import Taro, { useState, useEffect, useRouter, useShareAppMessage, usePullDownRefresh } from '@tarojs/taro';
import { View, Text, Button, Form, Image } from '@tarojs/components';
import { IMG_HOST, APPID } from '@/config';
import { Avatar, LoadingBox, AuthorizeWrap, ShareWrap, LogoWrap, BottomBar, CommentWrap } from '@/components/common';
import { AlumniSidebar } from '@/components/cowebs';
import api from '@/api/cowebs';
import withShare from '@/utils/withShare';
import { checkAuthorize, checkVisitor } from '@/utils/authorize';
import './index.scss';
import { useTheme } from '@/useHooks/useFlywheel';

export default function Detail() {
  const [pageLoading, setPageLoading] = useState(true);
  const [authorizeVisible, setAuthorizeVisible] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const [matchTime, setMatchTime] = useState(0);
  const [sourceData, setSourceData] = useState<any>({});
  const [shareVisible, setShareVisible] = useState(false);
  const [model, setModel] = useState<any>({
    id: '',
    sign: {
      entryType: 3,
      sourceId: '',
      num: 1,
      price: 0
    }
  });
  const [signLoading, setSignLoading] = useState(false);
  const theme = useTheme();
  const router: any = useRouter();
  const { id } = router.params;
  const path = router.path;

  useShareAppMessage(() => {
    shareInsert();
    return withShare({
      title: '资源对接',
      path: `/pagesCoWebs/information/relay-detail/index?id=${id}`
    });
  });

  useEffect(() => {
    Taro.hideShareMenu();
    sourceDataGet();
  }, []);

  usePullDownRefresh(() => {
    sourceDataGet();
    Taro.eventCenter.trigger('commentPage');
  });

  const shareInsert = async () => {
    await api.shareInsert({ sourceId: id, url: path });
    sourceDataGet('shareInsert');
  };

  const sourceDataGet = async (type?: string) => {
    const res = await api.informationGet({ id });
    const data = res.data.data;
    setSourceData(data);
    console.log('isAudit', data.isAudit);
    if (type !== 'shareInsert') {
      if (!detail.id) {
        getDetail(data.sourceId);
        model.id = data.sourceId;
        model.sign.sourceId = data.sourceId;
        setModel(model);
      } else {
        Taro.stopPullDownRefresh();
      }
      if (!data.isAudit) {
        unAuditedTip();
      }
    }
  };

  const getDetail = async (sourceId: string) => {
    const res = await api.activityGet({ id: sourceId });
    let data = res.data.data;
    data.startTime = data.startTime.slice(0, 16);
    data.endTime = data.endTime.slice(0, 16);
    checkMatchTime(data);
    setDetail(data);
    setPageLoading(false);
    Taro.stopPullDownRefresh();
  };

  const checkMatchTime = (data: any) => {
    const startTime = data.activitySignSetting.signStartTime.replace(/\-/g, '/');
    const endTime = data.activitySignSetting.signEndTime.replace(/\-/g, '/');
    console.log('startTime = ', startTime);
    console.log('endTime = ', endTime);
    if (new Date(startTime) > new Date()) {
      console.log('活动状态=======>未开始');
      setMatchTime(0);
    } else if (new Date(endTime) < new Date()) {
      console.log('活动状态=======>已结束');
      setMatchTime(1);
    } else {
      console.log('活动状态=======>进行中');
      setMatchTime(2);
    }
  };

  const unAuditedTip = () => {
    Taro.showModal({
      title: '提示',
      content: '未审核的接龙活动不可转发、留言、点赞、报名。',
      showCancel: false,
      confirmText: '知道了'
    });
  };

  const navigateTo = e => {
    checkVisitor(e).then(() => {
      checkAuthorize({
        success: () => {
          if (Taro.getStorageSync('releaseValue') === 1) {
            navigateToMiniProgram('/pagesCoWebs/information/relay/index');
            return;
          }
          Taro.navigateTo({
            url: `/pagesCoWebs/information/relay/index`
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

  const handleSignUp = (e: any) => {
    if (!sourceData.isAudit) {
      unAuditedTip();
      return;
    }
    checkVisitor(e).then(() => {
      checkAuthorize({
        success: () => {
          activitySign(model);
        }
      });
    });
  };
  const activitySign = async (params: any) => {
    Taro.showLoading({
      title: '正在报名',
      mask: true
    });
    setSignLoading(true);
    await api.activitySignOld(params);
    Taro.showToast({
      title: '报名成功'
    });
    setSignLoading(false);
    // sourceDataGet
    getDetail(sourceData.sourceId);
  };

  const handlePraise = (wxMiniFormId: string) => {
    if (!sourceData.isAudit) {
      unAuditedTip();
      return;
    }
    let type = ``;
    if (sourceData.isPraise) {
      // 取消点赞
      type = `praiseDelete`;
      sourceData.isPraise = false;
    } else {
      // 点赞
      type = `praiseInsert`;
      sourceData.isPraise = true;
    }
    setSourceData(sourceData);
    apiPraise(type, wxMiniFormId);
  };

  const apiPraise = async (type: string, wxMiniFormId: string) => {
    await api[type]({ sourceId: sourceData.id, wxMiniFormId });
    console.log('点赞功能 请求到数据了');
    sourceDataGet();
  };

  // 预览轮播列表的大图
  const previewImage = (index: number) => {
    let list = detail.iconUrl.split(',').map((img: string) => IMG_HOST + img);
    let current = list[index];
    Taro.previewImage({
      current,
      urls: list
    });
  };

  return (
    <View className='relay-detail' style={theme}>
      <LoadingBox visible={pageLoading} />
      <View className='relative'>
        <View className='category'>#{sourceData.category}#</View>
        <View
          className='member-box'
          onClick={() =>
            Taro.navigateTo({ url: `/pagesCoWebs/contacts/detail/index?memberId=${sourceData.memberId}` })
          }>
          <Avatar imgUrl={detail.headImage} width={80} />
          <View className='user__info'>
            <View className='name'>
              <Text>{sourceData.username}</Text>
              {sourceData.className && (
                <Text className='class'>
                  {/-\/-/.test(sourceData.className)
                    ? sourceData.className.replace('-/-', '-')
                    : sourceData.className || '无'}
                </Text>
              )}
            </View>
            <View className='time'>{sourceData.createTimeStr}</View>
          </View>
        </View>

        <View className='content-box'>
          <View className='title'>{detail.title}</View>
          <View className='content'>{detail.info}</View>
          {detail.iconUrl && (
            <View className='img-box'>
              {detail.iconUrl.split(',').map((img: string, idx: number) => {
                return <Image src={IMG_HOST + img} key={img} mode='widthFix' onClick={() => previewImage(idx)} />;
              })}
            </View>
          )}
        </View>

        <View className='items'>
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
          <View
            className='item'
            onClick={() => {
              if (detail.activitySignSetting.isShowSignMembers) {
                Taro.navigateTo({
                  url: `/pagesCoWebs/information/relay-sign/index?id=${detail.id}&signNum=${detail.activitySignSetting.signNum}&maxNum=${detail.activitySignSetting.maxNum}`
                });
              }
            }}>
            <View className='label'>
              <Text className='qc-icon-fensi qcfont' />
              <Text>
                已接龙用户({detail.activitySignSetting.signNum}/{detail.activitySignSetting.maxNum})
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
        </View>

        <View className='mini-box'>
          <View />
          <View className='icon-group'>
            <View className='i-item'>
              <Text className='qcfont qc-icon-zhuanfa' />
              <Text>{sourceData.shareQuantity}</Text>
            </View>
            <View className='i-item'>
              <Text className='qcfont qc-icon-liuyan-fill' />
              <Text>{sourceData.commentQuantity}</Text>
            </View>
            <View className='i-item'>
              <Text className='qcfont qc-icon-yulan' />
              <Text>{sourceData.visitQuantity}</Text>
            </View>
          </View>
        </View>
      </View>

      {detail.isEnableComment && <CommentWrap sourceId={id} sourceType={2} refresh={() => sourceDataGet()} />}

      <BottomBar
        isAudit={sourceData.isAudit}
        onTip={unAuditedTip}
        onComment={() => Taro.eventCenter.trigger('handleComment')}
        praiseQuantity={sourceData.praiseQuantity}
        isPraise={sourceData.isPraise}
        onPraise={handlePraise}>
        <View className='sign-up-btn'>
          <Form>
            {matchTime === 0 ? (
              <Button disabled className='disabled'>
                未开始
              </Button>
            ) : matchTime === 1 ? (
              <Button disabled className='disabled'>
                报名已截止
              </Button>
            ) : detail.sign && detail.sign.status == 6 ? (
              <Button type='primary' hoverClass='none'>
                报名成功
              </Button>
            ) : (
              <Button
                openType='getUserInfo'
                onGetUserInfo={handleSignUp}
                className='sign-btn'
                hoverClass='hover-color-primary'
                loading={signLoading}>
                我要接龙
              </Button>
            )}
          </Form>
        </View>
      </BottomBar>

      <LogoWrap bottom={110} />

      {/* 分享组件 */}
      <ShareWrap
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        options={detail}
        params={{ id: id }}
        apiStr='createGroupShoppingPoster'
        onAuthorize={() => setAuthorizeVisible(false)}
      />

      <AuthorizeWrap visible={authorizeVisible} onHide={() => setAuthorizeVisible(false)} isClose={true} />

      {/* <AlumniSidebar position="top" headImage={detail.headImage} /> */}

      <View className='back-box'>
        <Button openType='getUserInfo' onGetUserInfo={navigateTo} className='qcfont qc-icon-jia1'></Button>
      </View>
    </View>
  );
}

Detail.config = {
  navigationBarTitleText: '资源对接',
  enablePullDownRefresh: true
};
