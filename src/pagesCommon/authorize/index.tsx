import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, Image, Button, Text } from '@tarojs/components';
import { login, getMemberInfo } from '@/api/common';
import { HOME_PATH } from '@/config';
import logo from './icon.png';
import './index.scss';

function Authorize() {
  const [code, setCode] = useState<string>('');
  useEffect(() => {
    Taro.login().then(res => {
      setCode(res.code);
    });
    return () => {
      Taro.removeStorageSync('isAuthorizePage')
    };
  }, []);
  async function onGetPhoneNumber(e: any) {
    if (e.detail.encryptedData) {
      await login({
        code,
        encryptedData: e.detail.encryptedData,
        ivData: e.detail.iv
      });
      const res = await getMemberInfo();
      Taro.setStorageSync('memberInfo', res.data.data);
      Taro.navigateBack();
    }
  }
  return (
    <View className='authorize'>
      <Image src={logo} className='logo' mode='widthFix'></Image>
      <View className='authorize-title'>微信登录</View>
      <View className='authorize-tip'>为了给您提供更好的服务，请先授权手机号码登录小程序</View>
      <View className='authorize-buttons'>
        <Button
          className='authorize-buttons__button authorize-buttons__button--home'
          onClick={() => Taro.switchTab({ url: HOME_PATH })}>
          暂不登录
        </Button>
        <Button
          className='authorize-buttons__button authorize-buttons__button--login'
          openType='getPhoneNumber'
          onGetPhoneNumber={onGetPhoneNumber}>
          授权手机登录
        </Button>
      </View>
    </View>
  );
}

export default Authorize;
