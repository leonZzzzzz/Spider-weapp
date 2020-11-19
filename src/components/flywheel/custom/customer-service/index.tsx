import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, Button, Image } from '@tarojs/components';
import { Dialog, ThemeView } from '@/components/common';
import { IMG_HOST } from '@/config';
import api from '@/api/cowebs';
import './index.scss';

function QcCustomerService(props: any) {
  const { options } = props;
  const [visible, setVisible] = useState(false);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    getAppCustomer();
  }, []);

  const getAppCustomer = async () => {
    const res = await api.getAppCustomer();
    const data = res.data.data;
    setPhone(data.value || '');
  };

  const makePhoneCall = async () => {
    if (!phone) {
      Taro.showToast({
        title: '没有号码，请先配置',
        icon: 'none'
      });
      return;
    }
    try {
      await Taro.makePhoneCall({
        phoneNumber: phone || ''
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <ThemeView>
      <View className='qc-customer-service' onClick={() => setVisible(true)}>
        <Image src={IMG_HOST + options.icon} mode='widthFix' style='width:100%;' />
      </View>
      <Dialog visible={visible} position='center' onClose={() => setVisible(false)}>
        <View className='kefu-dialog'>
          <View className='kefu-btn'>
            <Button hoverClass='hover-button' onClick={makePhoneCall}>
              一键拨号
            </Button>
          </View>
          <View className='kefu-btn'>
            <Button hoverClass='hover-button' openType='contact'>
              联系微信客服
            </Button>
          </View>
        </View>
      </Dialog>
    </ThemeView>
  );
}

export default QcCustomerService;
