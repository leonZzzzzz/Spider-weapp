import Taro, { useRouter, useEffect, useState, useDidShow } from '@tarojs/taro';
import { View, Text, Input, Button } from '@tarojs/components';
import { getOrderPreview, postOrder, wechatPay } from '@/api/order';
import apiCowebs from '@/api/cowebs';
import { toPriceYuan } from '@/utils/format';
import { IMG_HOST } from '@/config';
import QcProductItem from '@/components/common/product-item';
import util from '@/utils/util';
import './index.scss';
import { ThemeView } from '@/components/common';
interface IProductConfirm extends IProduct {
  specs: string;
}
interface IStore {
  storeName: string;
  storeId: string;
  orderItems: IProductConfirm[];
}

interface IProductPreview {
  stores: IStore[];
  qty: number;
  amount: number;
  orderToken: string;
  totalAmount: number;
  requiredAddress: boolean;
  transportAmount: number;
  walletAmount: number;
}

function ProductConfirm() {
  const router = useRouter();
  const [model, setModel] = useState<IProductPreview>({
    stores: [] as IStore[]
  } as IProductPreview);
  const [address, setAddress] = useState();
  const [code, setCode] = useState();
  useEffect(() => {
    apiGetOrderPreview();
    return () => {
      Taro.removeStorageSync('address');
    };
  }, []);

  async function apiGetOrderPreview() {
    const res = await getOrderPreview(router.params.ids);
    setModel(res.data.data);
    setAddress(res.data.data.address || {});
    if (!res.data.data.requiredAddress) {
      Taro.login().then(res => {
        setCode(res.code);
      });
    }
  }

  useDidShow(() => {
    let address = Taro.getStorageSync('address');
    if (address) {
      setAddress(address);
    }
  });
  // phone
  const handleItemPhoneNumber = async (e: any) => {
    console.log('handleItemPhoneNumber', e);
    if (!e.detail.encryptedData) {
      util.showToast('授权失败，请重新授权');
      return;
    }
    util.showLoading(true, '获取中…');
    let params = {
      code,
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv
    };
    try {
      const res = await apiCowebs.decryptPhone(params);
      address.mobile = res.data.message;
      setAddress(address);
      Taro.hideLoading();
    } catch (err) {
      Taro.hideLoading();
    }
  };
  async function pay() {
    let data: any = {
      orderItemIds: router.params.ids.split('_').join(','),
      orderToken: model.orderToken,
      useWallet: false,
      payChannel: 1,
      serviceType: 3
    };
    if (model.requiredAddress) {
      if (!address.id) {
        util.showToast('请填写收货地址');
        return;
      }
      data.addressId = address.id;
    }
    if (!model.requiredAddress) {
      if (!address.receiver || !address.mobile) {
        util.showToast('请填写收货人和手机号码');
        return;
      }
      data.receiver = address.receiver;
      data.mobile = address.mobile;
    }
    try {
      const orderRes: any = await postOrder(data).catch(error => {
        model.orderToken = error.data.data.orderToken;
      });
      if (orderRes.data.data.needPay) {
        // 获取支付结果集
        const payRes = await wechatPay({ token: orderRes.data.data.payId });
        // 发起支付
        const { timeStamp, nonceString, pack, signType, paySign } = payRes.data.data;
        Taro.requestPayment({
          timeStamp,
          nonceStr: nonceString,
          package: pack,
          signType,
          paySign
        }).finally(() => {
          // 无论结果如何 跳转订单详情
          Taro.redirectTo({
            url: `/pagesMall/order/detail/index?id=${orderRes.data.data.orderId}`
          });
        });
      } else {
        // 无需支付 跳转订单详情
        Taro.redirectTo({
          url: `/pagesMall/order/detail/index?id=${orderRes.data.data.orderId}`
        });
      }
    } catch (error) {
      console.error('被我捕获====>', error);
    }
  }

  return (
    <ThemeView>
      <View className='product-confirm'>
        {model.requiredAddress ? (
          <View
            className='address-wrap'
            onClick={() => {
              Taro.navigateTo({
                url: '/pagesCommon/address/list/index?action=true'
              });
            }}>
            {address.id ? (
              <View className='address-wrap__info'>
                <View className='address-wrap__add'>
                  {address.province}
                  {address.city}
                  {address.area}
                  {address.address}
                </View>
                <View className='address-wrap__user'>
                  <Text className='name'>{address.receiver}</Text>
                  <Text className='phone'>{address.mobile}</Text>
                </View>
              </View>
            ) : (
              <View className='address-wrap__info'>添加收货地址</View>
            )}
            <View className='address-wrap__icon qcfont qc-icon-chevron-right'></View>
          </View>
        ) : (
          <View className='address-wrap'>
            <View className='input-box'>
              <View className='cell'>
                <View className='label'>收货人</View>
                <View className='value'>
                  <Input
                    placeholder='请输入收货人'
                    value={address.receiver}
                    onInput={(e: any) => {
                      address.receiver = e.detail.value;
                      setAddress(address);
                    }}
                  />
                </View>
              </View>
              <View className='cell'>
                <View className='label'>手机号</View>
                <View className='value'>
                  <Input placeholder='请点击获取手机号' value={address.mobile} disabled />
                  <Button
                    openType='getPhoneNumber'
                    hoverClass='hover-button'
                    onGetPhoneNumber={e => handleItemPhoneNumber(e)}>
                    获取
                  </Button>
                </View>
              </View>
            </View>
          </View>
        )}
        <View className='order-wrap'>
          <View className='order-wrap__header'>商品信息</View>
          <View>
            {model.stores.map(store => {
              return (
                <View key={store.storeId}>
                  {store.orderItems.map(product => {
                    return (
                      <View className='order-wrap__body' key={product.id}>
                        <QcProductItem
                          iconUrl={IMG_HOST + product.iconUrl}
                          name={product.name}
                          specs={product.specs}
                          price={`￥${toPriceYuan(product.price)}`}>
                          <Text>x{product.qty}</Text>
                        </QcProductItem>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
          <View className='order-wrap__total'>
            共<Text className='qty'>{model.qty}</Text>件商品
            <Text className='amount'>订单金额￥{toPriceYuan(model.totalAmount)}</Text>
          </View>
        </View>

        {model.transportAmount > 0 && (
          <View className='transport'>
            <View>运费</View>
            <View>￥{toPriceYuan(model.transportAmount)}</View>
          </View>
        )}

        <View className='fixed-wrap'>
          <View className='button' onClick={pay}>
            确认订单
          </View>
          <View className='text'>
            应付：
            <Text className='price'>￥{toPriceYuan(model.totalAmount)}</Text>
          </View>
        </View>
      </View>
    </ThemeView>
  );
}

ProductConfirm.config = {
  navigationBarTitleText: '确认订单'
};

export default ProductConfirm;
