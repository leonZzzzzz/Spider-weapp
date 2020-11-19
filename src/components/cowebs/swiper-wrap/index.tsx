import Taro, { useState, useEffect } from '@tarojs/taro'
import { Swiper, SwiperItem, Image } from '@tarojs/components'

import './index.scss'

import { IMG_HOST } from '@/config';

const systemInfo = Taro.getSystemInfoSync()

function SwiperWrap(props: any): JSX.Element {
  let { swiperData, isDetail, isPreview, toLink } = props

  const [ style ] = useState(() => {
    return {
      height: systemInfo.screenWidth + 'px',
      width: systemInfo.screenWidth + 'px'
    }
  })

  const [ swiperImgList, setSwiperImgList ] = useState([])

  useEffect(() => {
    if (swiperData.length) {
      // if (typeof swiperData[0] === 'object') {
      //   let list = swiperData.map((item: any) => {
      //     return IMG_HOST + item.imgUrl
      //   })
      //   setSwiperImgList(list)
      // } else {
      //   setSwiperImgList(swiperData)
      // }
      let list = swiperData.map((item: any) => {
        return IMG_HOST + item
      })
      setSwiperImgList(list)
    }
  })

  // 预览轮播列表的大图
  const previewImage = (index: number) => {
    if (!isDetail && !isPreview) return
    let current = swiperImgList[index]
    Taro.previewImage({
      current,
      urls: swiperImgList,
    });
  }

  const navigateTo = (index: number) => {
    let item = swiperData[index]
    let url = ''
    if (item.type === 'product') {
      url = `/pagesMall/product-detail/index?id=${item.link}`
    } else if (item.type === 'groupshop') {
      url = `/pagesMall/group-product/detail/index?id=${item.link}`
    } else if (item.type === 'journey') {
      url = `/pagesSojourn/sojourn/detail/index?id=${item.link}`
    } else if (item.type === 'activity') {
      url = `/pagesCowebs/activity/detail/index?id=${item.link}`
    }
    if (!url) return
    Taro.navigateTo({
      url,
    })
  }

  const clickType = (index: number) => {
    if (toLink) navigateTo(index)
    else previewImage(index)
  }

  return (
    <Swiper
      style={isDetail ? style : {}}
      className="swiper-data"
      indicatorActiveColor="#fff"
      circular
      indicatorDots
      autoplay>
      {swiperImgList.map((item: string, index: number) => {
        return (
          <SwiperItem key={item} className="item" onClick={() => clickType(index)}>
            <Image src={item} mode="aspectFill" />
          </SwiperItem>
        )
      })}
    </Swiper>
  )
}

SwiperWrap.defaultProps = {
  swiperData: [],
  toLink: false,
  isPreview: true,
}

SwiperWrap.options = {
  addGlobalClass: true
}

export default SwiperWrap
