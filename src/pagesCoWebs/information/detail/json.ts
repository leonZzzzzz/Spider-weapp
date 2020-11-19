import { IMG_HOST } from '@/config'

export default class DrawImageData {
  palette(options: any, QRCodeData?: any) {
    console.log('DrawImageData')
    let config: any = {
      width: '630rpx',
      height: '1000rpx',
      background: '#ff5433',
      views: [
        // 背景图
        {
          type: 'image',
          url: IMG_HOST + '/attachments/images/zx_bg.png',
          css: {
            bottom: '0rpx',
            left: '0rpx',
            width: '630rpx',
            height: '1008rpx',
          },
        },
        // 框
        {
          type: 'image',
          url: IMG_HOST + '/attachments/images/zx_kuang.png',
          css: {
            top: '160rpx',
            left: '30rpx',
            width: '570rpx',
            height: '520rpx',
          },
        },
        // 分类
        {
          type: 'text',
          text: `# ${options.category} #`,
          css: {
            top: `80rpx`,
            left: '0rpx',
            width: '630rpx',
            fontSize: '36rpx',
            color: 'rgb(5,99, 154)',
            textAlign: 'center',
          },
        },
        // 头像
        {
          type: 'image',
          url: options.headImage || IMG_HOST + '/attachments/images/head-image.png',
          css: {
            top: '200rpx',
            left: '60rpx',
            width: '80rpx',
            height: '80rpx',
            borderRadius: '80rpx',
          },
        },
        // 用户名
        {
          type: 'text',
          text: options.username,
          css: {
            top: '210rpx',
            left: '160rpx',
            fontSize : '28rpx',
            color: '#000',
          },
        },
        // 创建时间
        {
          type: 'text',
          text: options.createTime.substring(0, options.createTime.length - 3),
          css: {
            top: '250rpx',
            left: '160rpx',
            fontSize : '24rpx',
            color: '#a0a0a0',
          },
        },
        // 内容
        {
          type: 'text',
          text: `#${options.category}#${options.content.replace(/[\r\n]/g,"")}`,
          css: {
            width: '510rpx',
            top: '310rpx',
            left: '60rpx',
            maxLines: !options.imgUrl ? 5 : 2,
            fontSize: '28rpx',
            lineHeight: '22px',
          },
        },
        // 图片
        ..._imgList(options.imgUrl),
        // 底部半透明色块
        {
          type: 'rect',
          css: {
            bottom: '0rpx',
            left: '0rpx',
            width: '630rpx',
            height: '180rpx',
            color: 'rgba(255,255,255,0.5)',
          },
        },
        // 色块内容
        {
          type: 'text',
          text: `长按识别小程序码，查看内容`,
          css: {
            bottom: '100rpx',
            left: '30rpx',
            fontSize: '24rpx',
          },
        },
        // 色块内容
        {
          type: 'text',
          text: `分享图来自“${QRCodeData.name}”小程序`,
          css: {
            bottom: '60rpx',
            left: '30rpx',
            fontSize: '24rpx',
            color: "rgb(100,100,100)"
          },
        },
        // 小程序码底色圆形
        {
          type: 'rect',
          css: {
            bottom: '10rpx',
            right: '20rpx',
            width: '160rpx',
            height: '160rpx',
            color: 'rgb(255,255,255)',
            borderRadius: '160rpx',
          },
        },
        // 小程序码
        {
          type: 'image',
          url: `${IMG_HOST}${QRCodeData.path}`,
          css: {
            bottom: '20rpx',
            right: '30rpx',
            width: '140rpx',
            height: '140rpx',
          },
        },
      ],
    }

    return config
  }
}


function _imgList(img: string) {
  if (!img) {
    return []
  }
  let data: any[] = []
  let imgs = img.split(',')
  if (imgs.length > 1) {
    imgs.map((res, index) => {
      if (index < 2) {
        data.push({
          type: 'image',
          url: IMG_HOST + res,
          css: {
            top: '420rpx',
            left: 60 + (220 * index) + 'rpx',
            width: '200rpx',
            height: '200rpx',
          },
        })
      }
    })
  } else {
    data.push({
      type: 'image',
      url: IMG_HOST + imgs[0],
      css: {
        top: '420rpx',
        left: '60rpx',
        width: '338rpx',
        height: '200rpx',
      },
    })
  }
  return data
}