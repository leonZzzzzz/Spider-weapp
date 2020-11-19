import Taro, { useState, useEffect } from '@tarojs/taro'
import { View, Block } from '@tarojs/components';


import './index.scss';

export default function FixedBox(props: any) {

  const { children, height, zIndex, style } = props

  const _style = {
    height: Taro.pxTransform(height),
    zIndex: zIndex,
    ...style,
  }

  return (
    <Block>
      <View className="fixed-box" style={_style}>
        {children}
      </View>
      <View style={{height: Taro.pxTransform(height)}} />
    </Block>
  )
}

FixedBox.defaultProps = {
  zIndex: 999,
  height: 100
}