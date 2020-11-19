import Taro, { useState, useEffect, useReachBottom, usePullDownRefresh, useRouter } from '@tarojs/taro';
import { View, Button } from '@tarojs/components';
import './index.scss';

import useGetListData from '@/useHooks/useGetListData';

import { QcEmptyPage, LoadingBox, Dialog, LogoWrap, ThemeView } from '@/components/common';
import { AlumniCard } from '@/components/cowebs';

export default function SearchList() {
  const [tipVisible, setTipVisible] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [filter, setFilter] = useState('');

  const { list, pageLoading, load, searchData, setSearchData } = useGetListData(
    'getContactsList',
    {
      name: ''
    },
    false
  );

  const params = useRouter().params;

  useEffect(() => {
    if (params.filter) {
      setFilter(params.filter);
      let model = JSON.parse(params.model) || {};
      const search = Object.assign(searchData, model);
      setSearchData(search);
    }
    load();
  }, []);

  useEffect(() => {
    getHeight();
  }, [filter]);

  useReachBottom(() => {
    load(true);
  });

  usePullDownRefresh(() => {
    load();
  });

  const getHeight = () => {
    Taro.createSelectorQuery()
      .select('.top-wrap')
      .boundingClientRect()
      .exec(res => {
        console.log('getHeight', res);
        setHeaderHeight(res[0].height);
      });
  };

  return (
    <ThemeView>
      <View className='search-list'>
        <LoadingBox visible={pageLoading} />

        <View className='top-wrap'>
          <View>{filter}</View>
          <View className='red' onClick={() => Taro.navigateBack()}>
            重选
          </View>
        </View>
        <View style={{ height: `${headerHeight}px` }} />
        <View className='list relative'>
          {list.length > 0 ? (
            list.map((item, index) => {
              return <AlumniCard item={item} index={index} key={item.id} onTip={() => setTipVisible(true)} />;
            })
          ) : (
            <QcEmptyPage icon='none'></QcEmptyPage>
          )}
        </View>
        <LogoWrap />

        <Dialog visible={tipVisible} isMaskClick={false} onClose={() => setTipVisible(false)}>
          <View className='tip-dialog'>
            <View className='close qcfont qc-icon-guanbi1' onClick={() => setTipVisible(false)}></View>
            <View className='content'>
              <View>该校友还未加入</View>
              <View>我们邀请Ta加入吧！</View>
            </View>
            <View className='bottom'>
              <Button openType='share' onClick={() => setTipVisible(false)}>
                邀 请
              </Button>
            </View>
          </View>
        </Dialog>
      </View>
    </ThemeView>
  );
}

SearchList.config = {
  navigationBarTitleText: '通讯录查询',
  enablePullDownRefresh: true
};
