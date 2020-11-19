import { IMG_HOST } from '@/config';

export default class DrawImageData {
  palette(user: any, bgurlTwo: string, QRCodeUrl: string) {
    const config: any = {
      width: '750rpx',
      height: '1200rpx',
      background: '#ff5433',
      views: [
        // 背景图
        {
          type: 'image',
          url: `${IMG_HOST}${bgurlTwo}`,
          css: {
            bottom: '0rpx',
            left: '0rpx',
            width: '750rpx',
            height: '1200rpx'
          }
        },
        // {
        //   type: 'rect',
        //   css: {
        //     top: '35rpx',
        //     left: '300rpx',
        //     width: '150rpx',
        //     height: '150rpx',
        //     color: '#fff',
        //     borderRadius: '75rpx'
        //   }
        // },
        // 头像
        {
          type: 'image',
          url: user.headImage,
          css: {
            top: '45rpx',
            left: '45rpx',
            width: '120rpx',
            height: '120rpx'
            // borderRadius: '60rpx'
          }
        },
        // 用户名
        {
          type: 'text',
          text: `${user.name || user.appellation} `,
          css: [
            {
              top: `50rpx`,
              left: '195rpx',
              width: '350rpx',
              fontSize: '32rpx',
              color: '#000',
              textAlign: 'left'
            }
          ]
        },
        // 活动标题
        // {
        //   type: 'text',
        //   text: activity.title,
        //   css: [
        //     {
        //       top: `280rpx`,
        //       left: '100rpx',
        //       width: '550rpx',
        //       fontSize: '36rpx',
        //       color: '#000',
        //       textAlign: 'center',
        //       lineHeight: '40rpx',
        //       maxLines: 2
        //     }
        //   ]
        // },
        // 活动图片
        // {
        //   type: 'image',
        //   url: `${IMG_HOST}${activity.iconUrl}`,
        //   css: {
        //     top: '380rpx',
        //     left: '100rpx',
        //     width: '550rpx',
        //     height: '320rpx'
        //   }
        // },
        // {
        //   type: 'rect',
        //   css: {
        //     top: '770rpx',
        //     left: '275rpx',
        //     width: '200rpx',
        //     height: '200rpx',
        //     color: '#fff'
        //   }
        // },
        {
          type: 'image',
          url: `${IMG_HOST}${QRCodeUrl}`,
          css: {
            top: '960rpx',
            left: '510rpx',
            width: '200rpx',
            height: '200rpx'
          }
        },
        // {
        //   type: 'rect',
        //   css: {
        //     bottom: '134rpx',
        //     left: '220rpx',
        //     width: '350rpx',
        //     height: '40rpx',
        //     // color: 'rgba(0,0,0,0.5)'
        //     color: '#fff'
        //   }
        // },
        // {
        //   type: 'text',
        //   text: `— 来自${weappName} —`,
        //   css: {
        //     bottom: '140rpx',
        //     left: '100rpx',
        //     width: '550rpx',
        //     textAlign: 'center',
        //     fontSize: '24rpx',
        //     color: 'rgb(113, 113, 113)'
        //   }
        // }
      ]
    };
    return config;
  }
}
