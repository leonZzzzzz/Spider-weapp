import Taro, { useState, useDidShow } from '@tarojs/taro';
import { View, Text, Block, Button } from '@tarojs/components';
import { pageCart, addCartNum, deducteCartNumber, deleteCart } from '@/api/cart';
import { QcCheckbox, QcInputNumber, QcFixedWrap } from '@/components/common';
import QcProductItem from '@/components/common/product-item';
import { IMG_HOST } from '@/config';
import { toPriceYuan } from '@/utils/format';
import QcEmptyPage from '@/components/common/empty-page';
import { useTabbar } from '@/useHooks/useFlywheel';
import './index.scss';

interface IProductCart extends IProduct {
  specs: string;
  check: boolean;
  minOrderQuantity: number;
}

interface IStore {
  storeName: string;
  storeId: string;
  orderItems: IProductCart[];
}

function Cart() {
  const [products, setProducts] = useState<IStore[]>([]);
  const [allCheck, setAllCheck] = useState<boolean>(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [needLogin, setNeedLogin] = useState<boolean>(false);
  const [ids, setIds] = useState<string>('');
  useTabbar();
  useDidShow(() => {
    const memberInfo = Taro.getStorageSync('memberInfo');
    if (memberInfo.id) {
      setNeedLogin(false);
      apiPageCart();
    } else {
      setNeedLogin(true);
    }
  });

  function apiPageCart() {
    pageCart().then(res => {
      res.data.data.list.map((store: IStore) => {
        store.orderItems.map((product: IProductCart) => {
          product.check = false;
        });
      });
      setProducts(res.data.data.list);
      setIds('');
      setAllCheck(false);
      setPayAmount(0);
    });
  }
  /**
   * 删除购物车数据
   * @param id 商品id
   */
  function apiDeleteCart(id) {
    deleteCart(id).then(() => {
      apiPageCart();
    });
  }

  /**
   * 更换商品数量
   * @param e
   * @param storeIndex 门店下标
   * @param productIndex 商品下标
   * @param productId 商品id
   */
  function onChangeQty(e: number, storeIndex: number, productIndex: number, productId: string) {
    console.log(e);
    const qty = products[storeIndex].orderItems[productIndex].qty;
    const minOrderQuantity = products[storeIndex].orderItems[productIndex].minOrderQuantity || 1;
    if (e < minOrderQuantity && minOrderQuantity > 1) {
      Taro.showModal({ title: '温馨提示', content: `此商品最低起购${minOrderQuantity|| 1}件，您是否要删除此商品？` }).then(e => {
        if (e.confirm) {
          apiDeleteCart(productId);
        } else {
          products[storeIndex].orderItems[productIndex].qty =  minOrderQuantity;
          setProducts(data => [...data]);
        }
      });
      return
    }
    if (e === 0) {
      Taro.showModal({ title: '删除提示', content: '是否删除此商品？' }).then(e => {
        if (e.confirm) {
          apiDeleteCart(productId);
        } else {
          products[storeIndex].orderItems[productIndex].qty = 1;
          setProducts(data => [...data]);
        }
      });
      return;
    }
    if (qty < e) {
      addCartNum(productId).then(() => {
        total();
      });
    }
    if (qty > e) {
      deducteCartNumber(productId).then(() => {
        total();
      });
    }
    products[storeIndex].orderItems[productIndex].qty = e;
    setProducts(data => [...data]);
  }

  /**
   * 单个商品是否选中
   * @param value
   * @param storeIndex 门店下标
   * @param productIndex 商品下标
   */
  function selectProduct(value: boolean, storeIndex: number, productIndex: number) {
    products[storeIndex].orderItems[productIndex].check = value;
    setProducts(products);
    total();
  }
  /**
   * 控制全选
   * @param value
   */
  function selectAllProduct(value: boolean) {
    products.map((store: IStore) => {
      store.orderItems.map((product: IProductCart) => {
        product.check = value;
      });
    });
    setAllCheck(value);
    setProducts(products);
    total();
  }

  /**
   * 计算选中的总价，并且判断是否更新全选状态
   */
  function total() {
    let _allCheck = true;
    let _payAmount = 0;
    let _ids: string[] = [];
    products.map(store => {
      store.orderItems.map(product => {
        if (product.check) {
          _ids.push(product.id);
          _payAmount += product.qty * product.price;
        } else {
          _allCheck = false;
        }
      });
    });
    setIds(_ids.join('_'));
    setAllCheck(_allCheck);
    setPayAmount(_payAmount);
  }

  function onConfirm() {
    if (ids) {
      Taro.navigateTo({
        url: `/pagesMall/confirm-order/index?id=${ids}`
      });
    } else {
      Taro.showToast({
        title: '你还没有选择商品哦～',
        icon: 'none'
      });
    }
  }
  function jumpPage() {
    Taro.navigateTo({ url: '/pagesCoWebs/authorize/index' });
  }
  return (
    <View className='cart'>
      {needLogin ? (
        <View className='need-login'>
          <View>登录后才能记录你的购物车</View>
          <Button onClick={jumpPage} type='primary'>
            登录
          </Button>
        </View>
      ) : products.length > 0 ? (
        <Block>
          {products.map((store, storeIndex) => {
            return (
              <View key={store.storeId}>
                {store.orderItems.map((product, productIndex) => {
                  return (
                    <View className='product-item-cart' key={product.id}>
                      <QcCheckbox
                        value={product.check}
                        onChange={(e: boolean) => {
                          selectProduct(e, storeIndex, productIndex);
                        }}></QcCheckbox>
                      <View className='product-item-cart__content'>
                        <QcProductItem
                          iconUrl={IMG_HOST + product.iconUrl}
                          name={product.name}
                          specs={product.specs}
                          price={`￥${toPriceYuan(product.price)}`}>
                          <QcInputNumber
                            value={product.qty}
                            min={0}
                            onChange={(e: number) => {
                              onChangeQty(e, storeIndex, productIndex, product.id);
                            }}></QcInputNumber>
                        </QcProductItem>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
          <QcFixedWrap type='bottom'>
            <View className='cart-fixed-wrap'>
              <QcCheckbox
                value={allCheck}
                onChange={(e: boolean) => {
                  selectAllProduct(e);
                }}>
                全选
              </QcCheckbox>
              <View>
                <View className='cart-fixed-wrap__amount'>
                  合计：
                  <Text className='total-price'>¥{toPriceYuan(payAmount)}</Text>
                </View>
                <View className='cart-fixed-wrap__button' onClick={onConfirm}>
                  去结算
                </View>
              </View>
            </View>
          </QcFixedWrap>
        </Block>
      ) : (
        <QcEmptyPage icon='cart'></QcEmptyPage>
      )}
    </View>
  );
}
Cart.config = {
  navigationBarTitleText: '购物车'
};
export default Cart;
