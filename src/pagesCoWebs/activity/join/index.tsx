import Taro, { useState, useEffect, useRouter } from '@tarojs/taro';
import { View, Input, Image, Button, Form, Text } from '@tarojs/components';
// import { AtRadio, AtCheckbox } from 'taro-ui'
import util from '@/utils/util';
import api from '@/api/cowebs';
import { IMG_HOST } from '@/config';
import { LoadingBox, LogoWrap, Dialog, QcInputNumber } from '@/components/common';
import { login, getMemberInfo } from '@/api/common';
import { authorizeStatus } from '@/utils/authorize';
import './index.scss';
import { useTheme } from '@/useHooks/useFlywheel';

export default function ActivityJoin() {
  const [pageLoading, setPageLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const [code, setCode] = useState<string>('');
  const [paystatus, setPaystatus] = useState<string>('');
  const [id, setId] = useState<string>('');
  const [signDataList, setSignDataList] = useState<any>([]);
  const [sign, setSign] = useState<any>({
    sourceId: '',
    sourceType: '',
    shareCode: '',
    shareMemberId: '',
    num: 1,
    entryType: 3,
    checkinSettingId: ''
  });
  const [fileVisible, setFileVisible] = useState(false);
  const [fileIndex, setFileIndex] = useState(0);
  const [subscribe, setSubscribe] = useState(false);
  const [status] = useState(authorizeStatus());
  const [oneSignManyNum, setOneSignManyNum] = useState(1);
  const theme = useTheme();
  const query = useRouter().params;
  // miniProgramQrcodeScene

  useEffect(() => {
    Taro.login().then(res => {
      setCode(res.code);
    });
    console.log('query', query);
    sign.sourceId = query.id;
    sign.shareMemberId = query.shareMemberId;
    sign.checkinSettingId = query.checkinSettingId || '';
    let channelCodeId = Taro.getStorageSync('channelCodeId')
    if (channelCodeId) {
      sign.channelCodeId = channelCodeId
    }
    setSign(sign);

    let model: any = {};
    if (query.scene) model.id = query.scene;
    else model.id = query.id;
    activityGet(model);
    setId(model.id)
  }, []);

  const activityGet = async (params: any) => {
    const res = await api.activityGet(params);
    const data = res.data.data;
    const _signDataList = formatForm(data.signDataSettingList);
    if (data.isEnableFee) {
      if (data.activityFee.price > 0) {
        setPaystatus('wechat')
        data.activityFee.price = parseFloat(data.activityFee.price / 100).toFixed(2)
      } else {
        setPaystatus('point')
      }
    }
    setDetail(data);
    setSignDataList(_signDataList);
    console.log('signDataList ------', _signDataList);
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
            checked: false
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
      const tempFile = res.tempFilePaths[0];
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
    console.log('uploadFile', tempFile);
    Taro.showLoading({
      title: '正在上传附件',
      mask: true
    });
    let _signDataList = JSON.parse(JSON.stringify(signDataList));
    try {
      // const res: any = await api.uploadImg(path, {imageType: 'information'})
      const res: any = await api.uploadImg(tempFile, { imageType: 'activitySignFile' });
      console.log('uploadFile res === ', res.data);
      Taro.hideLoading();
      _signDataList[index].value = res.data.data.imageUrl;
      _signDataList[index].fileLoading = false;
      setSignDataList(_signDataList);
      setFileVisible(false);
    } catch (err) {
      Taro.hideLoading();
      console.log('uploadFile err', err);
      Taro.showToast({
        title: '附件上传失败，请重新上传',
        icon: 'none'
      });
      _signDataList[index].fileLoading = false;
      setSignDataList(_signDataList);
      setFileVisible(false);
    }
  };

  const timeout = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  // 已报名支付
  const appliedBtn = async () => {
    setBtnLoading(true);
    if (detail.isEnableFee && detail.payWay === 'online') {
      if (!paystatus) {
        setBtnLoading(false);
        Taro.showToast({
          title: '请选择支付方式',
          icon: 'none'
        })
        return
      } else {
        if (paystatus == 'wechat') {
          activityPay(detail.sign.id);
        } else if (paystatus == 'point') {
          Taro.showModal({
            title: '是否使用积分支付报名该活动？',
            success: (params) => {
              if (params.confirm) {
                pointpay(detail.sign.id)
              }
            }
          })
        }
      }
    }
  }
  // 未报名支付
  const handleSubmit = async (e: any) => {
    let wxMiniFormId = e.detail.formId || '';
    if (detail.isOneSignMany) sign.oneSignManyNum = oneSignManyNum;
    sign.price = detail.isEnableFee && detail.activityFee && detail.activityFee.price ? detail.activityFee.price : 0;
    console.log('sign', sign)
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

    let _query = JSON.parse(JSON.stringify(query));
    if (_query.scene) {
      _query.id = _query.scene;
      delete _query.scene;
    }
    console.log({ ..._query, sign, signDataList, wxMiniFormId });
    if (detail.isEnableFee && detail.payWay === 'online') {
      if (!paystatus) {
        setBtnLoading(false);
        Taro.showToast({
          title: '请选择支付方式',
          icon: 'none'
        })
        return
      } else {
        if (paystatus == 'point') {
          Taro.showModal({
            title: '是否使用积分支付报名该活动？',
            success: (params) => {
              if (params.confirm) {
                activitySign({ ..._query, sign, signDataList, wxMiniFormId });
              }
            }
          })
        } else if (paystatus == 'wechat') {
          activitySign({ ..._query, sign, signDataList, wxMiniFormId });
        }
      }
    } else {
      activitySign({ ..._query, sign, signDataList, wxMiniFormId });
    }

    // redirectTo(
    //   `/pagesCoWebs/activity/success/index?id=${detail.id}&title=${detail.title}&iconUrl=${detail.iconUrl}&showStyle=${
    //     detail.showStyle
    //   }${query.bindScene ? `&bindScene=${query.bindScene}` : ''}`
    // );
  };
  const activitySign = async (params: any) => {
    params.sign.price = Number(params.sign.price * 100)
    params.sign.sourceId = params.id;
    console.log('sign', params)
    setBtnLoading(true);
    Taro.showLoading({
      title: '正在提交',
      mask: true
    });
    try {
      const res = await api.activitySign(params);
      if (detail.activitySignSetting.isEnableAudit && !params.checkinSettingId) {
        // 开启审核 并且 checkinSettingId 不能存在 直接去审核页面
        setBtnLoading(false);
        redirectTo(
          `/pagesCoWebs/activity/success/index?type=wait&id=${detail.id}&title=${detail.title}&iconUrl=${
          detail.iconUrl
          }&showStyle=${detail.showStyle}${query.bindScene ? `&bindScene=${query.bindScene}` : ''}`
        );
      } else if (detail.isEnableFee && detail.payWay === 'online') {
        if (!paystatus) {
          setBtnLoading(false);
          Taro.showToast({
            title: '请选择支付方式',
            icon: 'none'
          })
          return
        } else {
          if (paystatus == 'wechat') {
            activityPay(res.data.message);
          } else if (paystatus == 'point') {
            pointpay(res.data.message)
          }
        }

      } else if (params.checkinSettingId) {
        // 没有开启审核，不用给钱，是空降嘉宾
        setBtnLoading(false);
        redirectTo(`/pagesCoWebs/activity/check/airborne/index?id=${params.checkinSettingId}`);
      } else {
        setBtnLoading(false);
        redirectTo(
          `/pagesCoWebs/activity/success/index?id=${detail.id}&title=${detail.title}&iconUrl=${
          detail.iconUrl
          }&showStyle=${detail.showStyle}${query.bindScene ? `&bindScene=${query.bindScene}` : ''}`
        );
      }
      const user = await getMemberInfo();
      Taro.setStorageSync('memberInfo', user.data.data);
    } catch (err) {
      Taro.hideLoading();
      setBtnLoading(false);
    }
  };
  // 积分支付
  const pointpay = async (signId) => {
    setBtnLoading(false);
    const res = await api.pointstatuspay(signId)
    if (res.data.code == 20000) {
      Taro.showToast({
        title: '支付成功',
        icon: 'none'
      });
      setBtnLoading(false);
      setTimeout(() => {
        redirectTo(
          `/pagesCoWebs/activity/success/index?id=${detail.id}&title=${detail.title}&iconUrl=${
          detail.iconUrl
          }&showStyle=${detail.showStyle}${query.bindScene ? `&bindScene=${query.bindScene}` : ''}`
        );
      }, 1000);
    } else {
      setBtnLoading(false);
      Taro.showToast({
        title: res.data.message,
        icon: 'none'
      })
    }
  }
  const activityPay = async (orderId: string, orderType = 2) => {
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
        if (query.checkinSettingId) {
          redirectTo(`/pagesCoWebs/activity/check/airborne/index?id=${query.checkinSettingId}`);
        } else {
          redirectTo(
            `/pagesCoWebs/activity/success/index?id=${detail.id}&title=${detail.title}&iconUrl=${
            detail.iconUrl
            }&showStyle=${detail.showStyle}${query.bindScene ? `&bindScene=${query.bindScene}` : ''}`
          );
        }
      }, 1000);
    } catch (err) {
      console.log(err);
      setBtnLoading(false);
      Taro.showToast({
        title: '取消支付',
        icon: 'none'
      });
      setTimeout(() => {
        if (detail.isEnableFee && detail.payWay === 'online') {
          Taro.navigateBack();
        }
      }, 2000);
    }
  };

  const redirectTo = async (url: string) => {
    Taro.hideLoading();
    Taro.redirectTo({ url });
  };

  const requestSubscribeMessage = async () => {
    try {
      const res = await util.requestSubscribeMessage('SIGN_STATUS');
      console.log('success', res);
      setSubscribe(true);
    } catch (err) {
      console.log('success', err);
    }
  };
  const handleItemPhoneNumber = async (idx: number, e: any) => {
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
      const user = await getMemberInfo();
      Taro.setStorageSync('memberInfo', user.data.data);
      signDataList[idx].value = res.data.data.phone;
      setSignDataList(() => {
        return [...signDataList];
      });
      Taro.hideLoading();
    } catch (err) {
      Taro.hideLoading();
    }
  };
  const updataRadio = async (e) => {
    console.log(e)
    setPaystatus(e.detail.value)
  }

  return (
    <View style={theme}>
      <LoadingBox visible={pageLoading} />
      <View className='relative'>
        <View className='activity-wrap'>
          <View className='cover'>{detail.iconUrl && <Image src={IMG_HOST + detail.iconUrl} mode='aspectFill' />}</View>
          <View className='title-wrap'>
            <View className='title'>{detail.title}</View>

            <View className='time-wrap'>
              <View className='itme'>{detail.startTimeStr}</View>
            </View>
            <View style='color:red'>
              {detail.isEnableFee ? (
                <Block>
                  {detail.activityFee.price > 0 && (<Text className='num'>{detail.activityFee.price} </Text>)}
                  {(detail.activityFee.price > 0 && detail.activityFee.point > 0) && (<text>|</text>)}
                  {detail.activityFee.point > 0 && (<Text> {detail.activityFee.point}积分</Text>)}
                </Block>
              ) : (
                  <View className='price'>免费</View>
                )}
            </View>
          </View>
        </View>
        {detail.isOneSignMany && (
          <View style='display: flex;padding: 10px;background: #fff;border-top: 1px solid #eee;justify-content: space-between;'>
            <View>数量</View>
            <View>
              <QcInputNumber
                min={1}
                max={detail.oneSignManyMaxNum}
                value={oneSignManyNum}
                width={100}
                onChange={e => {
                  setOneSignManyNum(e);
                }}></QcInputNumber>
            </View>
          </View>
        )}
        {signDataList.length && (
          <View className='sign-wrap'>
            <View className='title'>报名人信息</View>
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
                        {item.fieldName === 'mobile' && status === 'notAudit' && (
                          <Button
                            openType='getPhoneNumber'
                            hoverClass='hover-button'
                            onGetPhoneNumber={e => handleItemPhoneNumber(index, e)}>
                            获取号码
                          </Button>
                        )}
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
        {detail.isEnableFee && (
          <View className='paystate'>
            <RadioGroup onChange={updataRadio}>
              {detail.activityFee.price > 0 && (
                <View className='payment'>
                  <View>
                    <Image className='payicon' src='https://athena-1255600302.cosgz.myqcloud.com/attachments/null/2dfed3334f804870b8f3da3e8c5acfc8.png'></Image>
                    <Text>微信支付</Text>
                  </View>
                  <Radio value='wechat' checked="true"></Radio>
                </View>
              )}
              {detail.activityFee.point > 0 && (
                <View className='payment none'>
                  <View>
                    <Image className='payicon' src='https://athena-1255600302.cosgz.myqcloud.com/attachments/null/d616405b34dc413ea7a80d64efd0bdba.png'></Image>
                    <Text>积分支付</Text>
                  </View>
                  <Radio value='point' checked="{{detail.activityFee.price<=0?true:false}}"></Radio>
                </View>
              )}
            </RadioGroup>
          </View>
          // <Block>
          //   {detail.activityFee.price > 0 && (<Text className='num'>{util.filterPrice(detail.activityFee.price)} </Text>)}
          //   {(detail.activityFee.price > 0 && detail.activityFee.point > 0) && (<text>|</text>)}
          //   {detail.activityFee.point > 0 && (<Text> {detail.activityFee.point}积分</Text>)}
          // </Block>
        )}

        <View style={{ height: Taro.pxTransform(150) }}></View>
        <View className='sign-btn'>
          {(detail.sign && detail.sign.status == 4) ? (
            <Button formType='submit' hoverClass='hover-button' onClick={appliedBtn} loading={btnLoading}>支付</Button>
          ) : (
              <Form reportSubmit onSubmit={handleSubmit}>
                {detail.isEnableFee && detail.payWay === 'online' && !detail.activitySignSetting.isEnableAudit ? (
                  <Button formType='submit' hoverClass='hover-button' loading={btnLoading}>
                    支付
                    {/* ￥
                {detail.isOneSignMany
                  ? util.filterPrice(detail.activityFee.price * oneSignManyNum)
                  : util.filterPrice(detail.activityFee.price)} */}
                  </Button>
                ) : (
                    <Button formType='submit' hoverClass='hover-button' loading={btnLoading}>
                      确认提交
                    </Button>
                  )}
                {/* <Button hoverClass="hover-button" onClick={requestSubscribeMessage} disabled={subscribe}>{subscribe ? '已订阅' : '订阅'}报名状态</Button> */}
              </Form>
            )}


          {/* {detail.isEnableFee && detail.payWay === 'online' && !detail.activitySignSetting.isEnableAudit ?
            <Button onClick={handleSubmit} hoverClass="hover-button" loading={btnLoading}>支付￥{util.filterPrice(detail.activityFee.price)}</Button>
            :
            <Button onClick={handleSubmit} hoverClass="hover-button" loading={btnLoading}>确认提交</Button>
          } */}
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
    </View>
  );
}

ActivityJoin.config = {
  navigationBarTitleText: '活动报名'
};
