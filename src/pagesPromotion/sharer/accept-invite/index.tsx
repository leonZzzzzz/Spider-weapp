import Taro, { useState, useEffect, useRouter } from '@tarojs/taro';
import { View, Button, Image } from '@tarojs/components';
import { IMG_HOST } from '@/config';
import { Avatar } from '@/components/common';
import api from '@/api/index';
import util from '@/utils/util';
import { checkAuthorize, checkVisitor } from '@/utils/authorize';
import './index.scss';

export default function Index() {
  const [pageLoading, setPageLoading] = useState(true);
  const [user, setUser] = useState<any>({});
  const [showMask, setShowMask] = useState(false);

  const { scene } = useRouter().params;

  useEffect(() => {
    scanOwner();
  }, []);
  const sharerGet = async (): Promise<boolean> => {
    try {
      const res = await api.sharerGet();
      if (res.data.data.isSharer && res.data.data.status === 'audited') {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log('=============>', '获取会员失败');
      return false;
    }
  };

  const scanOwner = async () => {
    const res = await api.scanOwner({ scene });
    setUser(res.data.data);
    setPageLoading(false);
  };

  // 绑定
  const distributerScanBind = e => {
    sharerGet().then(res => {
      if (res) {
        setShowMask(true);
      } else {
        checkVisitor(e).then(() => {
          checkAuthorize({
            success: async () => {
              const res = await api.distributerScanBind({ scene });
              const data = res.data.data;
              console.log('扫码绑定---------distributerScanBind', data);
              util.showToast(data || '绑定成功');
              setTimeout(() => {
                Taro.redirectTo({
                  url: '/pagesPromotion/sharer/index/index'
                });
              }, 2000);
            }
          });
        });
      }
    });
  };

  return (
    <View className='accept-invite'>
      {/* <LoadingBox visible={pageLoading} /> */}
      {showMask && (
        <View className='accept-invite__mask'>
          <View
            className='accept-invite__icon qcfont qc-icon-close'
            onClick={() => {
              setShowMask(false);
            }}></View>
          <View className='accept-invite__main'>
            <View className='accept-invite__main-title accept-invite__main--center'>暂时不能接受邀请</View>
            <View className='accept-invite__main-tip accept-invite__main--center'>您已经是推广员，不能接受邀请</View>
            <View
              className='accept-invite__main-button accept-invite__main--center'
              onClick={() => {
                Taro.redirectTo({
                  url: '/pagesPromotion/sharer/index/index'
                });
              }}>
              去推广中心
            </View>
          </View>
        </View>
      )}
      <View className='bg'>
        <Image src={IMG_HOST + '/attachments/images/accept-bg.png'} mode='widthFix' />
      </View>
      <View className='user-wrap'>
        <Avatar
          imgUrl={user.headImage || 'https://athena-1255600302.cos.ap-guangzhou.myqcloud.com/static/avatar.png'}
          width={110}
          style={{ border: `${Taro.pxTransform(4)} solid #fff` }}
        />
        <View className='user'>
          <View className='name'>{user.appellation || ''}</View>
          <View>我在致富路上等你，一起来吧！</View>
        </View>
      </View>
      <Button className='click-btn' openType='getUserInfo' onGetUserInfo={distributerScanBind}></Button>
    </View>
  );
}

Index.config = {
  navigationBarTitleText: '接受邀请'
};
