import { View, Text, Image } from '@tarojs/components'
import Taro, { useEffect, useState } from '@tarojs/taro'
import './index.scss'

import { IMG_HOST } from '@/config';

function LogoWrap(props: any): JSX.Element {
  
  let { bottom, styles, isFixed, isJump } = props
  
  let styleHeight = {
    height: Taro.pxTransform(bottom + 90)
  }
  let styleBottom = {
    bottom: Taro.pxTransform(bottom),
    ...styles
  }

  const navigateTo = (url: string, e: any) => {
    if (!isJump) return

    Taro.navigateTo({ url })
  }

  return (
    <View>
      
      <View 
        className={`logo-wrap ${isFixed ? 'logo-wrap-fixed' : ''}`} 
        style={styleBottom} 
        // onClick={() => navigateTo('/pagesCoWebs/service/index')}
      >
        <View 
          className="img"
          onClick={(e) => navigateTo('/pagesCoWebs/service/index', e)}
        >
          <Image src={IMG_HOST + '/attachments/images/jszc_3.png'} mode="widthFix" />
        </View>
      </View>
      {isFixed && 
        <View 
          className="logo-height" 
          style={styleHeight}
        >
          <View
            className="click-box"
            // onClick={(e) => navigateTo('/pagesCoWebs/service/index', e)}
          />
        </View>
      }
    </View>
  )
}

LogoWrap.defaultProps = {
  bottom: 0,
  isFixed: true,
  isJump: true,
}

LogoWrap.options = {
  addGlobalClass: true
}

export default LogoWrap
// export default Taro.memo(LogoWrap)