import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import './index.scss';

import { IMG_HOST } from '@/config';
import util from '@/utils/util';

function ProductItem(props: any): JSX.Element {
  let { item, isDetele, style, index, onDelete, memberStatus } = props;

  const navigateTo = () => {
    let url = `/pagesMall/product/detail/index?id=${item.productId || item.id}`;
    if (item.groupShopping) url = `/pagesMall/group-product/detail/index?id=${item.groupShopping.id}`;
    Taro.navigateTo({
      url
    });
  };

  const handleDetele = (e: any) => {
    e.stopPropagation();
    onDelete && onDelete(item.id);
  };

  return style === 'flex' ? (
    <View className={`product-item-flex ${index !== 0 ? 'top-line' : ''}`} onClick={navigateTo}>
      <View className='left'>
        <Image src={IMG_HOST + (item.productIconUrl || item.iconUrl)} mode='aspectFill'></Image>
        {item.qty <= 0 && (
          <View className='sold-out'>
            <Text className='sold-out-text'>已售罄</Text>
          </View>
        )}
      </View>
      <View className='right'>
        <View className='top'>
          <View className='title'>{item.name}</View>
          {/* <View className="tag">0人团</View> */}
        </View>
        <View className='price-wrap'>
          <View className='price'>{util.filterPrice(item.price)}</View>
          {!isDetele && <View className='num'>已售{item.salesQty || 0}件</View>}
        </View>
      </View>
    </View>
  ) : (
    <View className='product-item' onClick={navigateTo}>
      <View className='img'>
        <Image src={IMG_HOST + (item.productIconUrl || item.iconUrl)} mode='aspectFill'></Image>
        {item.qty <= 0 && (
          <View className='sold-out'>
            <Text className='sold-out-text'>已售罄</Text>
          </View>
        )}
      </View>
      <View className='title'>{item.name || item.productName}</View>
      <View className='price-wrap'>
        <View className='price'>{util.filterPrice(memberStatus === 'vip_member' ? item.vipPrice : item.price)}</View>
        {!isDetele && <View className='num'>已售{item.salesQty || 0}件</View>}
      </View>
      {isDetele && (
        <View className='p-bottom-wrap'>
          <View>已售{item.salesQty || 0}件</View>
          <View className='qcfont qc-icon-like detele' onClick={handleDetele} />
        </View>
      )}
    </View>
  );
}

ProductItem.defaultProps = {
  item: {},
  index: 0,
  isDetele: false,
  style: 'normal'
};

ProductItem.options = {
  addGlobalClass: true
};

export default ProductItem;
