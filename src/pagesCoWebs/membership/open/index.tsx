import Taro, { useState, useEffect, useRouter } from '@tarojs/taro';
import { View, Text, Input, Image, Button, Block } from '@tarojs/components';
import './index.scss';

import api from '@/api/index';
import { login } from '@/api/common';
import { IMG_HOST } from '@/config';
import { LogoWrap, LoadingBox, ContentWrap } from '@/components/common';
import Utils from '@/utils/util';

export default function Index() {
  const [pageLoading, setPageLoading] = useState(true);
  const [code, setCode] = useState<string>('');
  const [detail, setDetail] = useState<any>({});
  const [model, setModel] = useState<any>({
    memberLevelFeeId: '',
    name: '',
    phone: '',
    company: '',
    position: '',
    payWay: ''
  });
  const [offline, setOffline] = useState<any>({});
  const [btnLoading, setBtnLoading] = useState(false);
  const [payConfig, setPayConfig] = useState({
    weChat: '0',
    public: '0'
  });

  const { id } = useRouter().params;

  useEffect(() => {
    Taro.login().then(res => setCode(res.code));
    memberLevelFeePage();
    memberLevelFeeGetOffline();
    const memberInfo = Taro.getStorageSync('memberInfo');
    setModel(prev => {
      return {
        ...prev,
        memberLevelFeeId: id,
        name: memberInfo.name || memberInfo.appellation || '',
        phone: memberInfo.mobile || memberInfo.phone || '',
        company: memberInfo.company || '',
        position: memberInfo.position || ''
      };
    });
    memberLevelFeePayConfig();
  }, []);

  const memberLevelFeePayConfig = async () => {
    const res = await Promise.all([api.memberLevelFeeWeChat(), api.memberLevelFeePublic()]);
    console.log('memberLevelFeePayConfig', res);
    const weChatData = res[0].data.data || {};
    const publicData = res[1].data.data || {};
    const payWay = weChatData.value == '1' ? 'weChat' : publicData.value == '1' ? 'public' : '';
    if (!payWay) {
      Taro.showModal({
        title: '提示',
        content: '支付方式未开启',
        showCancel: false
      });
      return;
    }
    setPayConfig({
      weChat: weChatData.value || '0',
      public: publicData.value || '0'
    });
    setModel(prev => {
      return {
        ...prev,
        payWay
      };
    });
  };

  const memberLevelFeePage = async () => {
    const res = await api.memberLevelFeePage();
    const data = res.data.data;
    const list = data.filter(item => item.id === id);
    const resEndTime = await api.memberLevelFeeGetEndTime({ memberLevelFeeId: id });
    list[0].entTime = resEndTime.data.data;
    setDetail(list[0]);
    setPageLoading(false);
  };

  const memberLevelFeeGetOffline = async () => {
    const res = await api.memberLevelFeeGetOffline();
    const data = res.data.data;
    setOffline(data);
  };

  const handleInput = (type: string, e: any) => {
    setModel(prev => {
      prev[type] = e.detail.value;
      return { ...prev };
    });
  };

  const handleSubmit = async () => {
    let flag = false;
    for (let key in model) {
      if (!model[key] && key !== 'payWay') flag = true;
    }
    if (flag) {
      Utils.showToast('请填写资料');
      return;
    }
    if (!model.payWay) {
      Utils.showToast('请选择支付方式');
      return;
    }
    if (!Utils.checkPhone(model.phone)) {
      Utils.showToast('手机格式不正确，请修改');
      return;
    }
    setBtnLoading(true);
    const res = await Taro.showModal({
      title: '提示',
      content: '是否确认提交？'
    });
    if (res.confirm) memberLevelFeePay(model);
    else setBtnLoading(false);
    // memberLevelFeePay(model);
  };

  const memberLevelFeePay = async (params: any) => {
    try {
      const res = await api.memberLevelFeePay(params);
      const data = res.data.data;
      if (data.payWay === 'public') {
        Utils.showToast('提交成功');
        setTimeout(() => {
          Taro.navigateBack({
            delta: 2
          });
        }, 1000);
        const memberInfo = Taro.getStorageSync('memberInfo');
        if (memberInfo && typeof memberInfo === 'object') {
          if (model.company) memberInfo.company = model.company;
          if (model.position) memberInfo.position = model.position;
          Taro.setStorage({ key: 'memberInfo', data: memberInfo });
        }
      } else {
        memberLevelPay({
          orderId: data.orderId,
          orderType: data.type,
          mchType: 3
        });
      }
    } catch (err) {
      console.error(err);
      setBtnLoading(false);
    }
  };
  const memberLevelPay = async (params: any) => {
    try {
      const res = await api.memberLevelPay(params);
      let payData = res.data.data;
      let payParams = {
        timeStamp: payData.timeStamp,
        nonceStr: payData.nonceString,
        package: payData.pack,
        signType: payData.signType,
        paySign: payData.paySign
      };
      requestPayment(payParams, params.orderId);
    } catch (err) {
      console.error(err);
      setBtnLoading(false);
    }
  };

  const requestPayment = async (params: any, orderId) => {
    try {
      await api.requestPayment(params);
      Utils.showToast('支付成功');
      setBtnLoading(false);
      setTimeout(() => {
        Taro.navigateBack({
          delta: 2
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      setBtnLoading(false);
      Utils.showToast('取消支付');
      cancelPay(orderId);
    }
  };

  const cancelPay = async (orderId: string) => {
    const res = await api.memberLevelFeeOrderCancelPay({ orderId });
  };

  // phone
  const handleItemPhoneNumber = async (e: any) => {
    if (!e.detail.encryptedData) {
      Taro.showToast({
        title: '授权失败，请重新授权',
        icon: 'none'
      });
      return;
    }
    Taro.showLoading({
      title: '获取中…',
      mask: true
    });
    let params = {
      code,
      encryptedData: e.detail.encryptedData,
      ivData: e.detail.iv
    };
    try {
      const res = await login(params);
      res.data.data.phone;
      setModel(prev => {
        return { ...prev, phone: res.data.data.phone };
      });
      Taro.hideLoading();
    } catch (err) {
      Taro.hideLoading();
    }
  };

  return (
    <View className='membership-open'>
      <LoadingBox visible={pageLoading} />
      <View className='relative'>
        <View className='info-wrap'>
          <View className='cover'>
            <Image src={IMG_HOST + detail.memberLevel.iconUrl} mode='aspectFill' />
          </View>
          <View className='info'>
            <View>{detail.name}</View>
            <View className='desc'>
              {/* <Text>
                有效期：
                {detail.type === 'day'
                  ? `${detail.length}天`
                  : detail.type === 'calendarYear'
                  ? '自然年'
                  : detail.type === 'postponeYear'
                  ? '延顺2年'
                  : ''}
              </Text> */}
              {detail.entTime && <Text>有效期：{detail.entTime.splice(10, detail.entTime.length)}</Text>}
              <Text>￥{Utils.filterPrice(detail.amount)}</Text>
            </View>
          </View>
        </View>
        <View className='member-info-wrap'>
          <View className='title'>
            <Text>会员资料</Text>
          </View>
          <View className='input-cell'>
            <Input placeholder='姓名（必填）' value={model.name} onInput={e => handleInput('name', e)} />
          </View>
          <View className='input-cell'>
            <Input
              placeholder='请点击获取手机（必填）'
              type='number'
              disabled
              value={model.phone}
              onInput={e => handleInput('phone', e)}
            />
            {/* <Button
              size='mini'
              openType='getPhoneNumber'
              hoverClass='hover-button'
              onGetPhoneNumber={handleItemPhoneNumber}>
              获取
            </Button> */}
          </View>
          <View className='input-cell'>
            <Input placeholder='公司（必填）' value={model.company} onInput={e => handleInput('company', e)} />
          </View>
          <View className='input-cell'>
            <Input placeholder='职位（必填）' value={model.position} onInput={e => handleInput('position', e)} />
          </View>
        </View>
        <View className='payway-wrap'>
          <View className='cell'>
            <View>支付方式</View>
          </View>
          {payConfig.weChat == '1' && (
            <View
              className='cell'
              onClick={() => {
                setModel(prev => {
                  return { ...prev, payWay: 'weChat' };
                });
              }}>
              <View></View>
              <View>
                <Text>微信支付</Text>
                <View className={`qcfont ${model.payWay === 'weChat' ? 'qc-icon-checked' : 'qc-icon-weixuanzhong'}`} />
              </View>
            </View>
          )}
          {payConfig.public == '1' && (
            <View
              className='cell'
              onClick={() => {
                setModel(prev => {
                  return { ...prev, payWay: 'public' };
                });
              }}>
              <View></View>
              <View>
                <Text>对公转账</Text>
                <View className={`qcfont ${model.payWay === 'public' ? 'qc-icon-checked' : 'qc-icon-weixuanzhong'}`} />
              </View>
            </View>
          )}
          {model.payWay === 'public' && offline && offline.content && (
            <Block>
              <ContentWrap content={offline.content} styles={{ background: '#f6f6f6', margin: '0 30px' }} />
              <View style={{ height: Taro.pxTransform(40) }}></View>
            </Block>
          )}
        </View>
      </View>
      <LogoWrap bottom={150} />

      <View className='bottom-bar'>
        <Button className='submit-btn' onClick={handleSubmit} loading={btnLoading} disabled={btnLoading}>
          确认提交￥{Utils.filterPrice(detail.amount)}
        </Button>
      </View>
    </View>
  );
}

Index.config = {
  navigationBarTitleText: '会员中心'
};
