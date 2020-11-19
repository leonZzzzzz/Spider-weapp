import Taro from '@tarojs/taro';
import { View, Image, Button, Text } from '@tarojs/components';
import { login, getMemberInfo } from '@/api/common';
import './index.scss';

function Authorize() {
  async function getUserInfo(e: any) {
    const code = await Taro.login();
    let {
      detail: { userInfo }
    } = e;
    await login({
      code: code.code,
      headImage: userInfo.avatarUrl,
      appellation: userInfo.nickName
    });
    const res = await getMemberInfo();
    Taro.setStorageSync('memberInfo', res.data.data);
    Taro.navigateBack();
  }
  return (
    <View className='authorize'>
      <Image src='' className='logo'></Image>
      <Button className='login-button' openType='getUserInfo' onGetUserInfo={getUserInfo}>
        微信用户快速登录
      </Button>
      <View className='tips'>
        新用户将自动注册，登录&注册表示同意<Text style='color:#0188fb'>企成服务条款</Text>
      </View>
    </View>
  );
}

export default Authorize;
