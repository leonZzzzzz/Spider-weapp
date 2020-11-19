import { IMG_HOST } from '@/config';
import util from '@/utils/util';

export default class DrawImageData {
  palette(options: any, organizeOrderId: string = '', memberInfo: any, QRCodeUrl: string) {
    console.log('DrawImageData');
    let config: any = {
      width: '630rpx',
      height: '1030rpx',
      background: '#fff',
      views: [
        // 头像
        {
          type: 'image',
          url: memberInfo.headImage,
          css: {
            top: '15rpx',
            left: '315rpx',
            width: '80rpx',
            height: '80rpx',
            borderRadius: '80rpx',
            align: 'center'
          }
        },
        // 用户名
        {
          type: 'text',
          text: `${memberInfo.name || memberInfo.appellation}发现好物，与你分享！`,
          css: {
            top: '110rpx',
            left: '20rpx',
            width: '590rpx',
            fontSize: '28rpx',
            color: '#b49154',
            textAlign: 'center'
          }
        },
        // 背景图
        {
          type: 'image',
          url: IMG_HOST + options.iconUrl,
          css: {
            top: '170rpx',
            left: '0rpx',
            width: '630rpx',
            height: '630rpx'
          }
        },
        // 图片底部色块
        {
          type: 'rect',
          css: {
            top: '680rpx',
            left: '0rpx',
            width: '630rpx',
            height: '120rpx',
            color: '#f8f8f8'
            // color: 'rgba(0, 0, 0, 0.7)'
          }
        },
        {
          type: 'rect',
          css: {
            top: '698rpx',
            left: '30rpx',
            width: '90rpx',
            height: '38rpx',
            borderRadius: '4rpx',
            color: 'rgb(255, 199, 65)'
          }
        },
        {
          id: 'group-text-id',
          type: 'text',
          text: `${options.groupQuantity}人团`,
          css: {
            top: '700rpx',
            left: '30rpx',
            width: '90rpx',
            fontSize: '26rpx',
            textAlign: 'center',
            color: '#fff'
          }
        },
        // 标题
        {
          type: 'text',
          text: `               ${options.name}`,
          css: {
            width: '430rpx',
            top: '695rpx',
            left: '30rpx',
            maxLines: 2,
            fontSize: '32rpx',
            lineHeight: '50rpx'
          }
        },
        {
          type: 'text',
          text: `￥${util.filterPrice(organizeOrderId ? options.groupPrice : options.groupOrganizerPrice)}`,
          css: {
            top: '695rpx',
            right: '20rpx',
            fontSize: '32rpx',
            fontWeight: 'bold',
            color: 'rgb(234, 19, 0)'
          }
        },
        {
          type: 'text',
          text: `￥${util.filterPrice(options.price)}`,
          css: {
            top: '750rpx',
            right: '20rpx',
            fontSize: '30rpx',
            color: 'rgb(153, 153, 153)',
            textDecoration: 'line-through'
          }
        },
        // 小程序码
        {
          type: 'image',
          url: `${IMG_HOST}${QRCodeUrl}`,
          css: {
            bottom: '60rpx',
            left: '315rpx',
            width: '160rpx',
            height: '160rpx',
            borderRadius: '140rpx',
            align: 'center'
          }
        }
        {
          type: 'text',
          text: '长按识别小程序码',
          css: {
            bottom: '20rpx',
            left: '0rpx',
            width: '630rpx',
            fontSize: '28rpx',
            color: 'rgb(113, 113, 113)',
            textAlign: 'center'
          }
        },
      ]
    };

    return config;
  }
}
