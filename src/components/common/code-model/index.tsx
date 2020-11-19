import { View, Image, Text } from '@tarojs/components';
import Taro, { useState, useEffect } from '@tarojs/taro';
import ThemeView from '../theme-view';
import { IMG_HOST } from '@/config';
import './index.scss';

function CodeModel(props: any) {
  const { code, onCode, saveposter } = props;
  return (
    code && (
      <ThemeView>
        <View className='code-model'>
          <View
            className='code-track'
            onClick={() => {
              onCode && onCode()
            }}></View>
          <View className='code-content'>
            <View className='code-ma'>
              <Image src={IMG_HOST + `/attachments/null/9d0d52219ee94ec8a3aa229e3d563902.png`}></Image>
              <Text>扫码上方二维码即可学习</Text>
            </View>
            <View className='phonealb'>
              <Text onClick={() => { saveposter && saveposter() }}>保存二维码至相册</Text>
            </View>
          </View>
        </View>
      </ThemeView>
    )
  );
}

CodeModel.defaultProps = {
  code: false,
  text: '加载中'
};

export default CodeModel;
