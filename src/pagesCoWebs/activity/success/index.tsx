import Taro, { useState, useEffect, useRouter, useShareAppMessage } from '@tarojs/taro';
import { View, Text, Image, Button } from '@tarojs/components';
import { HOME_PATH, IMG_HOST } from '@/config';
import api from '@/api/cowebs';
import util from '@/utils/util';
import { LoadingBox, LogoWrap, Dialog, ThemeView } from '@/components/common';
import withShare from '@/utils/withShare';
import './index.scss';

export default function ActivitySuccess() {
  const [pageLoading, setPageLoading] = useState(true);
  const [activityNum, setActivityNum] = useState(0);
  const [logo, setLogo] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);
  const { type, id, title, iconUrl, bindScene, showStyle } = useRouter().params;

  useEffect(() => {
    console.log('bindScene', bindScene);
    // setSuccessVisible(false);
    Taro.hideShareMenu();
    getActivityNum();
    activitySignSuccess();
  }, []);

  useShareAppMessage(() => {
    return withShare({
      title: title,
      imageUrl: IMG_HOST + iconUrl,
      path: `/pagesCoWebs/activity/detail-commission/index?id=${id}&bindScene=${bindScene}`
    });
  });

  const getActivityNum = async () => {
    let res = await api.activityNum();
    setActivityNum(res.data.data.signActivityNum);
    setPageLoading(false);
    console.log('bindScene', bindScene);
    setTimeout(() => {
      if (bindScene) setSuccessVisible(true);
    }, 300);
  };
  useEffect(() => {
    console.log('successVisible', successVisible);
  }, [successVisible]);

  // 获取logo
  const activitySignSuccess = async () => {
    try {
      const res = await api.activitySignSuccess();
      if (res.data.code == 20000) {
        Taro.showToast({
          title: ''
        })
      }
      const data = res.data.data;
      if (data && data.value) {
        const value = data.value.split(',')[0];
        setLogo(value);
      }
      // setPageLoading(false)
    } catch (err) {
      // setPageLoading(false)
    }
  };

  const requestSubscribeMessage = async () => {
    try {
      const res = await util.requestSubscribeMessage('SIGN_STATUS');
      console.log('success', res);
    } catch (err) {
      console.log('success', err);
    }
  };

  return (
    <ThemeView>
      <View className='success'>
        <LoadingBox visible={pageLoading} />

        <View className='success-wrap'>
          {type === 'wait' ? (
            <View className='success-status'>
              <View className='qcfont qc-icon-checked'></View>
              <View className='status-title'>预报名成功！</View>
              <View className='status-info'>正在等待管理员审核...</View>
            </View>
          ) : type == 'sign' ? (
            <View className='success-status'>
              <View className='qcfont qc-icon-checked'></View>
              <View className='status-title'>签到成功！</View>
            </View>
          ) : (
                <View className='success-status'>
                  <View className='qcfont qc-icon-checked'></View>
                  <View className='status-title'>报名成功！</View>
                </View>
              )}

          <View className='success-sum'>
            <View className='title'>已报名活动</View>
            <View className='count'>
              <Text className='num'>{activityNum}</Text>个
            </View>
          </View>

          {/* <View className="subscribe">
          <Button onClick={requestSubscribeMessage}>订阅活动开始提醒</Button>
        </View> */}

          <View className='back-btn' onClick={() => Taro.navigateBack({ delta: 1 })}>
            返回活动
          </View>

          {logo && (
            <View className='bottom-logo'>
              <Image src={IMG_HOST + logo} mode='widthFix' />
            </View>
          )}
        </View>

        <LogoWrap />

        <Dialog visible={successVisible} isMaskClick={false}>
          <View className='success-dialog'>
            <View className='success-content'>
              <View className='img-box'>
                <Image src={IMG_HOST + `/attachments/images/share-success.png`} mode='aspectFill' />
              </View>
              <View className='btn-box'>
                <Button
                  onClick={() => {
                    setSuccessVisible(false);
                    util.navigateTo(
                      `/pagesPromotion/sharer/sales-poster/index?id=${id}&showStyle=${showStyle}&title=${title}&iconUrl=${iconUrl}`
                    );
                  }}>
                  生成海报
                </Button>
                <Button openType='share'>分享给好友</Button>
              </View>
            </View>
            <View className='success-close'>
              <Text className='qcfont qc-icon-chacha' onClick={() => setSuccessVisible(false)} />
            </View>
          </View>
        </Dialog>
      </View>
    </ThemeView>
  );
}

ActivitySuccess.config = {
  navigationBarTitleText: '报名成功'
};
