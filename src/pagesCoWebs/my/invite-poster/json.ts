import { IMG_HOST } from '@/config';
import Taro from '@tarojs/taro';
export default class DrawImageData {
  palette(user: any, tj?: any, bgPosterUrl?: string, QRCode?: string, tips?: any) {
    const auth = Taro.getStorageSync('authorize');
    // 已加入的百分数之几
    let num = (tj.bindAmount / tj.totalAmount) * 100;
    let bindNum = num === 100 ? 100 : num.toFixed(1);
    // 进度条的宽
    let progressWidth = 530;
    // 进度
    let progress = ((Number(bindNum) / 100) * progressWidth).toFixed(1);
    const config: any = {
      width: '750rpx',
      height: '1200rpx',
      background: '#ff5433',
      views: [
        // 背景图
        {
          type: 'image',
          // url: IMG_HOST + bgPosterUrl || '/attachments/images/bgPoster.png',
          url: `${IMG_HOST}${bgPosterUrl || '/attachments/images/bgPoster.png'}`,
          css: {
            bottom: '0rpx',
            left: '0rpx',
            width: '750rpx',
            height: '1200rpx'
          }
        },
        // 头像
        {
          type: 'image',
          url: user.headImage || IMG_HOST + '/attachments/images/head-image.png',
          css: {
            top: '28rpx',
            left: '315rpx',
            width: '120rpx',
            height: '120rpx',
            borderRadius: '60rpx'
          }
        },
        // 用户名
        {
          type: 'text',
          text: user.appellation ? user.appellation : '',
          css: [
            {
              top: `170rpx`,
              left: '0rpx',
              width: '750rpx',
              fontSize: '32rpx',
              color: '#000',
              textAlign: 'center'
            }
          ]
        },
        // // 进度条
        // {
        //   type: 'rect',
        //   css: [{
        //     top: `512rpx`,
        //     left: '68rpx',
        //     width: progressWidth+'rpx',
        //     height: '25rpx',
        //     color: '#deefea',
        //     borderRadius: '20rpx'
        //   }],
        // },

        // // 进度
        // {
        //   type: 'rect',
        //   css: [{
        //     top: `512rpx`,
        //     left: '68rpx',
        //     width: progress+'rpx',
        //     height: '25rpx',
        //     color: '#ff965f',
        //     borderRadius: '20rpx'
        //   }],
        // },

        // // 百分数框
        // {
        //   type: 'rect',
        //   css: [{
        //     top: `452rpx`,
        //     left: Number(progress) + 20 +'rpx',
        //     width: '95rpx',
        //     height: '38rpx',
        //     color: '#ff965f',
        //     borderRadius: '4rpx'
        //   }]
        // },
        // {
        //   type: 'rect',
        //   css: [{
        //     top: `478rpx`,
        //     left: Number(progress) + 56 +'rpx',
        //     width: '20rpx',
        //     height: '20rpx',
        //     color: '#ff965f',
        //     borderRadius: '4rpx',
        //     rotate: 45,
        //   }]
        // },
        // // 百分数
        // {
        //   type: 'text',
        //   text: bindNum.toString()+'%',
        //   css: [{
        //     top: `454rpx`,
        //     left: Number(progress) + 20 +'rpx',
        //     width: '95rpx',
        //     fontSize: '28rpx',
        //     color: '#fff',
        //     textAlign: 'center',
        //   }],
        // },
        // _iconText(tj.totalAmount.toString(), '510rpx', '610rpx',  26, '#222222'),

        // _iconText(`已有`, '686rpx', '190rpx', 30, '#425780', 'id_3'),
        // _iconText(tj.bindAmount.toString(), '686rpx', ['194rpx', 'id_3'], 30, '#de4c00', 'id_4'),
        // _iconText(`人已在本系统登录`, '686rpx', ['256rpx', 'id_4'], 30, '#425780'),
        {
          type: 'rect',
          css: {
            top: '754rpx',
            left: '268rpx',
            width: '214rpx',
            height: '214rpx',
            color: '#fff'
          }
        },
        {
          type: 'image',
          url: `${IMG_HOST}${QRCode}`,
          css: {
            top: '754rpx',
            left: '268rpx',
            width: '214rpx',
            height: '214rpx'
          }
        }
      ]
    };
    if ((!auth.isNeedAudit && !auth.openRegister) || !auth.openRegister) {
      const list = [
        // 进度条
        {
          type: 'rect',
          css: [
            {
              top: `512rpx`,
              left: '68rpx',
              width: progressWidth + 'rpx',
              height: '25rpx',
              color: '#deefea',
              borderRadius: '20rpx'
            }
          ]
        },

        // 进度
        {
          type: 'rect',
          css: [
            {
              top: `512rpx`,
              left: '68rpx',
              width: progress + 'rpx',
              height: '25rpx',
              color: '#ff965f',
              borderRadius: '20rpx'
            }
          ]
        },

        // 百分数框
        {
          type: 'rect',
          css: [
            {
              top: `452rpx`,
              left: Number(progress) + 20 + 'rpx',
              width: '95rpx',
              height: '38rpx',
              color: '#ff965f',
              borderRadius: '4rpx'
            }
          ]
        },
        {
          type: 'rect',
          css: [
            {
              top: `478rpx`,
              left: Number(progress) + 56 + 'rpx',
              width: '20rpx',
              height: '20rpx',
              color: '#ff965f',
              borderRadius: '4rpx',
              rotate: 45
            }
          ]
        },
        // 百分数
        {
          type: 'text',
          text: bindNum.toString() + '%',
          css: [
            {
              top: `454rpx`,
              left: Number(progress) + 20 + 'rpx',
              width: '95rpx',
              fontSize: '28rpx',
              color: '#fff',
              textAlign: 'center'
            }
          ]
        },
        _iconText(tj.totalAmount.toString(), '510rpx', '610rpx', 26, '#222222')
      ];
      config.views.push(...list);
      console.log('--------------------', config.views);
    }
    if (tips) {
      if (tips.tip1) {
        let tip = tips.tip1.replace('%s', tj.totalAmount);
        config.views.push(_iconText(`${tip}`, '637rpx', '50rpx', 30, '#425780', '650rpx', 'center'));
      }
      if (tips.tip2) {
        let tip = tips.tip2.replace('%s', tj.bindAmount);
        config.views.push(_iconText(`${tip}`, '686rpx', '50rpx', 30, '#425780', '650rpx', 'center'));
      }
    }

    return config;
  }
}

function _iconText(
  text: string,
  top: string,
  left: string | any[],
  size: number,
  color: string,
  width?: string,
  textAlign?: string,
  id?: string
) {
  return {
    id,
    type: 'text',
    text,
    css: {
      top,
      left,
      width,
      fontSize: size + 'rpx',
      color,
      textAlign
    }
  };
}
