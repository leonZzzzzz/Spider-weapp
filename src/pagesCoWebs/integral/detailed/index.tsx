import Taro, { useState, useEffect, useReachBottom, usePullDownRefresh } from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import './index.scss';
import { ThemeView, LoadingBox, QcEmptyPage, LogoWrap } from '@/components/common';
import { IMG_HOST } from '@/config';
import api from '@/api';
import useGetListData from '@/useHooks/useGetListData';

export const Index = () => {
  const { list, pageLoading, load } = useGetListData('pointsPage');
  const [user, setUser] = useState<any>({});

  useReachBottom(() => {
    load(true);
  });
  usePullDownRefresh(() => {
    load();
  });
  useEffect(() => {
    pointsRankMe();
  }, []);

  // const aaa = async () => {
  //   const res = await api.informationShare({ id: '3b9b73cccec54efb97b252771299c682' });
  // };

  const pointsRankMe = async () => {
    const res = await api.pointsRankMe();
    setUser(res.data.data);
  };

  return (
    <ThemeView>
      <LoadingBox visible={pageLoading} />

      <View className='detailed-box'>
        <View className='card-box'>
          <Image src={IMG_HOST + '/attachments/images/ranking-bg.png'} mode='widthFix' />
          <View className='number-box'>
            <View>总积分(分)</View>
            <View className='num'>{user.points || 0}</View>
          </View>
        </View>
        <View className='list relative'>
          {list.length > 0 ? (
            list.map(item => {
              return (
                <View className='item'>
                  <View className='content'>
                    <View>{item.detail}</View>
                    <View className={`num ${item.type}`}>
                      {item.type === 'income' ? '+' : '-'}
                      {item.amount}
                    </View>
                  </View>
                  <View className='time'>{item.createTime}</View>
                </View>
              );
            })
          ) : (
            <QcEmptyPage icon='none'></QcEmptyPage>
          )}
        </View>
        <LogoWrap />
      </View>
    </ThemeView>
  );
};

Index.config = {
  navigationBarTitleText: '积分明细',
  enablePullDownRefresh: true
};
