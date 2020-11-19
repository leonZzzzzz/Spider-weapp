import Taro, { useState, useEffect, useRouter } from '@tarojs/taro';
import { View, Text, Image, Form, Button, Input, Picker } from '@tarojs/components';
import { AtTextarea } from 'taro-ui';
import { LoadingBox, ThemeView } from '@/components/common';
import util from '@/utils/util';
import api from '@/api/mall';
import { uploadImg } from '@/api/common';
import { IMG_HOST } from '@/config';
import './index.scss';

export default function AfterSaleCompensate() {
  const [pageLoading, setPageLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [amount, setAmount] = useState(''); // 填写申请赔付的金额
  const [reason, setReason] = useState(''); // 赔付原因
  const [reasonType, setReasonType] = useState(''); // 赔付原因类型
  const [remark, setRemark] = useState(''); // 备注
  const [proofImgs, setProofImgs] = useState<any[]>([]); // 上传凭证
  const [count] = useState(3); // 上传图片数量
  const [limitSize] = useState(5); // 上传图片限制  5mb
  const [reasonRange, setReasonRange] = useState<any[]>([]); // 原因列表
  const [reasonIndex, setReasonIndex] = useState(0);

  const { id } = useRouter().params;

  useEffect(() => {
    getOrderCompensationReasonType();
  }, []);

  // 获取赔付原因类型
  const getOrderCompensationReasonType = async () => {
    const res = await api.getOrderCompensationReasonType();
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
    setProofImgs(prevProofImgs => {
      prevProofImgs.splice(index, 1);
      return [...prevProofImgs];
    });
  };

  const submit = async (e: any) => {
    if (btnLoading) return;
    const reg = /^(\d+)(\.\d{1,2})?$/;
    if (!reg.test(amount.toString())) {
      util.showToast('金额只能是数字且小数点后不超过2位');
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
    let image = proofImgs.join(',');
    let params: any = {
      orderId: id,
      reasonType,
      reason: remark,
      image,
      amount: util.mul(Number(amount), 100)
    };
    if (e.detail && e.detail.formId) {
      params.wxMiniFormId = e.detail.formId;
    }
    try {
      await api.applyOrderCompensation(params);
      let url = `/pagesMall/after-sale/compensate/result/index?id=${id}`;
      util.navigateTo(url);
      setBtnLoading(false);
      util.showLoading(false);
    } catch (err) {
      // util.showLoading(false);
      setBtnLoading(false);
    }
  };

  // 选择原因
  const onPickerChange = (e: any) => {
    let index = e.detail.value;
    let item = reasonRange[index];
    setReason(item.name);
    setReasonType(item.value);
    setReasonIndex(index);
  };

  return (
    <ThemeView>
      <View className='page-apply-after-compensate'>
        <LoadingBox visible={pageLoading} />

        <View className='cell-item'>
          <View className='title'>申请赔付金额</View>
          <View className='content right'>
            <Input
              className='price-input'
              type='text'
              value={amount}
              placeholder='请输入金额'
              onInput={(e: any) => setAmount(e.detail.value)}
            />
            <View className='m-l-1'>元</View>
          </View>
        </View>
        <View className='cell-item'>
          <View className='title'>申请赔付原因</View>
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
            <AtTextarea
              value={remark}
              placeholder={`说明（选其他时必填）`}
              maxLength={100}
              onChange={(e: any) => setRemark(e.detail.value)}
            />
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

AfterSaleCompensate.config = {
  navigationBarTitleText: '申请赔付'
};
