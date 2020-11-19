import Taro, { useState, useEffect, useShareAppMessage, usePullDownRefresh } from '@tarojs/taro';
import { View, Text, Image, Picker, Button } from '@tarojs/components';
import './index.scss';

import { Toast, Dialog, ThemeView, Avatar, ContentWrap, LoadingBox } from '@/components/common';
import { IMG_HOST } from '@/config';
import withShare from '@/utils/withShare';
import util from '@/utils/util';
import api from '@/api';

export const Index = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [ruleVisible, setRuleVisible] = useState(false);
  const [rule, setRule] = useState<any>({});
  const [timeList] = useState([
    {
      name: '昨日',
      type: 'yesterday'
    },
    {
      name: '今日',
      type: 'thisToday'
    },
    {
      name: '本周',
      type: 'week'
    },
    {
      name: '上周',
      type: 'lastWeek'
    },
    {
      name: '本月',
      type: 'thisMonth'
    }
  ]);
  const [timeIndex, setTimeIndex] = useState(1);
  const [rankList, setRankList] = useState<any[]>([]);
  const [user, setUser] = useState<any>({});
  const [weappName, setWeappName] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  useShareAppMessage(() => {
    return withShare({
      path: '/pagesCoWebs/integral/index/index',
      title: `我在「${weappName}」排行第「${user.rank}」`
    });
  });

  useEffect(() => {
    Taro.hideShareMenu();
    pointsRankRealtime();
    getName();
    pointsRuleGet();
  }, []);

  usePullDownRefresh(() => {
    setPageLoading(true);
    pointsRankRealtime();
  });

  const getName = async () => {
    const res = await api.getName();
    setWeappName(res.data.message);
  };

  const pointsRankRealtime = async () => {
    const res = await api.pointsRankRealtime({ quantity: 10 });
    // setRankList([...res.data.data, res.data.data[1]]);
    setRankList(res.data.data);
    pointsRankMe();
  };
  const pointsRankMe = async () => {
    const res = await api.pointsRankMe();
    setUser(res.data.data);
    setPageLoading(false);
  };

  const pointsRuleGet = async () => {
    const res = await api.pointsRuleGet();
    setRule(res.data.data);
  };

  const handlePickerChange = (e: any) => {
    console.log(e);
    const index = Number(e.detail.value);
    setTimeIndex(index);
  };

  return (
    <ThemeView>
      <LoadingBox visible={pageLoading} />

      <Toast visible={toastVisible} onClose={() => setToastVisible(false)} text='+20积分' />
      {/* <View onClick={() => setToastVisible(true)}>点击</View> */}
      <View className='integral-box'>
        <View className='rules-box'>
          <View className='item' onClick={() => setRuleVisible(true)}>
            <Text className='qcfont qc-icon-wenti' />
            <Text>规则</Text>
          </View>
          <View className='item'>
            <Picker
              mode='selector'
              range={timeList}
              rangeKey='name'
              value={timeIndex}
              onChange={handlePickerChange}
              className='picker'>
              <Text>{timeList[timeIndex].name}</Text>
              <Text className='qcfont qc-icon-triangle-down' />
            </Picker>
          </View>
        </View>
        {rankList.length > 0 && (
          <View className='top-ranking-box' onClick={() => setToastVisible(true)}>
            {rankList.map((item, i) => {
              return (
                i < 3 && (
                  <View
                    className={`item ${i === 0 ? 'first' : i === 1 ? 'two' : ''}`}
                    style={{ order: i === 1 ? -1 : 0 }}>
                    <View className='circle'>
                      <Text className='qcfont qc-icon-renqishangpin'></Text>
                      <Text className='rank'>{item.rank}</Text>
                      <Avatar
                        width={i === 0 ? 170 : 130}
                        style={{ position: 'relative', zIndex: 1 }}
                        imgUrl={item.headImage}
                      />
                    </View>
                    <View className='name'>{item.appellation}</View>
                    <View className='number'>{item.points}分</View>
                  </View>
                )
              );
            })}
            {rankList.length === 1 &&
              [1, 2].map(i => {
                return (
                  <View
                    className='item'
                    style={{
                      width: Taro.pxTransform(142),
                      height: Taro.pxTransform(200),
                      order: i === 1 ? -1 : 0
                    }}></View>
                );
              })}
            {rankList.length === 2 && (
              <View className='item' style={{ width: Taro.pxTransform(142), height: Taro.pxTransform(200) }}></View>
            )}
          </View>
        )}
        <View className='my-ranking-box' onClick={() => util.navigateTo('/pagesCoWebs/integral/detailed/index')}>
          <View className='left'>
            <Text className='rank'>{user.rank}</Text>
            <Avatar imgUrl={user.headImage} width={70} />
            <Text className='name'>{user.appellation}</Text>
          </View>
          <View className='right'>
            <Text>{user.points}分</Text>
            <Text className='qcfont qc-icon-chevron-right' />
          </View>
        </View>

        <View className='ranking-list-box'>
          {rankList.map((item, i) => {
            return (
              i > 2 && (
                <View className='ranking-item'>
                  <View className='left'>
                    <Text className='rank'>{item.rank}</Text>
                    <Avatar imgUrl={item.headImage} width={70} />
                    <Text className='name'>{item.appellation}</Text>
                  </View>
                  <View className='right'>
                    <Text>{item.points}分</Text>
                    <Text className='qcfont qc-icon-chevron-right' />
                  </View>
                </View>
              )
            );
          })}
        </View>
      </View>

      <View style={{ height: Taro.pxTransform(120) }} />
      <Button className='ranking-share-btn' openType='share'>
        <Text className='qcfont qc-icon-yaoqing' />
        <Text>分享给好友</Text>
      </Button>

      <Dialog visible={ruleVisible}>
        <View className='rules-wrap'>
          <View className='rules-box'>
            <Image className='rules-bg' src={IMG_HOST + '/attachments/images/ranking-rules.png'} mode='widthFix' />
            <View className='rules-title'>{rule.title}</View>
            <View className='content-box'>
              <ContentWrap content={rule.content} />
            </View>
          </View>
          <View className='close'>
            <Text className='qcfont qc-icon-guanbi1' onClick={() => setRuleVisible(false)} />
          </View>
        </View>
      </Dialog>
    </ThemeView>
  );
};

Index.config = {
  navigationBarTitleText: '查看积分',
  enablePullDownRefresh: true
};
