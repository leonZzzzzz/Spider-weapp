import { View, Image, Text } from '@tarojs/components';
import { IMG_HOST } from '@/config';
import { useEffect, useState } from '@tarojs/taro';
import api from '@/api';
import Utils from '@/utils/util';
import classnames from 'classnames';
import './index.scss';

function QcMallSingle(props) {
  const [list, setList] = useState<any>([{ price: '', origPrice: '' }]);
  const { options } = props;

  useEffect(() => {
    // const query = Taro.createSelectorQuery();
    // query.select('#QcMallSingle').boundingClientRect();
    // query.selectViewport().scrollOffset();
    // query.exec(function(res) {
    //   console.log(res);
    //   res[0].top; // #the-id节点的上边界坐标
    //   res[1].scrollTop; // 显示区域的竖直滚动位置
    // });
    const ids = props.options.item.map(item => item.id);
    productPageByIds(ids.join('_'));
    Taro.eventCenter.on('pullDownRefresh', () => {
      productPageByIds(ids.join('_'));
    });
    return () => {
      Taro.eventCenter.off('pullDownRefresh');
    };
  }, []);
  const productPageByIds = async idStr => {
    const res = await api.productPageByIds({ idStr });
    setList(res.data.data.list[0] || {});
  };
  return (
    <View
      id='QcMallSingle'
      className={classnames(
        'qc-mall-single',
        'relative',
        { 'qc-mall-single--top-radio': options.topRadio },
        { 'qc-mall-single--bottom-radio': options.bottomRadio }
      )}
      onClick={() => {
        Taro.navigateTo({ url: `/pagesMall/product/detail/index?id=${list.id}` });
      }}>
      <View className='qc-mall-single__banner'>
        <Image mode='widthFix' style='width:100%' src={IMG_HOST + options.cover}></Image>
        {list[0].qty <= 0 && (
          <View className='sold-out'>
            <Text className='sold-out-text'>已售罄</Text>
          </View>
        )}
      </View>
      <View className='qc-mall-single__product'>
        <View className='qc-mall-single__product-name'>{list.name}</View>
        <View className='qc-mall-single__product-other'>
          <View className='qc-mall-single__product-price'>
            <Text className='qc-mall-single__product-now'>￥{Utils.filterPrice(list.price)}</Text>
            <Text className='qc-mall-single__product-orig'>原价￥{Utils.filterPrice(list.origPrice)}</Text>
          </View>
          <View
            className={`qc-mall-single__product-button ${
              list[0].qty <= 0 ? 'qc-mall-single__product-button--none' : ''
            }`}>
            {list[0].qty <= 0 ? '已售罄' : '立刻购买'}
          </View>
        </View>
      </View>
    </View>
  );
}

QcMallSingle.defaultProps = {
  options: {
    item: [],
    cover: ''
  }
};

QcMallSingle.options = {
  addGlobalClass: true
};

export default QcMallSingle;
