import Taro, { useState, useEffect, useRouter } from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import './index.scss';

import { HOME_PATH, IMG_HOST } from '@/config';
import api from '@/api/cowebs';
import { LoadingBox, LogoWrap } from '@/components/common';
import util from '@/utils/util';

export default function ActivitySuccess() {
  const [pageLoading, setPageLoading] = useState(true);
  const [activityNum, setActivityNum] = useState(0);
  const [logo, setLogo] = useState('');

  const { type } = useRouter().params;

  useEffect(() => {
    // getActivityNum()
    activitySignSuccess();
  }, []);

  const getActivityNum = async () => {
    let res = await api.activityNum();
    setActivityNum(res.data.data.signActivityNum);
    setPageLoading(false);
  };

  // 获取logo
  const activitySignSuccess = async () => {
    try {
      const res = await api.activitySignSuccess();
      const data = res.data.data;
      if (data && data.value) {
        const value = data.value.split(',')[0];
        setLogo(value);
      }
      setPageLoading(false);
    } catch (err) {
      setPageLoading(false);
    }
  };

  return (
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

        {/* <View className="success-sum">
          <View className="title">已报名活动</View>
          <View className="count">
            <Text className="num">{activityNum}</Text>个
          </View>
        </View> */}

        <View className='back-btn' onClick={() => util.navigateTo(HOME_PATH)}>
          返回首页
        </View>

        {logo && (
          <View className='bottom-logo'>
            <Image src={IMG_HOST + logo} mode='widthFix' />
          </View>
        )}
      </View>

      <LogoWrap />
    </View>
  );
}

ActivitySuccess.config = {
  navigationBarTitleText: '报名成功'
};
