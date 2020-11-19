import { View } from '@tarojs/components';

import './index.scss';

import util from '@/utils/util';

function WalletItem(props: any): JSX.Element {
  const { item, index } = props;

  return (
    <View className={`wallet-item ${index !== 0 ? 'line' : ''}`}>
      <View className='left'>
        <View className='title'>{item.detail}</View>
        <View className='time'>{item.createTime}</View>
      </View>
      <View className='right'>
        <View className='price add'>{util.filterPrice(item.amount)}</View>
        {/* {item.type === 'add' ?
          <View className="price add">+￥{item.currentAmount}</View>
          :
          <View className="price subtract">-￥{item.price}</View>
        } */}
        <View className='balance'>余额：{util.filterPrice(item.walletAmount)}</View>
      </View>
    </View>
  );
}

WalletItem.defaultProps = {
  item: {}
};

export default WalletItem;
