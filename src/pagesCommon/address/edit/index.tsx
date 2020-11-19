import Taro, { useState, useEffect, useRouter } from '@tarojs/taro';
import { View, Text, Picker, Input, Form, Button, Switch } from '@tarojs/components';
import { getAddress, updateAddress, addAddress, deleteAddress } from '@/api/address';
import { LoadingBox } from '@/components/common';
import regionData from './data';
import './index.scss';

interface IAddressModel {
  id?: string;
  // 地址名称
  name?: string;
  // 收货人
  receiver?: string;
  // 联系方式
  mobile?: string;
  // 省
  province?: string;
  // 市
  city?: string;
  // 区
  area?: string;
  // 详细地址
  address?: string;
  // 是否默认地址
  isDefault?: boolean;
  [params: string]: any;
}

interface IRegion {
  province: any[];
  city: any[];
  area: any[];
  provinceIndex: number;
  cityIndex: number;
  areaIndex: number;
}
function AddressEdit() {
  const [pageLoading, setPageLoading] = useState(false);
  const [model, setModel] = useState<IAddressModel>({
    isDefault: false,
    name: '默认'
  });
  const [region, setRegion] = useState<IRegion>({
    province: [],
    city: [],
    area: [],
    provinceIndex: 0,
    cityIndex: 0,
    areaIndex: 0
  });

  const { id } = useRouter().params;

  useEffect(() => {
    if (id) {
      setPageLoading(true);
      apiGetAddress(id);
    } else {
      setRegion(region => {
        return { ...region, province: getAreaList('province') };
      });
    }
  }, []);

  const apiGetAddress = async (id: string) => {
    const res = await getAddress({ id });
    const data = res.data.data;
    setModel(data);

    const _region = JSON.parse(JSON.stringify(region));
    _region.province = getAreaList('province');
    let province = _region['province'].find((item: any) => {
      return item.name === data.province;
    });
    _region.provinceIndex = _region['province'].findIndex((item: any) => {
      return item.name === data.province;
    });

    _region.city = getAreaList('city', province.code.slice(0, 2));
    let city = _region['city'].find((item: any) => {
      return item.name === data.city;
    });
    _region.cityIndex = _region['city'].findIndex((item: any) => {
      return item.name === data.city;
    });
    _region.area = getAreaList('area', city.code.slice(0, 4));

    _region.areaIndex = _region['area'].findIndex((item: any) => {
      return item.name === data.area;
    });
    setRegion(_region);
    setPageLoading(false);
  };
  const getAreaList = (type: 'province' | 'city' | 'area', code?: string): any[] => {
    let result: any = [];
    if (type !== 'province' && !code) {
      return result;
    }
    const list = regionData[`${type}_list`];
    result = Object.keys(list).map(code => ({
      code,
      name: list[code]
    }));
    if (code) {
      result = result.filter((item: any) => item.code.indexOf(code) === 0);
    }
    return result;
  };
  const onInputChange = (e: any, type: 'name' | 'receiver' | 'mobile' | 'address' | 'isDefault') => {
    model[type] = e.detail.value;
    setModel(model);
  };
  const apiDeleteAddress = async (id: string) => {
    const res = await Taro.showModal({
      title: '提示',
      content: '是否删除该地址'
    });
    if (res.confirm) {
      await deleteAddress({ id });
      Taro.showToast({
        title: '删除成功',
        icon: 'none'
      });
      Taro.navigateBack();
    }
  };
  const onSaveAddress = (e: any) => {
    let params = JSON.parse(JSON.stringify(model));
    for (let i in params) {
      if (params[i] === '') {
        Taro.showToast({
          title: '请将信息填写完整',
          icon: 'none'
        });
        return;
      }
    }
    Taro.showLoading({ title: '请稍后' });
    // 是否存在FormId
    if (e.detail && e.detail.formId) params.wxMiniFormId = e.detail.formId;
    if (params.id) {
      updateAddress(params)
        .then(() => {
          Taro.navigateBack();
        })
        .catch(() => {
          Taro.hideLoading();
        });
    } else {
      addAddress(params)
        .then(() => {
          Taro.navigateBack();
        })
        .catch(() => {
          Taro.hideLoading();
        });
    }
  };

  // 选择事件
  const onPickerChange = (e: any, type: 'province' | 'city' | 'area') => {
    let index = e.detail.value;
    const _region = JSON.parse(JSON.stringify(region));
    const _model = JSON.parse(JSON.stringify(model));
    let item = _region[type][index];
    let code = item.code;
    _model[type] = item.name;
    _region[`${type}Index`] = index;
    if (type === 'province') {
      _model.city = '';
      _model.area = '';
      _region.area = [];
      _region.city = getAreaList('city', code.slice(0, 2));
    } else if (type === 'city') {
      _model.area = '';
      _region.area = getAreaList('area', code.slice(0, 4));
    }
    setModel(_model);
    setRegion(_region);
  };

  return (
    <View className='address-edit'>
      <LoadingBox visible={pageLoading} />

      <Form reportSubmit onSubmit={onSaveAddress}>
        <View className='form'>
          <View className='form-item border'>
            <View className='form-item__title'>收货人</View>
            <View className='form-item__content'>
              <Input
                name='receiver'
                type='text'
                value={model.receiver}
                placeholder='请输入收货人的姓名'
                maxLength={16}
                onInput={e => {
                  onInputChange(e, 'receiver');
                }}
              />
            </View>
          </View>
          <View className='form-item'>
            <View className='form-item__title'>联系方式</View>
            <View className='form-item__content'>
              <Input
                name='mobile'
                type='number'
                maxLength={11}
                value={model.mobile}
                placeholder='请输入收货人的联系方式'
                onInput={e => {
                  onInputChange(e, 'mobile');
                }}
              />
            </View>
          </View>
          <View className='form-item border'>
            <View className='form-item__title'>省份</View>
            <View className='form-item__content'>
              <Picker
                className='picker'
                mode='selector'
                range={region.province}
                rangeKey='name'
                value={region.provinceIndex}
                onChange={e => {
                  onPickerChange(e, 'province');
                }}>
                <View className='picker__inner'>
                  {model.province ? (
                    <Text className='value'>{model.province}</Text>
                  ) : (
                    <Text className='placeholder'>请选择省份</Text>
                  )}
                  <Text className='iconfont icon-arrow-right rotate' />
                </View>
              </Picker>
            </View>
          </View>
          <View className='form-item border'>
            <View className='form-item__title'>城市</View>
            <View className='form-item__content'>
              <Picker
                className='picker'
                mode='selector'
                range={region.city}
                value={region.cityIndex}
                rangeKey='name'
                onChange={e => {
                  onPickerChange(e, 'city');
                }}>
                <View className='picker__inner'>
                  {model.city ? (
                    <Text className='value'>{model.city}</Text>
                  ) : (
                    <Text className='placeholder'>请选择城市</Text>
                  )}
                  <Text className='iconfont icon-arrow-right rotate' />
                </View>
              </Picker>
            </View>
          </View>
          <View className='form-item border'>
            <View className='form-item__title'>区/县/镇</View>
            <View className='form-item__content'>
              <Picker
                className='picker'
                mode='selector'
                range={region.area}
                value={region.areaIndex}
                rangeKey='name'
                onChange={e => {
                  onPickerChange(e, 'area');
                }}>
                <View className='picker__inner'>
                  {model.area ? (
                    <Text className='value'>{model.area}</Text>
                  ) : (
                    <Text className='placeholder'>请选择区域</Text>
                  )}
                  <Text className='iconfont icon-arrow-right rotate' />
                </View>
              </Picker>
            </View>
          </View>
          <View className='form-item top-item'>
            <View className='form-item__title'>详细地址</View>
            <View className='form-item__content'>
              <Input
                name='address'
                type='text'
                value={model.address}
                maxLength={120}
                placeholder='请输入详细地址'
                onInput={e => {
                  onInputChange(e, 'address');
                }}
              />
            </View>
          </View>
          <View className='form-item'>
            <View className='form-item__title'>设为默认地址</View>
            <View className='form-item__content' />
            <View className='form-item__footer'>
              <Switch
                name='idDefault'
                checked={model.isDefault}
                color='#fe4838'
                onChange={e => {
                  onInputChange(e, 'isDefault');
                }}
              />
            </View>
          </View>
        </View>
        {process.env.TARO_ENV === 'weapp' ? (
          <Button className='address-edit__button address-edit__button--submit' formType='submit'>
            保存
          </Button>
        ) : (
          <Button className='address-edit__button address-edit__button--submit' onClick={onSaveAddress}>
            保存
          </Button>
        )}
        <Button
          className='address-edit__button address-edit__button--delete'
          onClick={() => {
            apiDeleteAddress(model.id as string);
          }}>
          删除
        </Button>
      </Form>
    </View>
  );
}

AddressEdit.config = {
  navigationBarTitleText: '编辑地址'
};

export default AddressEdit;
