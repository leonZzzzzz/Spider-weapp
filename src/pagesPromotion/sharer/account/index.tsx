import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, Text, Button, Input } from '@tarojs/components';
import api from '@/api/index';
import util from '@/utils/util';
import { LoadingBox, LogoWrap, Dialog, ThemeView } from '@/components/common';

import { useSelector, useDispatch } from '@tarojs/redux';
import { sharerInitSummary } from '@/store/actions/sharer';
import './index.scss';

export default function Index() {
  const [btnLoading, setBtnLoading] = useState(false);
  const { summary } = useSelector((state: any) => state.sharer);
  const dispatch = useDispatch();
  const [pageLoading, setPageLoading] = useState(true);
  const [model, setModel] = useState<any>({
    amount: '',
    withdrawAccount: '',
    withdrawName: ''
  });
  const [config, setConfig] = useState<any>({});
  const [visibleTip, setVisibleTip] = useState(false);
  const [poundage, setPoundage] = useState(0);

  useEffect(() => {
    getWithdrawAccount();
  }, []);

  const getWithdrawAccount = async () => {
    const res = await api.sharerGetWithdrawAccount();
    const data = res.data.data;
    setModel({
      amount: '',
      withdrawAccount: data.withdrawAccount,
      withdrawName: data.withdrawName
    });
    setPageLoading(false);
    const configRes = await api.withdrawConfigGet();
    const config = configRes.data.data;
    setConfig(config);
  };

  const handleSubmit = async () => {
    if (!model.withdrawAccount || !model.withdrawName) {
      util.showToast(`${!model.withdrawAccount ? '请输入银行卡号' : '请输入姓名'}`);
      return;
    }
    if (!model.amount) {
      util.showToast('请输入金额', 'none', 2000, false);
      return;
    }
    if (summary.wallet === 0) {
      util.showToast('可提现余额为0', 'none', 2000, false);
      return;
    }
    console.log(model);
    let _model = JSON.parse(JSON.stringify(model));
    // _model.amount = _model.amount.replace(/^\s*|\s*$/g, '');
    const amount = _model.amount.toString().replace(/^\s*|\s*$/g, '');
    const reg = /((^[1-9]\d*)|^0)(\.\d{0,2}){0,1}$/;
    if (!reg.test(amount)) {
      const str = amount.split('.');
      if (str.length === 2 && str[1].length > 2 && !isNaN(Number(str[1]))) {
        util.showToast('金额最多到小数点后两位，请重新输入', 'none', 2000, false);
      } else {
        util.showToast('金额格式错误，请重新输入', 'none', 2000, false);
      }
      return;
    }
    _model.amount = util.mul(_model.amount, 100);
    if (_model.amount === 0 || _model.amount > summary.wallet) {
      util.showToast(`金额需大于0并且不可大于可提现余额`, 'none', 2000, false);
      return;
    }

    let poundage = (_model.amount * config.poundageRate) / 100;
    if (poundage <= config.minPoundage) {
      poundage = config.minPoundage;
    }
    Math.ceil(poundage);
    setPoundage(Math.ceil(poundage));

    setBtnLoading(true);
    setVisibleTip(true);
  };

  const handleTipConfirm = (status: boolean) => {
    setVisibleTip(false);
    if (!status) {
      setBtnLoading(false);
      return;
    }
    util.showLoading(true, '正在提交');
    let _model = JSON.parse(JSON.stringify(model));
    _model.amount = util.mul(_model.amount, 100);
    sharerCommissionWithdraw(_model);
  };

  const sharerCommissionWithdraw = async (params: any) => {
    try {
      const res = await api.sharerCommissionWithdraw(params);
      const data = res.data.data;
      sharerSummary();
      console.log(data);
      setModel(prev => {
        return { ...prev, amount: '' };
      });
      setBtnLoading(false);
      util.showLoading(false);
      util.navigateTo(`/pagesPromotion/sharer/withdrawal-status/index?id=${data.id}`);
    } catch (err) {
      console.error(err);
      setBtnLoading(false);
      // util.showLoading(false);
    }
  };
  const sharerSummary = async () => {
    const res = await api.sharerSummary();
    dispatch(sharerInitSummary(res.data.data));
  };

  return (
    <ThemeView>
      <View className='account'>
        <LoadingBox visible={pageLoading} />

        <View className='relative'>
          <View className='take-card'>
            <View className='input-box'>
              <Text className='label'>银行卡号</Text>
              <Input
                placeholder='请输入银行卡号'
                value={model.withdrawAccount}
                onInput={e => {
                  setModel((prev: any) => {
                    return { ...prev, withdrawAccount: e.detail.value };
                  });
                }}
              />
            </View>
            <View className='input-box'>
              <Text className='label'>收 款 人</Text>
              <Input
                placeholder='请输入姓名'
                value={model.withdrawName}
                onInput={e => {
                  setModel((prev: any) => {
                    return { ...prev, withdrawName: e.detail.value };
                  });
                }}
              />
            </View>
            <View className='input-box'>
              <Text className='symbol'>￥</Text>
              <Input
                value={model.amount}
                disabled={summary.wallet === 0}
                type='digit'
                onInput={e => {
                  setModel((prev: any) => {
                    return { ...prev, amount: e.detail.value };
                  });
                }}
              />

              <Button
                className='all'
                disabled={summary.wallet === 0}
                onClick={() => {
                  setModel((prev: any) => {
                    return { ...prev, amount: util.chu(summary.wallet, 100) };
                  });
                }}>
                全部提现
              </Button>
            </View>
            {config.description && <View className='grey'>{config.description}</View>}
            <View className='grey'>可提现余额 ￥{util.filterPrice(summary.wallet)}</View>
            <Button className='take-btn' type='primary' onClick={handleSubmit}>
              提现至银行卡
            </Button>
          </View>
        </View>

        <View
          className='complete-card'
          hoverClass='hover-white-color'
          onClick={() => util.navigateTo('/pagesPromotion/sharer/account-details/index')}>
          <View>
            <Text className='qcfont qc-icon-yitixian' />
            <Text className='total-amount'>已提现（￥{util.filterPrice(summary.withdrawed)}）</Text>
          </View>
          <View className='qcfont qc-icon-chevron-right'></View>
        </View>
      </View>

      <LogoWrap />

      <Dialog visible={visibleTip} isMaskClick={false}>
        <View className='tip-dialog'>
          <View>是否确认提现？</View>
          <View className='content'>
            {/* <View>是否确认提现？</View> */}
            <View>银行卡号：{model.withdrawAccount}</View>
            <View>收款人：{model.withdrawName}</View>
            <View>提现金额：￥{model.amount}</View>
            {poundage > 0 && <View className='grey'>每笔提现收取手续费{util.filterPrice(poundage)}元</View>}
          </View>
          <View className='tip-btn-wrap'>
            <Button onClick={() => handleTipConfirm(false)}>取消</Button>
            <Button className='tip-btn' onClick={() => handleTipConfirm(true)}>
              确认
            </Button>
          </View>
        </View>
      </Dialog>
    </ThemeView>
  );
}

Index.config = {
  navigationBarTitleText: '我的账户'
};
