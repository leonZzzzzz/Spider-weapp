import { IMG_HOST } from '@/config';

export default class DrawImageData {
  palette(bgUrl: string, QRCodeUrl: string, options: any, weappName: string, titleConfig: any) {
    const config: any = {
      width: '750rpx',
      height: '1088rpx',
      background: '#ff5433',
      views: [
        // 背景图
        {
          type: 'image',
          url: `${IMG_HOST}${bgUrl}`,
          css: {
            bottom: '0rpx',
            left: '0rpx',
            width: '750rpx',
            height: '1088rpx'
          }
        },

        // 标题
        {
          id: 'title_id',
          type: 'text',
          text: options.title,
          css: [
            {
              top: `100rpx`,
              left: '100rpx',
              width: '550rpx',
              fontSize: '44rpx',
              // fontWeight: 'bold',
              color: '#000',
              lineHeight: '66rpx',
              maxLines: 3
            }
          ]
        },
        {
          type: 'image',
          url: `${IMG_HOST}/attachments/images/left-single.png`,
          css: [
            {
              top: `90rpx`,
              left: '56rpx',
              width: '40rpx',
              height: '40rpx'
            }
          ]
        },
        {
          type: 'image',
          url: `${IMG_HOST}/attachments/images/right-single.png`,
          css: [
            {
              top: ['28rpx', 'title_id'],
              left: `${titleConfig.widthLength === 0 ? 640 : titleConfig.widthLength + 110}rpx`,
              width: '40rpx',
              height: '40rpx'
            }
          ]
        },
        {
          type: 'text',
          text: options.createTime.substr(0, 10),
          css: [
            {
              top: ['110rpx', 'title_id'],
              left: '100rpx',
              width: '550rpx',
              fontSize: '30rpx',
              color: 'rgb(160, 164, 171)'
            }
          ]
        },
        {
          type: 'text',
          text: options.info,
          css: [
            {
              // top: '430rpx',
              top: ['190rpx', 'title_id'],
              left: '100rpx',
              width: '550rpx',
              fontSize: '32rpx',
              color: 'rgb(116, 123, 134)',
              lineHeight: '50rpx',
              maxLines: titleConfig.lines === 3 ? 7 : titleConfig.lines === 2 ? 8 : 9
            }
          ]
        },

        {
          type: 'rect',
          css: {
            bottom: '100rpx',
            left: '100rpx',
            width: '200rpx',
            height: '200rpx',
            color: '#fff',
            borderRadius: '200rpx'
          }
        },
        {
          type: 'image',
          url: `${IMG_HOST}${QRCodeUrl}`,
          css: {
            bottom: '110rpx',
            left: '110rpx',
            width: '180rpx',
            height: '180rpx'
          }
        },
        {
          type: 'text',
          text: `长按识别小程序码查看`,
          css: {
            bottom: '200rpx',
            left: '330rpx',
            fontSize: '24rpx',
            color: 'rgb(160, 164, 171)'
          }
        },
        {
          type: 'text',
          text: `— 来自`,
          id: 'prev',
          css: {
            bottom: '150rpx',
            left: '330rpx',
            fontSize: '24rpx',
            color: 'rgb(160, 164, 171)'
          }
        },
        {
          type: 'text',
          text: `${weappName}`,
          id: 'name',
          css: {
            bottom: '150rpx',
            left: '414rpx',
            fontSize: '24rpx',
            color: 'rgb(0, 82, 218)'
          }
        },
        {
          type: 'text',
          text: ` —`,
          css: {
            bottom: '150rpx',
            left: ['418rpx', 'name'],
            fontSize: '24rpx',
            color: 'rgb(160, 164, 171)'
          }
        }
      ]
    };
    return config;
  }
}
