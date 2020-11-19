import Taro, { useState } from '@tarojs/taro'
import { View, Swiper, SwiperItem, Image } from '@tarojs/components'
import './index.scss'

function CompanyPages() {

  return (
    <View className="company-pages">
      <Swiper>
        <SwiperItem></SwiperItem>
      </Swiper>
    </View>
  )
}

CompanyPages.config = {
  navigationBarTitleText: '企业黄页'
}

export default CompanyPages