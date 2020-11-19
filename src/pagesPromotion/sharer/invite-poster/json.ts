import { IMG_HOST } from '@/config';

export default class DrawImageData {
  palette(user: any, bgUrlData?: any, qrcodeData?: any) {
    const config: any = {
      width: '750rpx',
      height: '1200rpx',
      background: '#ff5433',
      views: [
        // 背景图
        {
          type: 'image',
          url: `${IMG_HOST}${(bgUrlData && bgUrlData.url) ? bgUrlData.url : '/attachments/null/c5d7ad20f42e4d2087dbf47cfd1aa969.png'}`,
          css: {
            bottom: '0rpx',
            left: '0rpx',
            width: '750rpx',
            height: '1200rpx'
          }
        },
        {
          type: 'rect',
          css: {
            top: '40rpx',
            left: '300rpx',
            width: '150rpx',
            height: '150rpx',
            color: '#fff',
            borderRadius: '75rpx'
          }
        },
        // 头像
        {
          type: 'image',
          url: user.headImage,
          css: {
            top: '50rpx',
            left: '310rpx',
            width: '130rpx',
            height: '130rpx',
            borderRadius: '60rpx'
          }
        },
        // 用户名
        {
          type: 'text',
          text: user.appellation ? user.appellation : '',
          css: [
            {
              top: `210rpx`,
              left: '0rpx',
              width: '750rpx',
              fontSize: '32rpx',
              fontWeight: 'bold',
              color: '#000',
              textAlign: 'center'
            }
          ]
        },
        {
          type: 'rect',
          css: {
            top: '720rpx',
            left: '265rpx',
            width: '220rpx',
            height: '220rpx',
            color: '#fff',
            borderRadius: '115rpx'
          }
        },
        {
          type: 'image',
          url: `${IMG_HOST}${qrcodeData.url}`,
          css: {
            top: '730rpx',
            left: '275rpx',
            width: '200rpx',
            height: '200rpx'
          }
        }
      ]
    };
    return config;
  }
}
