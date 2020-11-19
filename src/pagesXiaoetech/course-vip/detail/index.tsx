import { View, Image, Text, Button } from '@tarojs/components';
import Taro, { useState, useEffect, useShareAppMessage, useDidShow, usePullDownRefresh, login } from '@tarojs/taro';
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
  Dialog,
  CanvasShareImg,
  CodeModel
} from '@/components/common';
import './index.scss';

import DrawImageData from './json';
import { getMemberInfo } from '@/api/common';

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
  const [imageUrl, setImageUrl] = useState('');
  const [code, setCode] = useState(false);
  const [codeImg, setCodeImg] = useState('');

  const [query, setQuery] = useState<any>({});

  useEffect(() => {
    initialize(this.$router.params);
    setCodeImg(IMG_HOST + `/attachments/null/9d0d52219ee94ec8a3aa229e3d563902.png`);
  }, []);

  useDidShow(() => {
    console.log('useDidShow');
    if (query.id) courseVipGet(query);
  });


  usePullDownRefresh(() => {
    courseVipGet(query);
    if (detail.isEnableComment) Taro.eventCenter.trigger('commentPage');
  });

  useShareAppMessage(() => {
    return withShare({
      title: detail.name,
      // imageUrl: IMG_HOST + detail.iconUrl,
      imageUrl,
      path: `/pagesXiaoetech/course-vip/detail/index?id=${query.id}`
    });
  });

  useEffect(() => {
    console.log('useEffect query', query);
    if (query.id) courseVipGet(query);
  }, [query]);

  const initialize = async (params: any) => {
    let model: any = {
      id: params.id
      // shareMemberId: params.shareMemberId,
      // checkinSettingId: params.checkinSettingId
    };
    if (params.scene) {
      const sceneData = await sceneWxQRCode(params.scene);
      model.id = sceneData.id;
      // model.shareMemberId = sceneData.shareMemberId;
    }
    setQuery(model);
    if (params.bindScene) distributerScanBind(query.bindScene);
  };
  const sceneWxQRCode = async (scene: string) => {
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

  const courseVipGet = async (params: any) => {
    const res = await api.courseVipGet(params);
    const data = res.data.data;
    const memberInfo = Taro.getStorageSync('memberInfo') || {};
    if (memberInfo.unionId) {
      data.expireAt = await goodsQueryPurchase(params.id);
    }
    // var urlindex = data.icon.indexOf('.com/')
    // var posterurl = data.icon.substr((urlindex + 4))
    data.showStyle = 1
    // data.posterurl = posterurl
    setDetail(data);
    setPageLoading(false);
    util.setNavigationBarTitle(data.name);
    Taro.stopPullDownRefresh();
  };

  const goodsQueryPurchase = async (courseVipId: string) => {
    const res = await api.goodsQueryPurchase({ courseVipId });
    const data = res.data.data || {};
    return data.expireAt;
  };

  const signUp = e => {
    const memberInfo = Taro.getStorageSync('memberInfo') || {};
    if (e.detail.userInfo && !memberInfo.unionId) {
      Taro.login().then(c => {
        const {
          userInfo: { avatarUrl, nickName },
          encryptedData,
          iv
        } = e.detail;
        api
          .memberLogin({
            code: c.code,
            appellation: nickName,
            headImage: avatarUrl,
            encryptedData,
            iv
          })
          .then(() => {
            getMemberInfo().then(res => {
              Taro.setStorageSync('memberInfo', res.data.data);
              courseVipOrderInsert();
            });
          });
      });
    } else {
      courseVipOrderInsert();
    }
  };

  const courseVipOrderInsert = async () => {
    const res = await api.courseVipOrderInsert({ courseVipId: query.id });
    const data = res.data.data;
    courseVipOrderPay(data.id);
  };

  const courseVipOrderPay = async (orderId: string) => {
    try {
      const res = await api.courseVipOrderPay({ orderId, merchantType: 3 });
      const data = res.data.data;
      let payParams = {
        timeStamp: data.timeStamp,
        nonceStr: data.nonceString,
        package: data.pack,
        signType: data.signType,
        paySign: data.paySign
      };
      requestPayment(payParams);
    } catch (err) {
      setBtnLoading(false);
    }
  };

  const requestPayment = async (params: any) => {
    try {
      await api.requestPayment(params);
      Taro.showToast({
        title: '支付成功',
        icon: 'none'
      });
      setBtnLoading(false);
      setTimeout(() => {
        Taro.navigateTo({ url: `/pagesXiaoetech/course-vip/success/index?id=${query.id}` });
      }, 1000);
    } catch (err) {
      console.log(err);
      setBtnLoading(false);
      Taro.showToast({
        title: '取消支付',
        icon: 'none'
      });
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
    try {
      let _QRCodeUrl = QRCodeUrl;
      if (!_QRCodeUrl) {
        const res = await api.sharerQrcodeGetCourseVip({ activityId: detail.id, showStyle: 1 });
        console.log(res.data);
        _QRCodeUrl = res.data.data.url;
        setQRCodeUrl(_QRCodeUrl);
      }
      console.log('_QRCodeUrl ===========', _QRCodeUrl);
      setTemplate(new DrawImageData().palette(detail, memberInfo, _QRCodeUrl));
    } catch (err) {
      setPosterVisible(false);
    }
  };

  // 获取二维码
  const getQcCode = async () => {
    const res = await api.sharerQrcodeGetCourseVip({ activityId: detail.id, showStyle: 1 });
    console.log(res.data);
    let _QRCodeUrl = res.data.data.url;
    setQRCodeUrl(_QRCodeUrl);
  }

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
      if (/saveImageToPhotosAlbum/.test(err.errMsg)) util.checkAuthorizeWritePhotosAlbum();
      else {
        Taro.showToast({
          title: '取消保存，可重试',
          icon: 'none'
        });
      }
    }
  };
  const saveCode1 = async () => {
    Taro.showLoading({
      title: '生成图片中',
      mask: true
    });
    setBtnLoading(true);
    try {
      const res = await Taro.saveImageToPhotosAlbum({
        filePath: codeImg
      });
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
  const saveCode = e => {
    //下载图片
    let imgPath1 = codeImg;
    let that = this;
    Taro.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          //没有授权
          Taro.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              downloadImgToAlbum(imgPath1);
            },
            fail() {
              that.setState({
                //显示授权层
                openSetting: true
              });
            }
          });
        } else {
          //已授权
          downloadImgToAlbum(imgPath1);
        }
      }
    });
  };

  const downloadImgToAlbum = imgPath1 => {
    Taro.showToast({
      title: '正在保存，请稍等',
      icon: 'none',
      duration: 2000
    });
    //下载图片
    downloadHttpImg(imgPath1).then(res => {
      sharePosteCanvas(res);
    });
  };

  const downloadHttpImg = httpImg => {
    return new Promise((resolve, reject) => {
      Taro.downloadFile({
        url: httpImg,
        success: res => {
          if (res.statusCode === 200) {
            resolve(res.tempFilePath);
          } else {
            Taro.showToast({
              title: '图片下载失败！',
              icon: 'none',
              duration: 1000
            });
          }
        },
        fail: res => {
          Taro.showToast({
            title: '提示图片下载失败！',
            icon: 'none',
            duration: 1000
          });
        }
      });
    });
  };

  const sharePosteCanvas = imgUrl => {
    Taro.saveImageToPhotosAlbum({
      filePath: imgUrl,
      success(res) {
        Taro.showToast({
          title: '图片已保存到相册',
          icon: 'none',
          duration: 1000
        });
      },
      fail(err) {
        Taro.showToast({
          title: '图片保存失败',
          icon: 'none',
          duration: 1000
        });
      }
    });
  };

  return (
    <ThemeView>
      {/* {code && (
        <View className='code-model'>
          <View
            className='code-track'
            onClick={() => {
              setCode(false);
            }}></View>
          <View className='code-content'>
            <View className='code-ma'>
              <Image src={IMG_HOST + `/attachments/null/9d0d52219ee94ec8a3aa229e3d563902.png`}></Image>
              <Text>扫码上方二维码即可学习</Text>
            </View>
            <View className='phonealb'>
              <Text onClick={saveCode}>保存二维码至相册</Text>
            </View>
          </View>
        </View>
      )} */}
      <CodeModel code={code} onCode={() => { setCode(false) }} saveposter={saveCode}></CodeModel>
      {detail.icon && (
        <CanvasShareImg
          imgUrl={/http/.test(detail.icon) ? detail.icon : IMG_HOST + detail.icon}
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
            {detail.icon && (
              <Image src={/http/.test(detail.icon) ? detail.icon : IMG_HOST + detail.icon} mode='widthFix' />
            )}
            {/* <View className='cover-tag'>会员</View> */}
          </View>

          <View className='title-wrap'>
            <View className='title'>{detail.name}</View>
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
              {detail.summary && <View className='head-desc'>{detail.summary}</View>}
              {detail.subscribed && <View className='subscriber'>{detail.subscribed}人订阅</View>}
              <View className='valid-days'>
                有效期：
                {
                  {
                    '7': '7天',
                    '15': '15天',
                    '31': '1个月',
                    '92': '3个月',
                    '183': '半年',
                    '366': '1年',
                    '731': '2年',
                    '1827': '5年'
                  }[detail.validDays]
                }
              </View>
            </View>
          </View>

          {detail.expireAt && (
            <View className='purchase-wrap'>
              <View>
                <Text>会员有效期</Text>
                <Text className='time'>{detail.expireAt.substr(0, 10)}</Text>
              </View>
              <Button className='xu' onClick={signUp}>
                续费会员
              </Button>
            </View>
          )}

          {/* <View className='grey-line' /> */}
          <ContentWrap title='详情' content={detail.content} />
        </View>

        <LogoWrap bottom={110} />

        <BottomBar
          showPraise={false}
          showComment={false}
          isPoster={true}
          // showShare={false}
          onShare={() => { setShareVisible(true); getQcCode() }}
          onComment={() => Taro.eventCenter.trigger('handleComment')}>
          {!detail.expireAt ? (
            <Button
              style={{ width: Taro.pxTransform(450) }}
              className='sign-btn'
              hoverClass='hover-button'
              openType='getUserInfo'
              onGetUserInfo={signUp}
              loading={btnLoading}>
              开通会员{util.filterPrice(detail.price)}
            </Button>
          ) : (
              <Button
                style={{ width: Taro.pxTransform(450) }}
                className='sign-btn'
                hoverClass='hover-button'
                onClick={async () => {
                  setCode(true);
                }}>
                立刻学习
              </Button>
            )}
        </BottomBar>

        {/* 分享组件 */}
        {/* <ShareWrap visible={shareVisible} onClose={() => setShareVisible(false)} onPoster={() => generatePoster()} /> */}
        <ShareWrap visible={shareVisible} onClose={() => setShareVisible(false)}
          onPoster={() => {
            // console.log(memberInfo：头像昵称, bgUrlData：背景, qrcodeData：二维码, title：标题, iconUrl: 图片)
            // if (isOpen && (sharer.isSharer || distributer.isDistributer)) {
            util.navigateTo(
              `../save-poster/index?id=${detail.id}&showStyle=${
              detail.showStyle
              }&title=${detail.name}&iconUrl=${detail.icon}&_QRCodeUrl=${QRCodeUrl}`
            );
            // } else {
            //   generatePoster();
            // }
          }}
        />

        {/* 海报弹窗 */}
        <Dialog visible={posterVisible} position='center' onClose={() => setPosterVisible(false)}>
          <View className='poster-dialog'>
            <View className='poster-wrap'>
              <painter palette={template} onImgOK={handleImgOK} />
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

ActivityDetail.config = {
  navigationBarTitleText: '课程详情',
  enablePullDownRefresh: true,
  usingComponents: {
    painter: '../../../components/Painter/painter'
  }
};
