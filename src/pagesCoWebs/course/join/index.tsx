import Taro, { useState, useEffect, useRouter } from '@tarojs/taro';
import { View, Input, Image, Button, Form, Text } from '@tarojs/components';
import util from '@/utils/util';
import api from '@/api/cowebs';
import { IMG_HOST } from '@/config';
import { LoadingBox, LogoWrap, Dialog, ThemeView } from '@/components/common';
import './index.scss';

export default function Index() {
  const [pageLoading, setPageLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const [signDataList, setSignDataList] = useState<any>([]);
  const [sign, setSign] = useState<any>({
    sourceId: '',
    sourceType: '',
    shareCode: '',
    shareMemberId: '',
    num: 1,
    price: 0,
    checkinSettingId: ''
    entryType: 3,
  });
  const [fileVisible, setFileVisible] = useState(false);
  const [fileIndex, setFileIndex] = useState(0);
  const query = useRouter().params;

  useEffect(() => {
    console.log('query', query);
    sign.sourceId = query.id;
    sign.checkinSettingId = query.checkinSettingId;
    sign.shareMemberId = query.shareMemberId;
    setSign(sign);
    courseGet(query.id);
  }, []);

  const courseGet = async (id: string) => {
    const res = await api.courseGet({ id });
    const data = res.data.data;
    const signDataList = formatForm(data.signDataSettingList);
    setDetail(data);
    sign.price = data.price || 0;
    setSignDataList(signDataList);
    setPageLoading(false);
    util.setNavigationBarTitle(data.title);
  };

  const formatForm = (list: any[]) => {
    const memberInfo = Taro.getStorageSync('memberInfo');
    return list.map((res: any) => {
      res.value = '';
      res.settingId = res.id;
      if (res.fieldName == 'name') {
        res.value = memberInfo.name || memberInfo.appellation || '';
      }
      if (res.fieldName == 'mobile') {
        res.value = memberInfo.mobile || memberInfo.phone || '';
      }
      if (res.fieldName == 'company') {
        res.value = memberInfo.company || '';
      }
      if (res.fieldName == 'position') {
        res.value = memberInfo.position || '';
      }
      if (res.options) {
        let options = res.options.split('_');
        res.options = options.map((option: string) => {
          return {
            value: option,
            label: option
          };
        });
      }
      if (res.type == 3) {
        res.value = [];
      }
      return res;
    });
  };

  const handleInput = (index: number, e: any) => {
    let _signDataList = JSON.parse(JSON.stringify(signDataList));
    _signDataList[index].value = e.detail.value;
    setSignDataList(_signDataList);
  };

  const handleRadioChange = (type: string, index: number, oIndex: number) => {
    console.log(type, index, oIndex);
    let _signDataList = JSON.parse(JSON.stringify(signDataList));
    let options = _signDataList[index].options;
    if (type === 'radio') {
      options.map((option: any, i: number) => {
        if (i === oIndex) option.checked = !option.checked;
        else option.checked = false;
      });
    } else {
      options[oIndex].checked = !options[oIndex].checked;
    }
    const list = options.filter((option: any) => option.checked);
    const value = list.map((item: any) => item.value).join('_');
    _signDataList[index].options = options;
    _signDataList[index].value = value;
    setSignDataList(_signDataList);
    console.log(_signDataList[index]);
  };

  const showFileVisible = (index: number) => {
    setFileIndex(index);
    setFileVisible(true);
  };
  const chooseImage = async (index: number) => {
    let _signDataList = JSON.parse(JSON.stringify(signDataList));
    _signDataList[index].fileLoading = true;
    setSignDataList(_signDataList);
    console.log(index);
    try {
      const res = await Taro.chooseImage({
        count: 1
      });
      console.log('chooseImage res', res);
      const tempFile = res.tempFilePaths[0];
      console.log('chooseImage', tempFile);
      uploadFile(tempFile, index);
    } catch (err) {
      _signDataList[index].fileLoading = false;
      setSignDataList(_signDataList);
    }
  };

  const chooseMessageFile = async (index: number) => {
    let _signDataList = JSON.parse(JSON.stringify(signDataList));
    _signDataList[index].fileLoading = true;
    setSignDataList(_signDataList);
    console.log(index);
    try {
      const res: any = await Taro.chooseMessageFile({
        count: 1
      });
      const tempFile = res.tempFiles[0];
      console.log(tempFile);
      uploadFile(tempFile.path, index);
    } catch (err) {
      _signDataList[index].fileLoading = false;
      setSignDataList(_signDataList);
    }
  };

  const uploadFile = async (tempFile: any, index: number) => {
    Taro.showLoading({
      title: '正在上传附件',
      mask: true
    });
    let _signDataList = JSON.parse(JSON.stringify(signDataList));
    try {
      // const res: any = await api.uploadImg(tempFile.path, {imageType: 'activitySignFile'})
      const res: any = await api.uploadImg(tempFile, { imageType: 'activitySignFile' });
      console.log('uploadFile === ', res.data);
      Taro.hideLoading();
      _signDataList[index].file = tempFile.name;
      _signDataList[index].value = res.data.data.imageUrl;
      _signDataList[index].fileLoading = false;
      setSignDataList(_signDataList);
    } catch (err) {
      Taro.hideLoading();
      console.log('uploadFile err', err);
      Taro.showToast({
        title: '附件上传失败，请重新上传',
        icon: 'none'
      });
      _signDataList[index].fileLoading = false;
      setSignDataList(_signDataList);
    }
  };

  const handleSubmit = (e: any) => {
    let wxMiniFormId = e.detail.formId;
    sign.price = detail.isEnableFee && detail.activityFee && detail.activityFee.price ? detail.activityFee.price : 0;
    for (let i = 0; i < signDataList.length; i++) {
      let item = signDataList[i];
      if (item.fieldName == 'mobile' && !/^1[0-9]{10}$/.test(item.value)) {
        Taro.showToast({
          title: '手机格式不正确',
          icon: 'none'
        });
        return;
      }
      if (item.isRequired && item.value == '') {
        Taro.showToast({
          title: `请填写或勾选${item.name}`,
          icon: 'none'
        });
        return;
      }
      if (item.type == 3 && typeof item.value != 'string') {
        item.value = item.value.join('_');
      }
    }
    console.log({ ...query, sign, signDataList, wxMiniFormId });
    courseSignTemp({ ...query, sign, signDataList, wxMiniFormId });
  };
  const courseSignTemp = async (params: any) => {
    params.sign.sourceId = params.id;
    setBtnLoading(true);
    Taro.showLoading({
      title: '正在提交',
      mask: true
    });
    try {
      const res = await api.courseSignTemp(params);
      console.log(res.data.data);
      if (detail.advanceCharge && detail.advanceCharge > 0) {
        activityPay(res.data.data.id);
      } else {
        setBtnLoading(false);
        navigateTo('/pagesCoWebs/course/success/index');
      }
    } catch (err) {
      setBtnLoading(false);
    }
  };

  const activityPay = async (orderId: string, orderType = 3) => {
    let params = {
      orderId,
      orderType,
      mchType: 3
    };
    try {
      let payRes = await api.activityPay(params);
      let payData = payRes.data.data;
      let payParams = {
        timeStamp: payData.timeStamp,
        nonceStr: payData.nonceString,
        package: payData.pack,
        signType: payData.signType,
        paySign: payData.paySign
      };
      requestPayment(payParams);
    } catch (err) {
      setBtnLoading(false);
    }
  };
  const requestPayment = async (params: any) => {
    try {
      await api.requestPayment(params);
      Taro.showToast({
        title: '支付成功',
        icon: 'none'
      });
      setBtnLoading(false);
      setTimeout(() => {
        navigateTo('/pagesCoWebs/course/success/index');
      }, 1000);
    } catch (err) {
      console.log(err);
      setBtnLoading(false);
      Taro.showToast({
        title: '取消支付',
        icon: 'none'
      });
      setTimeout(() => {
        Taro.navigateBack();
      }, 2000);
    }
  };

  const navigateTo = (url: string) => {
    Taro.navigateTo({ url });
  };

  return (
    <ThemeView>
      <LoadingBox visible={pageLoading} />

      <View className='relative'>
        <View className='activity-wrap'>
          <View className='cover'>{detail.iconUrl && <Image src={IMG_HOST + detail.iconUrl} mode='aspectFill' />}</View>
          <View className='title-wrap'>
            <View className='title'>{detail.title}</View>

            <View className='time-price'>
              <View className='time-wrap'>
                <Text>学制：</Text>
                <Text className='time'>{detail.educationalSystem}</Text>
              </View>

              {detail.openPrepayment ? (
                <Text className='price'>{detail.price}</Text>
              ) : (
                <Text className='price'>{util.filterPrice(detail.advanceCharge)}</Text>
              )}
            </View>
          </View>
        </View>

        {signDataList.length && (
          <View className='sign-wrap'>
            <View className='title'>填写参加人信息</View>
            {signDataList.map((item: any, index: number) => {
              return (
                <View key={item.id}>
                  {item.type === 1 && (
                    <View className={`item ${index !== 0 ? 'top-line' : ''}`}>
                      <View className='label'>
                        <Text className='xin'>{item.isRequired ? '*' : ''}</Text>
                        {item.name}
                      </View>
                      <View className='value'>
                        <Input
                          value={item.value}
                          placeholder={`${item.name}${item.isRequired ? '(必填)' : ''}`}
                          onInput={e => handleInput(index, e)}
                        />
                      </View>
                    </View>
                  )}
                  {item.type === 2 && (
                    <View className={`radio-item ${index !== 0 ? 'top-line' : ''}`}>
                      <View className='label'>
                        <Text className='xin'>{item.isRequired ? '*' : ''}</Text>
                        {item.name}（单选）
                      </View>
                      <View className='radio-group'>
                        {item.options.map((option: any, k: number) => {
                          return (
                            <View
                              className='radio-cell'
                              hoverClass='hover-white-color'
                              onClick={() => handleRadioChange('radio', index, k)}>
                              <Text
                                className={`qcfont ${
                                  option.checked ? 'qc-icon-danxuan3 qcfont-active' : 'qc-icon-danxuan'
                                }`}
                              />
                              <Text>{option.value}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}
                  {item.type === 3 && (
                    <View className={`radio-item ${index !== 0 ? 'top-line' : ''}`}>
                      <View className='label'>
                        <Text className='xin'>{item.isRequired ? '*' : ''}</Text>
                        {item.name}（多选）
                      </View>
                      <View className='radio-group'>
                        {item.options.map((option: any, k: number) => {
                          return (
                            <View
                              className='radio-cell'
                              hoverClass='hover-white-color'
                              onClick={() => handleRadioChange('checkbox', index, k)}>
                              <Text
                                className={`qcfont ${
                                  option.checked ? 'qc-icon-newxuanzhongduoxuan qcfont-active' : 'qc-icon-duoxuan2'
                                }`}
                              />
                              <Text>{option.value}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}
                  {item.type === 7 && (
                    <View className={`item ${index !== 0 ? 'top-line' : ''}`}>
                      <View className='label'>
                        <Text className='xin'>{item.isRequired ? '*' : ''}</Text>
                        {item.name}
                      </View>
                      <View className='value'>
                        {item.value && <Text className='file'>{item.value}</Text>}
                        <Button type='primary' loading={item.fileLoading} onClick={() => showFileVisible(index)}>
                          {item.value ? '重选' : '上传'}
                        </Button>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <View className='sign-btn'>
          <Form reportSubmit onSubmit={handleSubmit}>
            {detail.openPrepayment && detail.advanceCharge ? (
              <Button formType='submit' hoverClass='hover-button' loading={btnLoading}>
                预付款{util.filterPrice(detail.advanceCharge)}元
              </Button>
            ) : (
              <Button formType='submit' hoverClass='hover-button' loading={btnLoading}>
                确认提交
              </Button>
            )}
          </Form>
        </View>
      </View>
      <LogoWrap />

      <Dialog visible={fileVisible} onClose={() => setFileVisible(false)} position='bottom'>
        <View className='share-btn-dialog'>
          <Button className='item' plain hoverClass='hover-item' onClick={() => chooseImage(fileIndex)}>
            <View className='qcfont qc-icon-haibao1' />
            <View>从相册中选择</View>
          </Button>
          <Button className='item' plain hoverClass='hover-item' onClick={() => chooseMessageFile(fileIndex)}>
            <View className='qcfont qc-icon-dingdan1' />
            <View>从会话中选择</View>
          </Button>
        </View>
      </Dialog>
    </ThemeView>
  );
}

Index.config = {
  navigationBarTitleText: '课程报名'
};
