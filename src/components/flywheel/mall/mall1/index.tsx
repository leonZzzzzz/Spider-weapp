import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import { pageProduct } from '@/api/product';
import { IMG_HOST } from '@/config';
import { toPriceYuan } from '@/utils/format';
import { usePageConfig } from '@/useHooks/useFlywheel';
import './index.scss';
import Utils from '@/utils/util';

type Props = {
  options: {
    needSplit: boolean;
    cover: string;
    item: any[];
    dataType: string;
    search: any;
  };
};

function QcMall1(props: Props) {
  const { options } = props;

  const [search, setSearch] = useState({ pageSize: 4, pageNum: 1, categoryId: '' });
  const [list, setList] = useState<any[]>([]);

  const { background } = usePageConfig((Number(this.$router.path.substr(-1)) || 1) - 1);

  useEffect(() => {
    if (options.dataType == 'ProductCategory') {
      // 关联的分类
      console.log(options)
      if (options.item.length > 0) {
        setSearch({...search, categoryId: options.item[0].id});
        // 这里setSearch是异步的并不能马上最新的值，所以手动传进去
        apiPageProduct({categoryId: options.item[0].id});
      }
    } else if (options.item.length > 0) {
      setList(options.item);
    } else {
      setSearch(options.search);
      apiPageProduct();
    }
  }, []);

  async function apiPageProduct(param = {}) {
    const res = await pageProduct({...search, ...param});
    setList(res.data.data.list);
  }

  const navigateTo = (item: any) => {
    let url = `/pagesMall/product/detail/index?id=${item.productId || item.id}`;
    if (item.groupShopping) url = `/pagesMall/group-product/detail/index?id=${item.groupShopping.id}`;
    Taro.navigateTo({url})
  };

  const bannerNavigateTo = () => {
    if (options.dataType == 'ProductCategory' && options.item[0]) {
      Taro.setStorageSync('categoryId', options.item[0].id)
      Utils.navigateTo(options.item[0].url || '')
    }
  }

  return (
    <View className='mall1 relative' style={{ background }}>
      <View className='mall1__banner' onClick={bannerNavigateTo}>
        <Image className='cover' src={IMG_HOST + options.cover} mode='widthFix' style='width:100%' />
      </View>
      <View className='mall1__products'>
        {list &&
          list.map(item => {
            return (
              <View
                className='mall1__product'
                key={item.id}
                onClick={() => {
                  navigateTo(item);
                }}>
                <Image className='cover' mode='aspectFill' src={IMG_HOST + item.iconUrl} />
                <View className='mall1__product-title'>{item.name}</View>
                <View className='mall1__product-info'>
                  <View className='money'>
                    <Text className='price'>
                      ￥<Text className='count'>{toPriceYuan(item.price)}</Text>
                    </Text>
                  </View>
                  {Number(toPriceYuan(item.price)) < 10000 && <View className='orgin-price'>￥{toPriceYuan(item.origPrice)}</View>}
                </View>
              </View>
            );
          })}
      </View>
    </View>
  );
}
QcMall1.defaultProps = {
  options: {
    needSplit: false
  }
};

QcMall1.options = {
  addGlobalClass: true
};

export default QcMall1;
