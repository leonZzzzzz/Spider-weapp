import Taro, { useState, useEffect, useRouter } from '@tarojs/taro';
import { View, Text, Image, Form, Button, Picker } from '@tarojs/components';
import { AtTextarea } from 'taro-ui';
import { LoadingBox, ThemeView } from '@/components/common';
import util from '@/utils/util';
import api from '@/api/mall';
import { uploadImg } from '@/api/common';
import { IMG_HOST } from '@/config';
import './index.scss';

export default function AfterSaleAction() {
  const [pageLoading, setPageLoading] = useState(true);
  const [returnPrice, setReturnPrice] = useState(0); // 退款金额
  const [proofImgs, setProofImgs] = useState<any[]>([]); // 上传凭证
  const [count] = useState(3); // 上传图片数量
  const [limitSize] = useState(5); // 上传图片限制  5mb
  const [orderItems, setOrderItems] = useState<any[]>([]); // 售后商品
  const [orderPrice, setOrderPrice] = useState(0); // 订单总金额
  const [reason, setReason] = useState(''); // 售后原因
  const [reasonType, setReasonType] = useState(''); // 售后原因类型
  const [remark, setRemark] = useState(''); // 备注
  const [reasonText, setReasonText] = useState(''); // 售后类型文字
  const [reasonRange, setReasonRange] = useState<any[]>([]); // 原因列表
  const [reasonIndex, setReasonIndex] = useState(0);

  const [btnLoading, setBtnLoading] = useState(false);

  // type: 售后方式 1:退货 2：换货 3：退款
  const { id, type } = useRouter().params;
  useEffect(() => {
    const text = Number(type) === 2 ? '换货原因' : Number(type) === 3 ? '退款原因' : '退货原因';
    util.setNavigationBarTitle(text);
    setReasonText(text);
    getReasonRange(id, Number(type));
    const orderItems = JSON.parse(Taro.getStorageSync('checkData'));
    let orderPrice = 0;
    orderItems.forEach((item: any) => {
      orderPrice += item.price * item.selectQty;
    });
    setOrderItems(orderItems);
    setOrderPrice(orderPrice);
    setReturnPrice(util.filterPrice(orderPrice));

    return () => {
      Taro.removeStorageSync('checkData');
    };
  }, []);

  // 获取不同售后类型的原因
  // type:选择的售后类型 1:退货 2：换货 3：退款
  const getReasonRange = async (id: string, type: number) => {
    const apiStr = type === 1 ? 'returnGoodsReasonType' : type === 2 ? 'exchangeGoodsReasonType' : 'refundReasonType';
    const res = await api[apiStr]({ orderId: id });
    setReasonRange(res.data.data);
    setPageLoading(false);
  };

  // 选择图片
  const onChooseImage = async () => {
    const res = await Taro.chooseImage({
      count: count - proofImgs.length
    });
    console.log('choose image res :', res);
    handleWxChooseImage(res.tempFiles, count);
  };

  // 处理小程序端的选择图片上传
  const handleWxChooseImage = (tempFiles: any[], count: number) => {
    if (!tempFiles.length) return;

    if (tempFiles.length + proofImgs.length > count) {
      util.showToast(`最多上传${count}张图片`);
      return;
    } else {
      util.showLoading(true, '上传图片中...');
      let promiseArray: any[] = [];
      // for (let file of tempFiles) {
      for (let i = 0; i < tempFiles.length; i++) {
        const file = tempFiles[i];
        // 判断选择的图片大小
        const fileSize = file.size / 1024 / 1024;
        if (fileSize > limitSize) {
          util.showToast(`大于${limitSize}MB的图片将不会上传`);
        } else {
          let promise = uploadImg(file.path, { imageType: 'afterSale' });
          promiseArray.push(promise);
        }
      }
      Promise.all(promiseArray)
        .then(result => {
          console.log('[result] :', result);
          const _proofImgs = result.map(res => res.data.data.imageUrl);
          setProofImgs(prevProofImgs => {
            return [...prevProofImgs, ..._proofImgs];
          });
          util.showLoading(false);
        })
        .catch(err => {
          console.error('upload err :', err);
          // util.showLoading(false);
        });
    }
  };

  // 删除上传的凭证
  const deleteProofImg = (index: number) => {
    console.log(index);
    setProofImgs(prevProofImgs => {
      prevProofImgs.splice(index, 1);
      return [...prevProofImgs];
    });
  };

  const submit = async (e: any) => {
    if (btnLoading) return;

    let reg = /^(\d+)(\.\d{1,2})?$/;
    if (!reg.test(returnPrice.toString())) {
      util.showToast('金额只能是数字且小数点后不超过2位');
      return;
    }
    // 如果是选择了仅退款
    if (Number(type) === 3 && returnPrice > util.filterPrice(orderPrice)) {
      util.showToast(`退款金额不能超过${util.filterPrice(orderPrice)}元`);
      return;
    }
    if (!reason) {
      util.showToast('请选择原因');
      return;
    }
    if (reason === '其他' && !remark) {
      util.showToast('请填写说明');
      return;
    }
    setBtnLoading(true);
    util.showLoading(true, '提交中');

    const afterSalesItemList = orderItems.map(item => {
      return {
        orderItemId: item.id,
        qty: item.selectQty
      };
    });
    const voucherImage = proofImgs.join(',');
    const params: any = {
      orderId: id,
      reasonType,
      reason: remark,
      voucherImage,
      afterSalesItemList
    };
    if (e.detail && e.detail.formId) {
      params.wxMiniFormId = e.detail.formId;
    }
    try {
      // type === 1 申请退货        type === 2 申请换货      type === 3 申请退款
      const apiStr =
        Number(type) === 1 ? 'returnGoodsApply' : Number(type) === 2 ? 'exchangeGoodsApply' : 'refundApply';
      const res = await api[apiStr](params);
      const url = `/pagesMall/after-sale/detail/index?id=${res.data.data}`;
      Taro.redirectTo({ url });
      util.showLoading(false);
      setBtnLoading(false);
    } catch (error) {
      console.log('submit error:', error);
      setBtnLoading(false);
    }
  };

  // 选择原因
  const onPickerChange = (e: any) => {
    const index = e.detail.value;
    const item = reasonRange[index];
    setReason(item.name);
    setReasonType(item.value);
    setReasonIndex(index);
  };

  return (
    <ThemeView>
      <View className='page-apply-after-action'>
        <LoadingBox visible={pageLoading} />

        <View className='product-list'>
          {orderItems.map((item: any) => {
            return (
              <View className='product-list__item' key={item.id}>
                <View className='cover'>
                  <Image className='img' mode='aspectFill' src={IMG_HOST + item.iconUrl} />
                </View>
                <View className='info'>
                  <View className='name'>{item.name}</View>
                  <View className='specs'>{item.specs}</View>
                  <View className='price-qty'>
                    <View className='price'>￥{util.filterPrice(item.price)}</View>
                    <View className='qty'>x{item.selectQty}</View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
        {Number(type) === 3 && (
          <View className='cell-item'>
            <View className='title'>退款金额</View>
            <View className='content'>
              <View className='price'>￥{returnPrice}</View>
            </View>
          </View>
        )}
        <View className='cell-item'>
          <View className='title'>{reasonText}</View>
          <View className='content'>
            <Picker
              className='picker'
              mode='selector'
              range={reasonRange}
              rangeKey='name'
              onChange={onPickerChange}
              value={reasonIndex}>
              <View className='picker__inner'>
                {reason ? <Text className='value'>{reason}</Text> : <Text className='placeholder'>请选择原因</Text>}
                <Text className='qcfont qc-icon-chevron-right rotate' />
              </View>
            </Picker>
          </View>
        </View>
        <View className='action-item'>
          <View className='textarea-wrapper'>
            {!pageLoading && (
              <AtTextarea
                value={remark}
                placeholder={`说明（选其他时必填）`}
                maxLength={100}
                onChange={e => setRemark(e.detail.value)}
              />
            )}
          </View>
        </View>
        <View className='action-item'>
          <View className='title'>上传凭证</View>
          <View className='img-list'>
            {proofImgs.map((item, index) => {
              return (
                <View className='img-list__item' key={item}>
                  <Image className='img-item' mode='aspectFit' src={IMG_HOST + item} />
                  <View className='qcfont qc-icon-guanbi' onClick={() => deleteProofImg(index)} />
                </View>
              );
            })}
            {proofImgs.length < count && (
              <View className='img-list__item' onClick={onChooseImage}>
                <View className='qcfont qc-icon-haibao' />
                <View className='content'>上传凭证</View>
                <View className='desc'>(最多{count}张)</View>
              </View>
            )}
          </View>
        </View>
        <View className='btn-wrapper'>
          <Form reportSubmit onSubmit={submit}>
            <Button className='primary-btn no-radius' formType='submit' loading={btnLoading}>
              提交
            </Button>
          </Form>
        </View>
      </View>
    </ThemeView>
  );
}
