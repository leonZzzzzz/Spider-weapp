import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import api from '@/api/donate';
import { IMG_HOST } from '@/config';

import './index.scss';
import Utils from '@/utils/util';


export default function Index() {
  const [detail, setDetail] = useState<any>({
    headImage: '',
    donator: '',
    amount: 0,
    thankMsg: '感谢您为甘泉禅寺随喜乐捐！'
  });
  const [tongji, setTongji] = useState<any>({
    amount: 0,
    time: 0
  });

  useEffect(() => {
    api.donateMyOrderSummary().then(res => {
      setTongji(res.data.data);
    });

    setDetail(Taro.getStorageSync('donateResult') || detail)
    return () => {
      Taro.removeStorageSync('donateResult')
    }
  }, []);

  return (
    <View className='relative result'>
      <View className='result-box'>
        <Image className='headImage' src={detail.headImage || `${IMG_HOST}/static/avatar.png`}></Image>
        <View className='name'>{detail.donator}</View>
        <View className='unit'>本次捐款/元</View>
        <View className='amount'>{Utils.filterPrice(detail.amount)}</View>
        <View className='thanks'>{detail.thankMsg}</View>
        <View className='tongji'>
          <View className='tongji_a'>
            <View>累计随喜/元</View>
            <View className='value'>{Utils.filterPrice(tongji.amount)}</View>
          </View>
          <View className='tongji_b'>
            <View>帮助项目/个</View>
            <View className='value'>{tongji.times || 0}</View>
          </View>
        </View>
        <View className='record' onClick={() => Taro.navigateTo({url: '/pagesCoWebs/donate/my-record/index'})}>查看捐款记录</View>
      </View>
      <View className='back-btn' onClick={() => Taro.navigateBack()}>返回项目详情</View>
    </View>
  );
}
Index.config = {
  navigationBarTitleText: '随喜结果',
};
