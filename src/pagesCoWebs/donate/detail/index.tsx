import Taro, { useState, useEffect, useDidShow, useShareAppMessage, useRouter } from '@tarojs/taro';
import { View, Image, Text, Button, ScrollView, Block, Input, Textarea, Picker } from '@tarojs/components';
import './index.scss';

import api from '@/api/donate';
import { IMG_HOST, HOME_PATH } from '@/config';
import Utils from '@/utils/util';
import Validator from '@/utils/validator';
import { checkAuthorize, checkVisitor } from '@/utils/authorize';
import { updateMember, getMemberInfo } from '@/api/common';

import {
  LogoWrap,
  LoadingBox,
  ContentWrap,
  BottomBar,
  ThemeView,
  Dialog
} from '@/components/common';


export default function Index() {
  const { id } = useRouter().params;
  // let id = '7010b6d166144422923001b757369703'
  const [pageLoading, setPageLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [btnLock, setBtnLock] = useState(false);
  const [isCheck, setIsCheck] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const [selectItem, setSelectItem] = useState<any>({});
  const [selectAmount, setSelectAmount] = useState<any>({});
  const [itemList, setItemList] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [docList, setDocList] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [model, setModel] = useState<any>({
    amountCustom: '',
  });

  useEffect(() => {
    api.donateDetail({ id: id}).then(res => {
      setDetail(res.data.data)
      setPageLoading(false)
      getDocList()
      if (res.data.data.title) Taro.setNavigationBarTitle({title: res.data.data.title})
      // 设置默认选中项目和金额类型
      if (res.data.data.items && res.data.data.items.length > 0) {
        setItemList(res.data.data.items)
        if (res.data.data.items.length === 1) {
          setSelectItem(res.data.data.items[0])
        }
      }
    })
    .catch(() => {
      setPageLoading(false)
    })
  }, []);

  useDidShow(() => {
    setBtnLoading(false)
    getUserList()
  })

  useEffect(() => {
    if (selectItem && selectItem.fields) {
      let modelKeys = {}
      selectItem.fields.map(item => {
        modelKeys[item.key] = ''
        if (item.type == 'address' || item.type == 'select') {
          modelKeys[item.key+'Custom'] = []
        }
      })
      console.log(modelKeys)
      setModel(pre => {
        return {...pre, ...modelKeys}
      })
    }
    if (selectItem.amounts && selectItem.amounts[0]) {
      setSelectAmount(selectItem.amounts[0])
    }
  }, [selectItem])

  useEffect(() => {
    if (selectAmount && selectAmount.key) {
      if (selectAmount.maxValue === selectAmount.minValue && selectAmount.maxValue + selectAmount.minValue > 0) {
        // 为固定金额类型，默认赋值
        // amountCustom是本地自定义的字段，提交时会换成选中的key, 因为amounts是个数组 每项的key不一样 在切换时删除旧值不好处理
        setModel(pre => {
          return {
            ...pre,
            amountCustom: Utils.chu(selectAmount.minValue, 100).toFixed(2)
          }
        })
      } else {
        setModel(pre => {
          return {
            ...pre,
            amountCustom: ''
          }
        })
      }
    }
  }, [selectAmount])

  // 获取捐赠名单
  const getUserList = async () => {
    let res = await api.donateDetailOrderPage({activityId: id, pageSize: 5})
    setUserList(res.data.data.list)
    setTotal(res.data.data.total)
  }
  // 获取协议列表
  const getDocList = async () => {
    let res = await api.donateAgreementPage({code: 'donate'})
    setDocList(res.data.data.list)
  }

  useShareAppMessage(() => {
    let path = `pagesCoWebs/donate/detail/index?id=${id}`
    return {
      title: detail.title,
      imageUrl: IMG_HOST + detail.cover,
      path
    }
  })

  const handle = (e:any) => {
    if (!selectItem || !selectItem.id ) {
      Taro.showToast({title: '请先选择随喜项目', icon: 'none', duration: 2000})
      return
    }
    setBtnLoading(true)
    checkAuthorize({
      success: async () => {
        if (e.detail.userInfo) {
          const member =  Taro.getStorageSync('memberInfo')
          const data = { headImage: e.detail.userInfo.avatarUrl, appellation: e.detail.userInfo.nickName };
          if (!member.headImage || !member.appellation) {
            // 更新会员数据
            await updateMember(data);
            const memberInfo = await getMemberInfo();
            Taro.setStorageSync('memberInfo', memberInfo.data.data);
          }
        }
        setBtnLoading(false)
        setVisible(true)
      }
    })
    // setBtnLoading(true)
    // checkVisitor(e).then(() => {
    //   setBtnLoading(false)
    //   setVisible(true)
    // })
    // .catch(() => {
    //   console.log('随喜乐捐获取用户信息失败')
    //   setBtnLoading(false)
    //   // setVisible(true)
    // })
  }

  const submitForm = async () => {
    if (btnLock) return

    if (!isCheck) {
      Taro.showToast({title: '请勾选用户捐赠协议', icon: 'none', duration: 2000})
      return
    }
    const validator = new Validator();
    console.log(model)
    selectItem.fields.forEach(item => {
      if (item.required) {
        validator.rule(model[item.key], [{ message: `请输入${item.name}`, type: 'isNonEmpty' }]);
        if (item.maxLength > 0) {
          validator.rule(model[item.key], [{ message: `${item.name}最多${item.maxLength}个字符`, maxLength: item.maxLength }]);
        }
        if (item.type === 'mobile') {
          validator.rule(model[item.key], [{ message: `手机号格式不正确`, type: 'isMoblie' }]);
        }
        if (item.type === 'email') {
          validator.rule(model[item.key], [{ message: `邮箱格式不正确`, type: 'isEmail' }]);
        }
        if (item.type === 'address') {
          validator.rule(model[item.key+'DetailCustom'], [{ message: `请填写详细地址`, type: 'isNonEmpty' }]);
        }
      }
    })

    try {
      if (selectAmount.maxValue + selectAmount.minValue > 0 && selectAmount.maxValue != selectAmount.minValue) {
        if (Utils.mul(model.amountCustom, 100) < selectAmount.minValue) {
          Taro.showToast({title: `${selectAmount.name || '金额'}不能小于${Utils.filterPrice(selectAmount.minValue)}元`, icon: 'none', duration: 2500})
          return
        } else if (selectAmount.maxValue > 0 && Utils.mul(model.amountCustom, 100) > selectAmount.maxValue) {
          Taro.showToast({title: `${selectAmount.name || '金额'}不能大于${Utils.filterPrice(selectAmount.maxValue)}元`, icon: 'none', duration: 2500})
          return
        }
      }
      if (model.amountCustom <= 0) {
        Taro.showToast({title: `${selectAmount.name || '金额'}不能小于0元`, icon: 'none', duration: 2500})
        return
      }
    } catch (error) {
      // 如果报错，就交给后台去判断吧
      console.log('判断金额大小出错===》', error)
    }

    let error = validator.validate();
    try {
      const _model = JSON.parse(JSON.stringify(model));
      _model.itemId = selectItem.id
      if (_model.amountCustom || _model.amountCustom === 0) {
        _model[selectAmount.key] = Utils.mul(_model.amountCustom, 100)
        delete _model.amountCustom
      }
      selectItem.fields.forEach(item => {
        if (_model[item.key+'Custom']) delete _model[item.key+'Custom']
        if (_model[item.key+'DetailCustom']) {
          // 拼接详细地址
          _model[item.key] += _model[item.key+'DetailCustom']
          delete _model[item.key+'DetailCustom']
        }
      })
      if (error) {
        Taro.showToast({ title: error, icon: 'none', duration: 2500 });
      } else {
        console.log(_model)
        setBtnLock(true)
        Taro.showLoading({ title: '提交中' });
        let res:any = await api.donateOrderInsert(_model)
        let payRes:any = await api.donateOrderPay({orderId: res.data.data.id})
        const payData = payRes.data.data;
        const params = {
          timeStamp: payData.timeStamp,
          nonceStr: payData.nonceString,
          package: payData.pack,
          signType: payData.signType,
          paySign: payData.paySign
        };
        setTimeout(() => {
          Taro.hideLoading()
        }, 1000)
        requestPayment(params, res.data.data);
      }
    } catch (error) {
      console.log(error)
      Taro.hideLoading()
      setBtnLock(false)
      if (error.data && error.data.message) {
        Taro.showToast({
          title: error.data.message, 
          icon: 'none', 
          duration: 2500
        })
      }
    }
  }

  /**
   * 发起支付
   */
  const requestPayment = async (params: any, member) => {
    try {
      await api.requestPayment(params)
      setBtnLoading(false)
      Taro.hideLoading()
      Taro.showToast({title: '支付成功'})
      let memberInfo = member || Taro.getStorageSync('memberInfo') || {}
      Taro.setStorageSync('donateResult', {
        headImage: memberInfo.headImage,
        donator: memberInfo.donator || memberInfo.appellation || memberInfo.name,
        amount: Utils.mul(model.amountCustom, 100),
        thankMsg: `感谢您为${member.appName || '甘泉禅寺'}随喜乐捐！`
      })
      setVisible(false)
      Taro.navigateTo({url: `/pagesCoWebs/donate/result/index`})
    } catch (err) {
      console.log(err)
      Taro.hideLoading()
      Taro.showToast({title: '取消支付', icon: 'none'})
    } finally {
      setBtnLock(false)
    }
  };

  const amountPlaceholder = () => {
    if (selectAmount.minValue > 0 && selectAmount.maxValue > 0) {
      return `最小${Utils.filterPrice(selectAmount.minValue)}，最大${Utils.filterPrice(selectAmount.maxValue)}`
    } else if (selectAmount.minValue && !selectAmount.maxValue) {
      return `最小${Utils.filterPrice(selectAmount.minValue)}`
    } else if (selectAmount.maxValue && !selectAmount.minValue) {
      return `最大${Utils.filterPrice(selectAmount.maxValue)}`
    } else {
      return '最小0.01'
    }
  }

  const placeholder = (item) => {
    return item.maxLength ? `请输入内容, 限${item.maxLength}个字符` : '请输入内容'
  }

  return (
    <ThemeView>
      <View className='detail'>
        <LoadingBox visible={pageLoading} />

        <View className='relative'>
          <View className='cover-wrap'>
            {detail.cover && <Image src={IMG_HOST + detail.cover} mode='widthFix' />}
          </View>

          <View className='title'>{detail.title}</View>

          {detail.introduction && <View className='desc'>简介： {detail.introduction}</View>}

          <View className='line-bar'></View>

          <View className='section'>
            <View className='section-label'>项目类型</View>
            <View className='section-body' onTouchMove={() => {}}>
              {itemList.map(item => (
                <View 
                  className={`category-item  ${selectItem.id === item.id ? 'category-item--active' : ''}`} 
                  key={item.id}
                  onClick={() => {
                    setModel({})
                    setSelectItem(item)
                  }}
                  >{item.title}</View>
              ))}
            </View>
          </View>

          <View className='line-bar'></View>

          <View className='section'>
            <View className='section-label'>
              捐赠名单
              <View className='section-label__right' onClick={() => Utils.navigateTo('/pagesCoWebs/donate/roster/index?id='+id)}>
                <Text className='yellow-color'>{total}</Text>人已参与 <Text className='qcfont qc-icon-chevron-right'></Text>
              </View>
            </View>
            <View className='section-body'>
              <ScrollView scroll-x className="user-list">
                {userList.map(item => (
                  <View className='user-item' key={item.id}>
                    <Image className='user-item__img' src={item.headImage || `${IMG_HOST}/static/avatar.png`}></Image>
                    <View className='user-item__info'>
                      <Text>{item.donator}</Text>
                      <View className='amount'>￥{Utils.filterPrice(item.amount)}</View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>

          <View className='line-bar'></View>

          <ContentWrap title='详情介绍' content={selectItem.content} />
        </View>

        <LogoWrap bottom={110} />

        <BottomBar
          showHome={false}
          showPraise={false}
          showComment={false}
          showShare={false}
          >
            <View className='home-btn' onClick={() => Taro.switchTab({ url: HOME_PATH })}>
              <Text className='qcfont qc-icon-home' />
              <Text>首页</Text>
            </View>
            <Button
              style={{ width: Taro.pxTransform(546) }}
              className='submit-btn'
              hoverClass='hover-button'
              loading={btnLoading}
              openType='getUserInfo'
              onGetUserInfo={handle}>
              立即随喜
            </Button>
        </BottomBar>

      </View>

      {/* 随喜表单弹框 */}
      <Dialog
        visible={visible} 
        position='bottom' 
        isMaskClick={true}
        onClose={() => setVisible(false)}
        >
          {visible && <View className='sub-form'>
            <View className='sub-form__title'>我要随喜</View>
            <View className='qcfont qc-icon-chacha sub-form__close' onClick={() => setVisible(false)}></View>
            <ScrollView className='sub-form__body' scrollY>
              {(selectItem.amounts && selectItem.amounts.length > 1) && <View className='form-item'>
                {selectItem.amounts.map(item => (
                  <View 
                    className={`amount-item  ${selectAmount.key === item.key ? 'amount-item--active' : ''}`} 
                    key={item.key}
                    onClick={() => setSelectAmount(item)}
                    >{item.name}</View>
                ))}
              </View>}
              {/* 金额输入框 */}
              {selectAmount.key && <View className='form-item'>
                <View className='form-item__label'><Text className='required'>*</Text>{selectAmount.name}</View>
                <View className='form-item__value'>
                  {/* 当maxValue=minValue且不为0时。表示该金额字段为固定值，不可修改 */}
                  ￥
                  <Input className='form-item__input' 
                    type='digit'
                    maxLength={128}
                    value={model.amountCustom} 
                    disabled={selectAmount.maxValue === selectAmount.minValue && selectAmount.maxValue + selectAmount.minValue > 0} 
                    placeholder={amountPlaceholder()}
                    onInput={(e) => {
                      setModel({
                        ...model,
                        amountCustom: e.detail.value
                      })
                    }}
                    ></Input>
                </View>
              </View>}
              {selectItem.fields && (
                selectItem.fields.map(item => (
                  item.type === 'address' ? (
                    <View className='form-item' key={item.key}>
                      <View className='form-item__label'>
                        {item.required && <Text className='required'>*</Text>}
                        {item.name}
                      </View>
                      <View className='form-item__value'>
                        <View className='form-item__input'>
                          {/* 绑定值为数组类型 在前面的方法里已经用key+'Custom'的方式初始化为数组了*/}
                          <Picker mode='region' 
                            value={model[item.key+'Custom']} 
                            onChange={(e) => {
                              // {value, code, postcode}
                              setModel({
                                ...model, 
                                [item.key+'Custom']: e.detail.value,
                                [item.key]: e.detail.value.join('')
                              })
                            }}>
                            <View className="picker">
                              {model[item.key] ? model[item.key] : (<Text style='color: #777 !important'>请选择省市区</Text>)}
                            </View>
                          </Picker>
                          <Input className='form-item__input address-input' 
                            type='text'
                            value={model[item.key+'DetailCustom']} 
                            maxLength={100} 
                            placeholder='请输入详细地址' 
                            onInput={(e) => {
                              setModel({
                                ...model,
                                [item.key+'DetailCustom']: e.detail.value
                              })
                            }}></Input>
                        </View>
                      </View>
                    </View>
                  ) : item.type == 'select' ? (
                    <View className='form-item' key={item.key}>
                      <View className='form-item__label'>
                        {item.required && <Text className='required'>*</Text>}
                        {item.name}
                      </View>
                      <View className='form-item__value'>
                        <View className='form-item__input'>
                          <Picker mode='selector' 
                            value={model[item.key+'Custom']} 
                            range={item.options} 
                            onChange={(e) => {
                              setModel({
                                ...model, 
                                [item.key+'Custom']: e.detail.value, 
                                [item.key]: item.options[e.detail.value]
                              })
                            }}>
                            <View className="picker">
                              {model[item.key] || '请选择'}
                            </View>
                          </Picker>
                        </View>
                      </View>
                    </View>
                  ) : item.type == 'textarea' ? (
                    <View className='form-item'>
                      <View className='form-item__label'>
                        {item.required && <Text className='required'>*</Text>}
                        {item.name}
                      </View>
                      <View className='form-item__value'>
                        <Textarea className='form-item__textarea' 
                          value={model[item.key]} 
                          fixed 
                          maxlength={item.maxLength || 128} 
                          placeholder={placeholder(item)} 
                          onInput={(e) => {
                            setModel({
                              ...model,
                              [item.key]: e.detail.value
                            })
                          }}></Textarea>
                      </View>
                    </View>
                  ) : (
                    <View className='form-item'>
                      <View className='form-item__label'>
                        {item.required && <Text className='required'>*</Text>}
                        {item.name}
                      </View>
                      <View className='form-item__value'>
                        {item.type == 'number' || item.type == 'mobile' ? (
                          <Input className='form-item__input' 
                            type='number'
                            value={model[item.key]} 
                            maxLength={item.maxLength || 128} 
                            placeholder={placeholder(item)} 
                            onInput={(e) => {
                              setModel({
                                ...model,
                                [item.key]: e.detail.value
                              })
                            }}></Input>
                        ) : (
                          <Input className='form-item__input' 
                            type='text'
                            value={model[item.key]} 
                            maxLength={item.maxLength || 128} 
                            placeholder={placeholder(item)} 
                            onInput={(e) => {
                              setModel({
                                ...model,
                                [item.key]: e.detail.value
                              })
                            }}></Input>
                        )}
                      </View>
                    </View>
                  )
                ))
              )}
            </ScrollView>
            <View className='doc'>
              <View className="doc-checkbox" onClick={() => setIsCheck(!isCheck)}>
                {isCheck 
                  ? <Text className='qcfont qc-icon-newxuanzhongduoxuan' style='color: rgb(255, 79, 3);'></Text> 
                  : <Text className='qcfont qc-icon-duoxuan' style='color: #ccc;'></Text> 
                }
                <Text>我已经阅读并同意</Text>
              </View>
              {docList.map(item => (
                <Text className='doc-link' 
                  key={item.id} 
                  onClick={() => Taro.navigateTo({url: `/pagesCoWebs/donate/agreement/index?id=${item.id}`})}
                  >{item.title}</Text>
              ))}
            </View>
            <View className='sub-form__btn' onClick={submitForm}>完成</View>
          </View>
          }
      </Dialog>
    </ThemeView>
  );
}
Index.config = {
  navigationBarTitleText: '随喜乐捐'
};
