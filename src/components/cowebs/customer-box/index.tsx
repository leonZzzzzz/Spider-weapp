import Taro from '@tarojs/taro';
import { View, Text, Button } from '@tarojs/components';
import './index.scss';
import { ThemeView } from '@/components/common';

export default function CustomerBox(props: any) {
  const { visible, onClose } = props;
  const handleClose = () => {
    onClose && onClose();
  };

  return (
    visible && (
      <ThemeView>
        <View className='customer-box'>
          <View className='mask'></View>
          <View className='container'>
            <View className='btn'>
              <Button>
                <Text className='qcfont qc-icon-dianhua1' />
                <Text>电话开通</Text>
              </Button>
            </View>
            <View className='content'>
              <View>客服微信号</View>
              <View className='blue'>
                <Text>YUANRIJUAN</Text>
                <Text className='copy'>复制</Text>
              </View>
              <View className='grey'>复制微信号添加客服微信开通</View>
            </View>
            <View className='qcfont qc-icon-guanbi1 close' onClick={handleClose} />
          </View>
        </View>
      </ThemeView>
    )
  );
}

CustomerBox.defaultProps = {
  visible: false
};

CustomerBox.options = {
  addGlobalClass: true
};
