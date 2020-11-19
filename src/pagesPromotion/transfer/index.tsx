import Taro, { useState, useRouter, useEffect } from '@tarojs/taro';
import { View } from '@tarojs/components';

import api from '@/api/index';
import { HOME_PATH } from '@/config';
import './index.scss';

import { LoadingBox } from '@/components/common';

interface codeData {
  remark: string;
  type: string;
  host: string;
  url: string;
  channelCodeId: string;
  targetId: string;
  targetName: string;
  targetType: string;
  scene: string;
  showStyle: number;
  memberId: string;
}

function ChannelTransfer() {
  const [pageLoading, setPageLoading] = useState<Boolean>(true);
  const query = useRouter().params;

  useEffect(() => {
    distributerQrcodeScan(query.scene);
  }, [query.scene]);

  const distributerQrcodeScan = async (scene: any) => {
    try {
      if (!scene) return false;
      setPageLoading(true);
      let res = await api.distributerQrcodeScan({ scene: scene });
      console.log('-----------distributerQrcodeScan------------', res.data);
      jumpPage(res.data.data);
      setPageLoading(false);
    } catch (error) {
      setPageLoading(false);
      console.log(error);
    }
  };

  function jumpPage(data: codeData) {
    // distributerScanBind(query.scene)
    switch (data.targetType) {
      case 'undefine':
        Taro.showModal({
          title: '温馨提示',
          content: '跳转类型未定义',
          showCancel: false
        });
        break;
      case 'activity':
        // 活动
        Taro.redirectTo({
          url: `/pagesCoWebs/activity/${data.showStyle === 2 ? 'detail-commission' : 'detail'}/index?id=${
            data.targetId
          }&bindScene=${data.scene}${data.memberId ? `&shareMemberId=${data.memberId}` : ''}`
        });
        break;
      case 'distributer':
        // 销售
        Taro.switchTab({
          url: `${HOME_PATH}`
        });
        break;
      case 'sharer':
        // 推广
        Taro.redirectTo({
          url: `/pagesPromotion/sharer/accept-invite/index?scene=${data.scene}`
        });
        break;
      case 'course-vip':
        // 小鹅通课程会员
        Taro.redirectTo({
          url: `/pagesXiaoetech/course-vip/detail/index?id=${data.targetId}&bindScene=${data.scene}`
        });
        break;
      default:
        Taro.showModal({
          title: '温馨提示',
          content: '未知类型',
          showCancel: false
        });
        return false;
    }
  }

  // const distributerScanBind = async (scene: any) => {
  //   const res = await api.distributerScanBind({ scene })
  // }

  return (
    <View className='ChannelTransfer'>
      <LoadingBox visible={pageLoading} />
    </View>
  );
}

export default ChannelTransfer;
