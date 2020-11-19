import Taro, { useState, useEffect, useRouter } from '@tarojs/taro';
import { View, Image, Input, Button, Form } from '@tarojs/components';
import { checkVisitor, checkAuthorize } from '@/utils/authorize';
import { LoadingBox } from '@/components/common';
import { IMG_HOST } from '@/config';
import api from '@/api/cowebs';
import './index.scss';

export default function ActivityCheck() {
  const [pageLoading, setPageLoading] = useState(true);
  const [status, setStatus] = useState(0);
  const [name, setName] = useState('');
  const [model, setModel] = useState<any>({});
  const [fromModel, setFromModel] = useState<any>({
    msg: '',
    checkinSettingId: '',
    checkinWay: 2
  });
  const [failMsg, setFailMsg] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);

  const query = useRouter().params;

  useEffect(() => {
    checkInfoGet(query.id || query.scene);
  }, []);

  const checkInfoGet = async (checkinSettingId: any) => {
    let res = await api.checkInfoGet({ checkinSettingId });
    let _data = res.data.data;

    fromModel.checkinSettingId = checkinSettingId;
    fromModel.msg = _data.checkinSetting.checkinCode;

    setModel(_data.checkinSetting);
    setStatus(_data.checkin);
    setName(_data.name);
    console.log(fromModel)
    setFromModel(fromModel);

    Taro.setNavigationBarTitle({
      title: _data.title || '签到'
    });

    setPageLoading(false);
  };

  const checkSave = async (e: any) => {
    checkVisitor(e).then(() => {
      checkAuthorize({
        success: async () => {
          // if (fromModel.checkinWay === 2) {
          //   if (!/^1[0-9]{10}$/.test(fromModel.msg)) {
          //     Taro.showToast({ title: '请输入正确的手机号码', icon: 'none' });
          //     return false;
          //   }
          // }
          setBtnLoading(true);
          try {
            let res = await api.checkSave(fromModel);
            console.log(res);
            if (res.data.code === 20000) {
              checkInfoGet(fromModel.checkinSettingId);
            } else {
              setFailMsg(res.data.message);
              setBtnLoading(false);
            }
          } catch (err) {
            setFailMsg(err.data.message);
          }
        }
      });
    });
  };

  const inputChange = (e: any) => {
    fromModel.msg = e.detail.value;
    setFromModel(fromModel);
  };

  return (
    <View>
      <LoadingBox visible={pageLoading} />

      {status === 0 ? (
        <View className='check' style={{ backgroundImage: `url(${IMG_HOST}${model.checkUrl})` }}>
          {status === 0 && (
            <View className='from'>
              {fromModel.checkinWay === 2 ? (
                <Input
                  className='list list--input'
                  value={fromModel.msg}
                  placeholder='签到暗号'
                  type='number'
                  disabled
                  onInput={inputChange}
                />
              ) : (
                  <Input
                    className='list list--input'
                    value={fromModel.msg}
                    placeholder='签到暗号'
                    disabled
                    onInput={inputChange}
                  />
                )}
              <Button
                className='list list--button'
                openType='getUserInfo'
                onGetUserInfo={checkSave}
                loading={btnLoading}
                disabled={btnLoading}>
                确认签到
              </Button>
            </View>
          )}
          {failMsg && (
            <View className='mask'>
              <View className='dialog'>
                <View
                  className='close iguanbi iconfont'
                  onClick={() => {
                    this.setState({
                      failMsg: ''
                    });
                  }}></View>
                <Image className='status-img' src={`${IMG_HOST}${model.failUrl}`} />
                <View className='tip'>签到失败</View>
                <View className='msg'>{failMsg}</View>
              </View>
            </View>
          )}
        </View>
      ) : (
          <View className='check' style={{ backgroundImage: `url(${IMG_HOST}${model.successUrl})` }}>
            {name && (
              <View className='name-wrap' style={{ fontSize: `${name.length < 5 ? 28 : 22}px` }}>
                <View className='name-font'>{name}</View>
              </View>
            )}
          </View>
        )}
    </View>
  );
}

ActivityCheck.config = {
  navigationBarTitleText: '签到'
};
