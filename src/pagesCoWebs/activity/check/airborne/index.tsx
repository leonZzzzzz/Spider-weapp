import Taro, { useState, useEffect, useRouter } from '@tarojs/taro';
import { View, Image, Input, Button } from '@tarojs/components';
import { LoadingBox } from '@/components/common';
import { IMG_HOST } from '@/config';
import { checkAuthorize, checkVisitor } from '@/utils/authorize';
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
    checkinWay: 1
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
    setModel(_data.checkinSetting);
    setStatus(_data.checkin);
    setName(_data.name);
    setFromModel(fromModel);
    Taro.setNavigationBarTitle({
      title: _data.title || '签到'
    });
    setPageLoading(false);
  };

  const checkSave = async (e: any, type: 'sign' | 'check') => {
    checkVisitor(e).then(() => {
      checkAuthorize({
        success: async () => {
          if (type == 'sign') {
            Taro.navigateTo({
              url: `/pagesCoWebs/activity/join/index?id=${model.sourceId}&checkinSettingId=${model.id}`
            });
            return;
          }
          if (fromModel.checkinWay === 1) {
            if (!/^1[0-9]{10}$/.test(fromModel.msg)) {
              Taro.showToast({ title: '请输入正确的手机号码', icon: 'none' });
              return false;
            }
          }
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
              {/* {fromModel.checkinWay === 1 ? (
                <Input
                  className='list list--input'
                  value={fromModel.msg}
                  placeholder={`${fromModel.checkinWay === 1 ? '签到手机号' : '签到暗号'}`}
                  type='number'
                  onInput={inputChange}
                />
              ) : (
                <Input
                  className='list list--input'
                  value={fromModel.msg}
                  placeholder={`${fromModel.checkinWay === 1 ? '签到手机号' : '签到暗号'}`}
                  onInput={inputChange}
                />
              )}
              <Button
                className='list list--button'
                openType='getUserInfo'
                onGetUserInfo={e => {
                  checkSave(e, 'check');
                }}
                loading={btnLoading}
                disabled={btnLoading}>
                确认签到
              </Button> */}

              <Button
                className='list list--button'
                openType='getUserInfo'
                onGetUserInfo={e => {
                  checkSave(e, 'sign');
                }}
                loading={btnLoading}
                disabled={btnLoading}>
                空降嘉宾签到
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
