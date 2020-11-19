import { IMG_HOST } from '@/config'

export default class DrawImageData {
  palette(user: any, bgUrlData: any, qrcodeData: any, activity: any) {

    const config: any = ({
      width: '750rpx',
      height: '1200rpx',
      background: '#ff5433',
      views: [
        // 背景图
        {
          type: 'image',
          url: `${IMG_HOST}${bgUrlData.url}`,
          css: {
            bottom: '0rpx',
            left: '0rpx',
            width: '750rpx',
            height: '1200rpx',
          },
        },
        {
          type: 'rect',
          css: {
            top: '35rpx',
            left: '300rpx',
            width: '150rpx',
            height: '150rpx',
            color: '#fff',
            borderRadius: '75rpx',
          }
        },
        // 头像
        {
          type: 'image',
          url: user.headImage,
          css: {
            top: '45rpx',
            left: '310rpx',
            width: '130rpx',
            height: '130rpx',
            borderRadius: '60rpx',
          },
        },
        // 用户名
        { 
          type: 'text',
          text: `${user.appellation || ''} 邀请你一起参加`,
          css: [{
            top: `200rpx`,
            left: '0rpx',
            width: '750rpx',
            fontSize: '32rpx',
            color: '#000',
            textAlign: 'center',
          }],
        },
        // 活动标题
        {
          type: 'text',
          text: activity.title,
          css: [{
            top: `280rpx`,
            left: '100rpx',
            width: '550rpx',
            fontSize: '36rpx',
            color: '#000',
            textAlign: 'center',
            lineHeight: '40rpx',
            maxLines: 2,
          }],
        },
        // 活动图片
        {
          type: 'image',
          url: `${IMG_HOST}${activity.iconUrl}`,
          css: {
            top: '380rpx',
            left: '100rpx',
            width: '550rpx',
            height: '320rpx',
          },
        },
        {
          type: 'rect',
          css: {
            top: '770rpx',
            left: '275rpx',
            width: '200rpx',
            height: '200rpx',
            color: '#fff'
          }
        },
        {
          type: 'image',
          url: `${IMG_HOST}${qrcodeData.url}`,
          css: {
            top: '770rpx',
            left: '275rpx',
            width: '200rpx',
            height: '200rpx',
          },
        },
      ],
    });
    return config
  }
}
