import Taro, { useState, useEffect, useDidShow } from '@tarojs/taro';
import { View, Text, Input, Picker, Button } from '@tarojs/components';
import api from '@/api/cowebs';
import { LogoWrap, ThemeView } from '@/components/common';
import './index.scss';

export default function Search() {
  const [model, setModel] = useState<any>({
    city: '',
    class: '',
    company: '',
    trade: '',
    bindStatus: 0
  });

  const [listData, setListData] = useState<any>({
    tradeList: [],
    classList: [],
    statusList: ['全部', '已加入', '未加入']
  });
  const [indexData, setIndexData] = useState<any>({
    tradeIndex: null,
    classIndex: null,
    statusIndex: 0
  });

  useEffect(() => {
    // getConfigTrade();
    getConfigList();
  }, []);

  useDidShow(() => {
    setModel({
      city: '',
      class: '',
      company: '',
      trade: '',
      bindStatus: 0
    });
    setIndexData({
      tradeIndex: null,
      classIndex: null,
      statusIndex: 0
    });
  });

  const getConfigTrade = async () => {
    const res = await api.getConfigTrade();
    const data = res.data.data.value;
    setListData(prev => {
      return { ...prev, tradeList: data.split('_') };
    });
  };

  const getConfigList = async () => {
    const res = await api.getConfigList();
    const data = res.data.data;
    const classList = data.classList.map((item: any) => {
      item.className = /-\/-/.test(item.className) ? item.className.replace('-/-', '-') : item.className;
      return item;
    });
    setListData(prev => {
      return { ...prev, classList, tradeList: data.tradeList };
    });
  };

  const handleInput = (type: string, e: any) => {
    setModel(prev => {
      prev[type] = e.detail.value;
      return { ...prev };
    });
  };

  const handlePickerChange = (type: string, e: any) => {
    const index = Number(e.detail.value);
    setIndexData(prev => {
      prev[`${type}Index`] = index;
      return { ...prev };
    });
  };

  const handleSubmit = () => {
    const sep = '#';
    let filter = '#';
    if (model.city) {
      filter += model.city + sep;
    }
    if (model.company) {
      filter += model.company + sep;
    }
    if (indexData.tradeIndex !== null) {
      filter += listData.tradeList[indexData.tradeIndex] + sep;
      model.trade = listData.tradeList[indexData.tradeIndex];
    }
    if (indexData.classIndex !== null) {
      filter += listData.classList[indexData.classIndex].className + sep;
      model.class = listData.classList[indexData.classIndex].id;
    }
    if (indexData.statusIndex !== null) {
      filter += listData.statusList[indexData.statusIndex] + sep;
      model.bindStatus = indexData.statusIndex;
    }

    console.log(filter);
    console.log(JSON.stringify(model));

    Taro.navigateTo({
      url: `/pagesCoWebs/contacts/search-list/index?filter=${filter}&model=${JSON.stringify(model)}`
    });
  };

  return (
    <ThemeView>
      <View className='contacts-search'>
        <View className='input-wrap'>
          <View className='item'>
            <View className='title'>
              <Text>城市</Text>
            </View>
            <Input placeholder='请输入城市' value={model.city} onInput={e => handleInput('city', e)} />
          </View>
          <View className='item'>
            <View className='title'>
              <Text>行业</Text>
            </View>
            <Picker
              mode='selector'
              range={listData.tradeList}
              value={indexData.tradeIndex}
              onChange={e => handlePickerChange('trade', e)}
              className='picker'>
              {indexData.tradeIndex !== null ? (
                <View className='text'>
                  <Text style='color: #4d4d4d;'>{listData.tradeList[indexData.tradeIndex]}</Text>
                  <Text className='qcfont qc-icon-chevron-down' />
                </View>
              ) : (
                <View className='text'>
                  <Text>请选择行业</Text>
                  <Text className='qcfont qc-icon-chevron-down' />
                </View>
              )}
            </Picker>
          </View>
          <View className='item'>
            <View className='title'>
              <Text>班级</Text>
            </View>
            <Picker
              mode='selector'
              range={listData.classList}
              value={indexData.classIndex}
              rangeKey='className'
              onChange={e => handlePickerChange('class', e)}
              className='picker'>
              {indexData.classIndex !== null ? (
                <View className='text'>
                  <Text style='color: #4d4d4d;'>{listData.classList[indexData.classIndex].className}</Text>
                  <Text className='qcfont qc-icon-chevron-down' />
                </View>
              ) : (
                <View className='text'>
                  <Text>请选择班级</Text>
                  <Text className='qcfont qc-icon-chevron-down' />
                </View>
              )}
            </Picker>
          </View>
          <View className='item'>
            <View className='title'>
              <Text>状态</Text>
            </View>
            <Picker
              mode='selector'
              range={listData.statusList}
              value={indexData.statusIndex}
              onChange={e => handlePickerChange('status', e)}
              className='picker'>
              {indexData.statusIndex !== null ? (
                <View className='text'>
                  <Text style='color: #4d4d4d;'>{listData.statusList[indexData.statusIndex]}</Text>
                  <Text className='qcfont qc-icon-chevron-down' />
                </View>
              ) : (
                <View className='text'>
                  <Text>请选择状态</Text>
                  <Text className='qcfont qc-icon-chevron-down' />
                </View>
              )}
            </Picker>
          </View>
          {/* <View className="vip-text">VIP专属特权</View> */}
          <View className='item'>
            <View className='title'>
              <Text>公司</Text>
            </View>
            <Input placeholder='请输入公司' value={model.company} onInput={e => handleInput('company', e)} />
          </View>
        </View>
        <View className='submit-btn'>
          <Button onClick={handleSubmit}>查询</Button>
        </View>

        <LogoWrap />
      </View>
    </ThemeView>
  );
}

Search.config = {
  navigationBarTitleText: '通讯录查询'
};
