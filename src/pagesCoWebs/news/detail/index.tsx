import { View, Text, Image, Button, Canvas } from '@tarojs/components';
import Taro, { useState, useEffect, useShareAppMessage, useReachBottom, usePullDownRefresh } from '@tarojs/taro';
import api from '@/api/index';
import util from '@/utils/util';
import withShare from '@/utils/withShare';
import { IMG_HOST } from '@/config';
import {
  LoadingBox,
  ContentWrap,
  LogoWrap,
  BottomBar,
  AuthorizeWrap,
  ThemeView,
  CommentWrap,
  ShareWrap,
  Dialog,
  CanvasShareImg
} from '@/components/common';
import './index.scss';

import DrawImageData from './json';

export default function Detail() {
  const [authorizeVisible, setAuthorizeVisible] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [detail, setDetail] = useState<any>({});
  const [shareVisible, setShareVisible] = useState(false);
  const [posterVisible, setPosterVisible] = useState(false);
  const [posterLoading, setPosterLoading] = useState(true);
  const [posterUrl, setPosterUrl] = useState('');
  const [template, setTemplate] = useState<any>({});
  const [QRCodeUrl, setQRCodeUrl] = useState('');
  const [weappName, setWeappName] = useState('');
  const [timeType, setTimeType] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [point, setPoint] = useState('');
  const [id, setId] = useState('');
  const [query, setQuery] = useState<any>({});

  useEffect(() => {
    initialize(this.$router.params);
    setId(this.$router.params.id)
    // readPoint(this.$router.params);
  }, []);

  useEffect(() => {
    console.log('useEffect query', query);
    if (query.id) singleContentGet(query);
  }, [query]);

  const initialize = async (params: any) => {
    let model: any = {
      id: params.id
    };
    if (params.channelCodeId) {
      model.channelCodeId = params.channelCodeId
    }
    if (params.scene) {
      const sceneData = await sceneWxQRCode(params.scene);
      model.id = sceneData.id;
    }
    setQuery(model);
  };

  const sceneWxQRCode = async scene => {
    const res = await api.sceneWxQRCode({ scene });
    const data = res.data.data;
    return data;
  };
  const readPoint = async () => {
    const res = await api.readPoint(id)
    let point = res.data.data.readPoint
    let alreadyRead = res.data.data.alreadyRead
    setPoint(point)
    if (!alreadyRead) {
      if (point > 0) {
        Taro.showToast({
          title: `+${point}积分`,
          icon: 'none'
        })
      }
    }
  }
  useReachBottom(() => {
    readPoint()
  });

  useShareAppMessage(() => {
    shareInsert();
    return withShare({
      title: detail.title,
      // imageUrl: IMG_HOST + detail.iconUrl,
      imageUrl,
      path: `/pagesCoWebs/news/detail/index?id=${query.id}`
    });
  });

  usePullDownRefresh(() => {
    singleContentGet(query);
    Taro.eventCenter.trigger('commentPage');
  });

  const singleContentGet = async (params: any) => {
    const res = await api.singleContentGet(params);
    const data = res.data.data;
    data.createTimeStr = util.formatDateStr(data.createTime);
    setDetail(data);
    setPageLoading(false);
    util.setNavigationBarTitle(res.data.data.title);
    Taro.stopPullDownRefresh();
  };

  const shareInsert = async () => {
    const res = await api.shareInsert({ sourceId: query.id, sourceType: 3, url: 'pagesCoWebs/news/detail/index' });
    if (res.data.data) singleContentGet(query);
  };


  const handlePraise = (wxMiniFormId: string) => {
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
    await api[type]({ sourceId: detail.id, wxMiniFormId, sourceType: 3 });
    console.log('点赞功能 请求到数据了');
    singleContentGet(query);
  };

  const generatePoster = async () => {
    setPosterVisible(true);
    try {
      const bgUrl: string = '/attachments/images/news-poster-bg.png';
      let _weappName = weappName;
      if (!_weappName) {
        const resName = await api.getName();
        _weappName = resName.data.message;
        setWeappName(_weappName);
      }
      let _QRCodeUrl = QRCodeUrl;
      if (!_QRCodeUrl) {
        const res = await api.getWxQRCode({ sourceId: detail.id, name: 'singleContent' });
        _QRCodeUrl = res.data.message;
        setQRCodeUrl(_QRCodeUrl);
      }

      const config = canvasTitle();
      setTemplate(new DrawImageData().palette(bgUrl, _QRCodeUrl, detail, _weappName, config));
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

  const canvasTitle = () => {
    let screenK = Taro.getSystemInfoSync().screenWidth / 750;
    const ctx = Taro.createCanvasContext('title');
    const fontSize = Math.round(44 * screenK);
    ctx.setFontSize(fontSize);
    let widthLength = 0;
    let lines = 1;
    const titleArray = detail.title.split('');
    for (let i = 0; i < titleArray.length; i++) {
      // title.split('').map(text => {
      let text = titleArray[i];
      const textWidth = ctx.measureText(text).width;
      widthLength += textWidth;
      if (lines === 3 && 550 * screenK - widthLength < ctx.measureText(`...`).width) {
        widthLength = 0;
        break;
      }
      if (550 * screenK - widthLength < fontSize) {
        widthLength = 0;
        lines += 1;
      }
    }
    // console.log('widthLength lines', widthLength, lines);
    return {
      widthLength: widthLength / screenK,
      lines: lines > 3 ? 3 : lines
    };
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
          <View className='title-wrap'>
            <View className='title'>{detail.title}</View>
            <View className='desc'>
              {detail.author && <View className='time'>{detail.author}</View>}
              {detail.platform && <View className='platform'>{detail.platform}</View>}
              {detail.createTime && (
                <View className='time' onClick={() => setTimeType(e => !e)}>
                  {timeType ? detail.createTimeStr : detail.createTime.substr(0, 10)}
                </View>
              )}
            </View>
          </View>
          <ContentWrap content={detail.content} />

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
            sourceId={detail.id}
            sourceType={3}
            isEnableCommentAudit={detail.isEnableCommentAudit}
            refresh={() => singleContentGet(query)}
          />
        )}

        <LogoWrap bottom={110} />

        <BottomBar
          showComment={detail.isEnableComment}
          onComment={() => Taro.eventCenter.trigger('handleComment')}
          praiseQuantity={detail.praiseQuantity}
          isPraise={detail.isPraise}
          onPraise={handlePraise}
          isPoster={true}
          onShare={() => setShareVisible(true)}
        />

        <AuthorizeWrap visible={authorizeVisible} onHide={() => setAuthorizeVisible(false)} isClose={true} />
      </View>

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

      <Canvas
        canvasId='title'
        style={{ width: '500px', height: '400px', position: 'fixed', zIndex: -999, top: '-9999px' }}></Canvas>
    </ThemeView>
  );
}

Detail.config = {
  navigationBarTitleText: '新闻详情',
  enablePullDownRefresh: true,
  usingComponents: {
    painter: '../../../components/Painter/painter'
  }
};
