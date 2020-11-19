import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, Button, Text, Input, Picker, Form, Navigator, Image } from '@tarojs/components';
import { HOME_PATH, IMG_HOST } from '@/config';
import { authorize, login, getMemberInfo } from '@/api/common';
import api from '@/api/cowebs';
import { LogoWrap, LoadingBox, ThemeView } from '@/components/common';
import { authorizeStatus } from '@/utils/authorize';
import './index.scss';

export default function Authorize() {
  const [pageLoading, setPageLoading] = useState(true);
  const [code, setCode] = useState<string>('');
  const [authorizeVisible, setAuthorizeVisible] = useState(true);
  const [verifyType] = useState(authorizeStatus());
  const [tradeList, setTradeList] = useState<any[]>([]);
  const [degreeList, setDegreeList] = useState<any[]>([]);
  const [departmentList, setDepartmentList] = useState<any[]>([]);
  const [validateFieldList, setValidateFieldList] = useState<any[]>([]);
  const [bgImg, setBgImg] = useState('');
  const [userInfo, setUserInfo] = useState<any>();

  useEffect(() => {
    AUTHENTICATE_BG();
    Taro.login().then(res => setCode(res.code));
    console.log('========>', verifyType);
    // 获取需要填写的字段
    validateFieldGet();

    Taro.getUserInfo()
      .then(({ userInfo }) => {
        setUserInfo(userInfo);
        console.log('用户信息=======', userInfo);
        setAuthorizeVisible(false);
      })
      .catch(err => {
        console.log('用户信息 fail=======', err);
        setAuthorizeVisible(true);
      });
  }, []);

  const AUTHENTICATE_BG = async () => {
    const res = await api.AUTHENTICATE_BG();
    setBgImg(res.data.data ? res.data.data.value : '');
  };

  const handleGetUserInfo = async (e: any) => {
    let {
      detail: { userInfo }
    } = e;
    console.log('userInfo', userInfo);
    if (!userInfo || !userInfo.nickName) {
      Taro.showToast({
        title: '授权失败，请重试',
        icon: 'none'
      });
      return;
    }
    setUserInfo(userInfo);
    setAuthorizeVisible(false);
  };

  // 查询教学项目（1：项目，2：系别）
  const getProfessionList = async (params: any) => {
    const res = await api.professionList(params);
    if (params.type === 1) setDegreeList(res.data.data.list);
    else setDepartmentList(res.data.data.list);
  };
  // 行业
  const getConfigTrade = async () => {
    const res = await api.getConfigTrade();
    const data = res.data.data.value;
    setTradeList(data.split('_'));
  };

  const getAuthorize = async () => {
    const code = await Taro.login();
    const res = await authorize({ code: code.code, serviceType: 3 });
    const { isNeedAudit, memberId, memberStatus, openRegister, sessionId } = res.data.data;
    Taro.setStorageSync('authorize', { isNeedAudit, memberId, memberStatus, openRegister, sessionId });
  };

  // 获取个人资料
  const memberInfo = async () => {
    const res: any = await getMemberInfo();
    Taro.setStorageSync('memberInfo', res.data.data);
  };

  // 获取校友资料
  const contactsInfo = async () => {
    const res: any = await api.contactsGet();
    Taro.setStorageSync('contactsInfo', res.data.data);
  };

  // 获取需要填写的字段
  const validateFieldGet = async () => {
    const res = await api.validateFieldGet();
    const data = res.data.data;
    setValidateFieldList(data);
    let fieldIds: any = {};
    data.map((item: any) => {
      fieldIds[item.fieldId] = true;
    });
    if (fieldIds.departmentName && !fieldIds.degreeName) getProfessionList({ type: 2 });
    if (fieldIds.degreeName) getProfessionList({ type: 1 });
    if (fieldIds.trade) getConfigTrade();

    setPageLoading(false);
  };

  // Input类型
  const handleItemInput = (idx: number, e: any) => {
    validateFieldList[idx].value = e.detail.value;
    setValidateFieldList(validateFieldList);
  };
  // year
  const handleItemDate = (idx: number, e: any) => {
    console.log(e);
    validateFieldList[idx].value = e.detail.value;
    setValidateFieldList(validateFieldList);
  };
  // degreeName || departmentName
  const handleItemPicker = (idx: number, e: any) => {
    console.log('idx', idx, validateFieldList[idx]);
    let index = Number(e.detail.value);
    if (validateFieldList[idx].fieldId === 'degreeName') {
      validateFieldList[idx].pickerIndex = index;
      validateFieldList[idx].value = degreeList[index].name;
      getProfessionList({
        type: 2,
        parentId: degreeList[index].id
      });

      let departmentIndex = validateFieldList.findIndex(item => item.fieldId === 'departmentName');
      if (departmentIndex) {
        validateFieldList[departmentIndex].value = '';
        validateFieldList[departmentIndex].pickerIndex = 0;
      }
    }
    if (validateFieldList[idx].fieldId === 'departmentName') {
      validateFieldList[idx].pickerIndex = index;
      validateFieldList[idx].value = departmentList[index].name;
    }
    if (validateFieldList[idx].fieldId === 'trade') {
      validateFieldList[idx].pickerIndex = index;
      validateFieldList[idx].value = tradeList[index];
    }
    setValidateFieldList(validateFieldList);
  };
  // phone
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
      ivData: e.detail.iv,
      headImage: userInfo.avatarUrl,
      appellation: userInfo.nickName
    };
    try {
      const res = await login(params);
      validateFieldList[idx].value = res.data.data.phone;
      setValidateFieldList(() => {
        return [...validateFieldList];
      });
      Taro.hideLoading();
    } catch (err) {
      Taro.hideLoading();
    }
  };
  // 校验字段
  const handleValidateField = async (e: any) => {
    for (let i = 0; i < validateFieldList.length; i++) {
      let item = validateFieldList[i];
      if (item.required && (!item.value || item.value === '')) {
        Taro.showToast({
          title: `请填写${item.showName}`,
          icon: 'none'
        });
        return;
      }
    }

    Taro.showLoading({
      title: `${verifyType == 'needAudit' ? '正在注册' : '正在验证'}`,
      mask: true
    });

    // if (!Taro.getStorageSync('memberId')) {
    //   const resUserInfo = await Taro.getUserInfo();
    //   const resDirectCode = await Taro.login();
    //   await api.directLogin({
    //     code: resDirectCode.code,
    //     name: resUserInfo.userInfo.nickName,
    //     headImage: resUserInfo.userInfo.avatarUrl
    //   });
    //   await getAuthorize();
    // }

    const validate: any = synthesisValidateField();
    validate.wxMiniFormId = e.detail.formId;
    if (verifyType === 'needAudit') {
      register(validate);
    } else {
      // await api.validateField(validate);
      appLoginV2(validate);
    }
  };
  // 组合数据
  const synthesisValidateField = () => {
    let data = {};
    validateFieldList.map((item: any) => {
      data[item.fieldId] = item.value || '';
    });
    console.log(data);
    return data;
  };

  const appLoginV2 = async (params: any) => {
    await api.appLoginV2(params);
    success();
    Taro.showToast({
      title: '认证成功'
    });
  };
  const register = async (params: any) => {
    await api.register(params);
    success();
    Taro.showToast({
      title: '提交后，请耐心等待平台审核...',
      icon: 'none'
    });
  };

  const success = async () => {
    await getAuthorize();
    memberInfo();
    contactsInfo();
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  };

  return (
    <ThemeView>
      <View className='authorize'>
        <LoadingBox visible={pageLoading} />

        <View className='relative'>
          {bgImg && (
            <View className='bg-img'>
              <Image src={IMG_HOST + bgImg} mode='widthFix' />
            </View>
          )}

          <View className='step-wrap'>
            <View className={`item ${authorizeVisible ? 'active' : ''}`}>
              <View className='num'>1</View>
              <View className='text'>微信授权</View>
            </View>
            <View className={`item ${!authorizeVisible ? 'active' : ''}`}>
              <View className='num'>2</View>
              <View className='text'>实名认证</View>
            </View>
          </View>
          <View style={{ height: Taro.pxTransform(20), background: 'rgb(246, 246, 246)' }} />

          {authorizeVisible ? (
            <View className='authorize-box'>
              <View>验证前需要您提供以下信息，请确认授权</View>
              <View className='cell'>获得你的公开信息（昵称、头像等）</View>
              <View className='authorize-btn'>
                <Button openType='getUserInfo' onGetUserInfo={handleGetUserInfo} type='primary'>
                  确认授权
                </Button>
                <Navigator openType='switchTab' url={HOME_PATH} className='authorize-back-home'>
                  <Text>暂不授权，返回首页</Text>
                </Navigator>
              </View>
            </View>
          ) : (
            <View className='verify-box'>
              {validateFieldList.map((item: any, idx: number) => {
                return item.fieldId === 'year' ? (
                  <View className='input-cell' key={item.id}>
                    <View className='label'>
                      <Text className='required'>*</Text>
                      <Text>{item.showName}</Text>
                    </View>
                    <Picker
                      mode='date'
                      fields='year'
                      value={item.value}
                      onChange={e => handleItemDate(idx, e)}
                      className='picker'>
                      {item.value ? (
                        <View className='text'>
                          <Text style='color: #000;'>{item.value}年</Text>
                          <Text className='qcfont qc-icon-chevron-down' />
                        </View>
                      ) : (
                        <View className='text'>
                          <Text>请选择{item.showName}</Text>
                          <Text className='qcfont qc-icon-chevron-down' />
                        </View>
                      )}
                    </Picker>
                  </View>
                ) : item.fieldId === 'degreeName' || item.fieldId === 'departmentName' ? (
                  <View className='input-cell' key={item.id}>
                    <View className='label'>
                      <Text className='required'>*</Text>
                      <Text>{item.showName}</Text>
                    </View>
                    <Picker
                      mode='selector'
                      range={item.fieldId === 'degreeName' ? degreeList : departmentList}
                      rangeKey='name'
                      value={item.pickerIndex}
                      onChange={e => handleItemPicker(idx, e)}
                      className='picker'>
                      {item.value ? (
                        <View className='text'>
                          <Text style='color: #000;'>{item.value}</Text>
                          <Text className='qcfont qc-icon-chevron-down' />
                        </View>
                      ) : (
                        <View className='text'>
                          <Text>请选择{item.showName}</Text>
                          <Text className='qcfont qc-icon-chevron-down' />
                        </View>
                      )}
                    </Picker>
                  </View>
                ) : item.fieldId === 'trade' ? (
                  <View className='input-cell' key={item.id}>
                    <View className='label'>
                      <Text className='required'>*</Text>
                      <Text>{item.showName}</Text>
                    </View>
                    <Picker
                      mode='selector'
                      range={tradeList}
                      value={item.pickerIndex}
                      onChange={e => handleItemPicker(idx, e)}
                      className='picker'>
                      {item.value ? (
                        <View className='text'>
                          <Text style='color: #000;'>{item.value}</Text>
                          <Text className='qcfont qc-icon-chevron-down' />
                        </View>
                      ) : (
                        <View className='text'>
                          <Text>请选择{item.showName}</Text>
                          <Text className='qcfont qc-icon-chevron-down' />
                        </View>
                      )}
                    </Picker>
                  </View>
                ) : item.fieldId === 'phone' ? (
                  <View className='input-cell' key={item.id}>
                    <View className='label'>
                      <Text className='required'>*</Text>
                      <Text>{item.showName}</Text>
                    </View>
                    <View className='value'>
                      <Input placeholder={`请点击获取${item.showName}`} value={item.value} disabled />
                      <Button
                        openType='getPhoneNumber'
                        hoverClass='hover-button'
                        onGetPhoneNumber={e => handleItemPhoneNumber(idx, e)}>
                        获取
                      </Button>
                    </View>
                  </View>
                ) : (
                  <View className='input-cell' key={item.id}>
                    <View className='label'>
                      <Text className='required'>*</Text>
                      <Text>{item.showName}</Text>
                    </View>
                    <View className='value'>
                      <Input
                        placeholder={`请输入${item.showName}`}
                        value={item.value}
                        onInput={e => handleItemInput(idx, e)}
                      />
                    </View>
                  </View>
                );
              })}
              <Form onSubmit={handleValidateField} reportSubmit>
                <Button className='verify-btn' type='primary' formType='submit' hoverClass='hover-button'>
                  {verifyType == 'needAudit' ? '注 册' : '验 证'}
                </Button>
              </Form>
            </View>
          )}
        </View>
        <LogoWrap />
      </View>
    </ThemeView>
  );
}

Authorize.config = {
  navigationBarTitleText: '注册'
};
