import Taro, { useState, useRouter, useDidShow } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { listAddress } from '@/api/address';
import { LoadingBox } from '@/components/common';
import './index.scss';

interface IAddress {
  id: string;
  province: string;
  city: string;
  area: string;
  address: string;
  receiver: string;
  mobile: string;
  name: string;
  isDefault: boolean;
}
function AddressList() {
  const [pageLoading, setPageLoading] = useState(true);
  const router = useRouter();
  const [list, setList] = useState<IAddress[]>([]);
  useDidShow(() => {
    listAddress().then(res => {
      setList(res.data.data);
      setPageLoading(false);
    });
  });

  function selectAddress(item: IAddress) {
    if (router.params.action) {
      Taro.setStorageSync('address', item);
      Taro.navigateBack();
    }
  }

  return (
    <View className='address-lists'>
      <LoadingBox visible={pageLoading} />

      {list.map(item => {
        return (
          <View className='address-list' key={item.id}>
            <View
              className='address-list__info'
              onClick={() => {
                selectAddress(item);
              }}>
              <View className='address-list__title'>
                {item.province}
                {item.city}
                {item.area}
                {item.address}
                {item.isDefault && <Text className='address-list__tags--default'>默认</Text>}
              </View>
              <View className='address-list__other'>
                <Text className='address-list__name'>{item.receiver}</Text>
                <Text className='address-list__mobile'>{item.mobile}</Text>
              </View>
            </View>
            <View
              className='address-list__icon'
              onClick={() => {
                Taro.navigateTo({
                  url: `/pagesCommon/address/edit/index?id=${item.id}`
                });
              }}>
              <View className='qcfont qc-icon-bianji'></View>
            </View>
          </View>
        );
      })}
      <View
        className='address-lists__fixed--button'
        onClick={() => {
          Taro.navigateTo({
            url: '/pagesCommon/address/edit/index'
          });
        }}>
        新增收货地址
      </View>
    </View>
  );
}
AddressList.config = {
  navigationBarTitleText: '我的地址'
};
export default AddressList;
