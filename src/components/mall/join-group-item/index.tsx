import { View, Image } from '@tarojs/components';
import './index.scss';
import { IMG_HOST } from '@/config';
import util from '@/utils/util';
import Taro from '@tarojs/taro';

function JoinGroupItem(props: any): JSX.Element {
  let { state, item, groupQuantity } = props;

  const navigateTo = () => {
    let url = `/pagesMall/group-product/detail/index?id=${item.groupShoppingId}`;
    Taro.navigateTo({
      url
    });
  };

  return (
    <View className='join-assemble-item' onClick={navigateTo}>
      <View className='box'>
        <View className='qcfont qc-icon-jiaobiao'></View>
        <View className='tag'>{groupQuantity}人团</View>
        <View className='cover'>
          <Image mode='aspectFill' src={IMG_HOST + (item.iconUrl || item.cover)} />
        </View>
        <View className='info-wrap'>
          <View className='title'>{item.name || item.title}</View>
          <View className='price-wrap'>
            <View className='price'>{util.filterPrice(item.groupPrice)}</View>
          </View>
        </View>
        <View className='qcfont qc-icon-chevron-right right'></View>
      </View>
      {(state === 2 || state === -1) && (
        <View className='state'>
          <View
            className={`qcfont ${
              state === 2 ? 'qc-icon-pintuanchenggong success' : state === -1 ? 'qc-icon-pintuanshibai fail' : ''
            }`}></View>
        </View>
      )}
    </View>
  );
}

JoinGroupItem.options = {
  addGlobalClass: true
};

JoinGroupItem.defaultProps = {
  item: {}
};

export default JoinGroupItem;
