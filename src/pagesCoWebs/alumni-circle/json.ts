import { IMG_HOST } from '@/config'

export default class DrawImageData {
  palette(options: any, textWidthList: any[], QRCode?: string) {
    console.log('DrawImageData')
    let config: any = {
      width: '630rpx',
      height: '1000rpx',
      background: '#ff5433',
      views: [
        // 背景图
        {
          type: 'image',
          url: IMG_HOST + options.img,
          css: {
            bottom: '0rpx',
            left: '0rpx',
            width: '630rpx',
            height: '1000rpx',
          },
        },
        // 信息框
        {
          type: 'rect',
          css: [{
            top: `610rpx`,
            left: '0rpx',
            width: '530rpx',
            height: '310rpx',
            color: 'rgba(0, 0, 0, 0.7)',
          }],
        },
        // 用户名
        {
          type: 'text',
          text: options.name,
          css: [{
            top: `630rpx`,
            left: '30rpx',
            fontSize: '44rpx',
            color: '#fff',
          }],
        },
        // 简介
        {
          type: 'text',
          text: options.desc,
          css: [{
            top: `700rpx`,
            left: '30rpx',
            width: '470rpx',
            fontSize: '26rpx',
            color: '#fff',
            maxLines: 3,
            lineHeight: '44rpx',
          }],
        },
        {
          type: 'rect',
          css: {
            bottom: '20rpx',
            right: '30rpx',
            width: '150rpx',
            height: '150rpx',
            borderRadius: '150rpx',
            color: '#fff',
          },
        },
        {
          type: 'image',
          url: `${IMG_HOST}${QRCode}`,
          css: {
            bottom: '25rpx',
            right: '35rpx',
            width: '140rpx',
            height: '140rpx',
          },
        },
      ],
    }

    const tags = setTagText(options.tag)
    if (tags.length > 0) config.views.push(...tags)

    if (textWidthList && textWidthList.length > 0) {
      const tagRects = setTagRect(textWidthList)
      config.views.push(...tagRects)
    }
    console.log(config)
    return config
  }
}

function setTagText(tag: string) {
  if (!tag) return []
  let tags = tag.split(',').map((res: string, idx: number) => {
    return {
      id: `tag_${idx}`,
      type: 'text',
      text: res,
      css: [{
        top: `854rpx`,
        left: idx > 0 ? ['110rpx', `tag_${idx - 1}`, 1] : '50rpx',
        fontSize: '26rpx',
        color: '#fff',
      }],
    }
  })
  return tags
}

function setTagRect(list: any[]) {
  const rects = list.map((res, idx) => {
    const left = `${idx > 0 ? list[idx-1] + 40 + 50 : 30}rpx`
    console.log(left)
    return {
      type: 'rect',
      css: [{
        top: `850rpx`,
        left,
        width: `${res + 40}rpx`,
        height: '40rpx',
        color: 'rgba(255, 255, 255, 0.45)',
        borderRadius: '6rpx',
      }],
    }
  })
  return rects
}