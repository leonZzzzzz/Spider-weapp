import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import QcSplit from '../split';
import './index.scss';
type Props = {
  needSplit: boolean;
  children: JSX.Element;
};
function QcLayoutSplit(props: Props) {
  return (
    <View className='qc-layout-weight'>
      <View className='qc-layout-weight__body'>{props.children}</View>
      {props.needSplit && <QcSplit options={{ height: 15, backgroundColor: '#f1f1f1' }}></QcSplit>}
    </View>
  );
}
QcLayoutSplit.defaultProps = {
  needSplit: true
};
QcLayoutSplit.options = {
  addGlobalClass: true
}

export default QcLayoutSplit;
