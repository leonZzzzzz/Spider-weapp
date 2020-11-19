import Taro, { useState, useEffect, useRouter } from '@tarojs/taro';
import { View, ScrollView, Image } from '@tarojs/components';
import { getCategorys } from '@/api/category';
import { pageProduct } from '@/api/product';
import { IMG_HOST } from '@/config';
import { toPriceYuan } from '@/utils/format';
import { useTabbar } from '@/useHooks/useFlywheel';
import './index.scss';

interface Category {
  id: string;
  name: string;
}

export default function Category() {
  const { categoryId } = useRouter().params;
  const [categorys, setCategorys] = useState<Category[]>([]);
  const [parentId, setParentId] = useState<string>(categoryId || Taro.getStorageSync('categoryId') || '');
  const [products, setProducts] = useState<any[]>([]);
  useTabbar();
  useEffect(() => {
    getCategoryList();
    return () => {
      Taro.removeStorageSync('categoryId')
    }
  }, []);

  useEffect(() => {
    pageProduct({ categoryId: parentId, storeId: '', pageSize: 100 }).then(res => {
      setProducts(res.data.data.list);
    });
  }, [parentId]);

  const getCategoryList = async () => {
    const res = await getCategorys();
    setCategorys(res.data.data);
  };

  const navigateTo = (item: any) => {
    let url = `/pagesMall/product/detail/index?id=${item.productId || item.id}`;
    if (item.groupShopping) url = `/pagesMall/group-product/detail/index?id=${item.groupShopping.id}`;
    Taro.navigateTo({
      url
    });
  };

  return (
    <View className='category'>
      <View className='category-fixed-wrap'>
        <ScrollView scroll-y className='category-fixed-wrap__left'>
          <View
            onClick={() => {
              setParentId('');
            }}
            className={'' == parentId ? 'tab tab-active' : 'tab'}>
            全部
          </View>
          {categorys.map(item => {
            return (
              <View
                onClick={() => {
                  setParentId(item.id);
                }}
                className={item.id == parentId ? 'tab tab-active' : 'tab'}
                key={item.id}>
                {item.name}
              </View>
            );
          })}
        </ScrollView>
        <ScrollView scroll-y className='category-fixed-wrap__right'>
          {products.map(item => {
            return (
              <View
                className='product'
                key={item.id}
                onClick={() => {
                  navigateTo(item);
                }}>
                <View className='product-img'>
                  <Image src={IMG_HOST + item.iconUrl} mode='aspectFill' />
                </View>
                <View className='product-info'>
                  <View className='name'>{item.name}</View>
                  <View className='other'>
                    <View className='price'>￥{toPriceYuan(item.price)}</View>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
Category.config = {
  navigationBarTitleText: '商品分类',
  enablePullDownRefresh: true
};
