import Taro, { useState, useEffect, useShareAppMessage } from '@tarojs/taro';
import { View, Button, Input } from '@tarojs/components';
import api from '@/api/index';
import util from '@/utils/util';
import withShare from '@/utils/withShare';
import { LoadingBox, LogoWrap, ContentWrap, Dialog, ThemeView } from '@/components/common';
import './index.scss';

export default function Index() {
  const [pageLoading, setPageLoading] = useState(true);
  const [detail, setDetail] = useState<any>({});
  const [visible, setVisible] = useState(false);
  const [fieldvisible, setFieldvisible] = useState(false);
  const [conditionConfig, setConditionConfig] = useState<any>({});
  const [registFieldList, setRegistFieldList] = useState<any[]>([]);
  const [code, setCode] = useState<string>('');
  useShareAppMessage(() => {
    return withShare({
      title: '招募计划',
      path: `/pagesPromotion/recruit/index`
    });
  });

  useEffect(() => {
    Taro.login().then(res => {
      setCode(res.code);
    });
    distributerMaterialPlanGet();
    distributerBecomeConditionConfigGet();
  }, []);

  const distributerMaterialPlanGet = async () => {
    const res = await api.distributerMaterialPlanGet();
    const data = res.data.data;
    util.setNavigationBarTitle(data.title);
    setDetail(data);
    setPageLoading(false);
  };

  const distributerBecomeConditionConfigGet = async () => {
    const res = await api.distributerBecomeConditionConfigGet();
    const data = res.data.data;
    setConditionConfig(data);
    if (data.condition !== 'no-condition') {
      setFieldvisible(true);
      distributerRegistFieldList();
    }
  };

  const distributerRegistFieldList = async () => {
    const res = await api.distributerRegistFieldList();
    setRegistFieldList(res.data.data);
  };

  // phone
  const handleItemPhoneNumber = async (index: number, e: any) => {
    if (!e.detail.encryptedData) {
      util.showToast('授权失败，请重新授权');
      return;
    }
    util.showLoading(true, '获取中…');
    let params = {
      code,
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv
    };
    try {
      const res = await api.decryptPhone(params);
      setRegistFieldList(prev => {
        prev[index].value = res.data.message;
        return [...prev];
      });
      Taro.hideLoading();
    } catch (err) {
      // Taro.hideLoading();
    }
  };

  const handleApply = () => {
    if (conditionConfig.condition !== 'no-condition') setVisible(true);
    else handleSubmit();
  };

  const handleSubmit = () => {
    let model = {};

    if (conditionConfig.condition !== 'no-condition') {
      registFieldList.map(item => {
        model[item.id] = item.value;
      });
      for (let i = 0; i < registFieldList.length; i++) {
        const item = registFieldList[i];
        if (item.value) {
          model[item.id] = item.value;
        } else {
          util.showToast(`${item.type === 'mobile' ? '请点击获取' : '请输入'}${item.name}`);
          return;
        }
      }
    }
    distributerRegist(model);
  };

  const distributerRegist = async (params: any) => {
    const res = await api.distributerRegist(params);
    util.showToast(res.data.message);
    if (conditionConfig.condition !== 'regist-and-audit') {
      util.navigateTo('/pagesPromotion/index/index');
    } else {
      setVisible(false);
    }
  };

  return (
    <ThemeView>
      <LoadingBox visible={pageLoading} />
      <View className='relative'>
        <ContentWrap content={detail.content} />
      </View>
      <LogoWrap bottom={110} />
      <View className='bottom-btn'>
        <Button hoverClass='hover-button' onClick={handleApply}>
          申请成为销售员
        </Button>
      </View>

      <Dialog visible={visible} position='bottom' onClose={() => setVisible(false)}>
        <View className='recruit-dialog'>
          <View className='title'>请填写以下信息</View>
          <View className='group'>
            {registFieldList.map((item: any, index: number) => {
              return (
                <View className='cell' key={item.id}>
                  <View className='label'>{item.name}</View>
                  {item.type === 'mobile' ? (
                    <View className='value'>
                      <Input
                        placeholder={`请点击获取${item.name}`}
                        value={item.value}
                        disabled
                        maxLength={item.maxLength}
                      />
                      <Button
                        openType='getPhoneNumber'
                        hoverClass='hover-button'
                        onGetPhoneNumber={e => handleItemPhoneNumber(index, e)}>
                        获取
                      </Button>
                    </View>
                  ) : item.type === 'number' ? (
                    <View className='value'>
                      <Input
                        placeholder={`请输入${item.name}`}
                        type='number'
                        value={item.value}
                        maxLength={item.maxLength}
                        onInput={(e: any) => {
                          registFieldList[index].value = e.detail.value;
                          setRegistFieldList(registFieldList);
                        }}
                      />
                    </View>
                  ) : (
                    <View className='value'>
                      <Input
                        placeholder={`请输入${item.name}`}
                        value={item.value}
                        maxLength={item.maxLength}
                        onInput={(e: any) => {
                          registFieldList[index].value = e.detail.value;
                          setRegistFieldList(registFieldList);
                        }}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
          <View className='submit-btn'>
            <Button hoverClass='hover-button' onClick={handleSubmit}>
              提交
            </Button>
          </View>
        </View>
      </Dialog>
    </ThemeView>
  );
}

Index.config = {
  // navigationBarTitleText: '招募计划',
  navigationBarBackgroundColor: '#294A7B'
};
