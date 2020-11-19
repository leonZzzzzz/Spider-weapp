import Taro, { useState } from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import './index.scss';
import { IMG_HOST } from '@/config'
import util from '@/utils/util'
import classNames from 'classnames'

// 模块组
export default function QcMenuGroup(props: any) {

  const { options } = props

  const itemCls = classNames({
    'qc-menu-group__item': true,
    [`${options.column}`]: true
  })

  return (
    <View className="qc-menu-group relative">
      {options.item && options.item.map((item: any) => {
        return (
          <View key={item.name} className={itemCls} hoverClass="hover-item" onClick={() => util.navigateTo(item.url)}>
            <View className="qc-menu-group__item__cover">
              <Image src={IMG_HOST + item.iconUrl} mode="aspectFill" />
            </View>
            {options.hasText &&
              <View className="qc-menu-group__item__name">{item.name}</View>
            }
          </View>
        )
      })}
    </View>
  )
}

QcMenuGroup.options = {
  addGlobalClass: true
}
QcMenuGroup.defaultProps = {
  options: {}
}