import Taro, { useState, useRouter, useEffect } from '@tarojs/taro';
import { View } from '@tarojs/components';

import { getChannelQrcode, getprogramQrcode } from '@/api/channel';
import './index.scss';

import { LoadingBox } from '@/components/common'

interface codeData {
  remark: string,
  type: string,
  host: string,
  url: string,
  channelCodeId: string,
  targetId: string,
  targetName: string,
  targetType: string,
  scene: string
}

function ChannelTransfer() {
  const [pageLoading, setPageLoading] = useState<Boolean>(true);
  const query = useRouter().params

  useEffect(() => {
    getChannel(query.scene)
  }, [query.scene]);

  const getChannel = async (scene) => {
    console.log('scene999', scene)
    try {
      if (!scene) return false
      setPageLoading(true)
      let res = await getChannelQrcode({ scene: scene })
      jumpPage(res.data.data)
      // let data = {}
      // data.targetType = 'mini-program-page'
      // jumpPage(data)
      setPageLoading(false)
    } catch (error) {
      setPageLoading(false)
      console.log(error)
    }
  }
  const getLittleProject = async (id, channelCodeId) => {
    Taro.setStorageSync('channelCodeId', channelCodeId)
    let res = await getprogramQrcode({ id })
    Taro.switchTab({
      url: '../../' + res.data.data.path
    });
  }

  function jumpPage(data: codeData) {
    switch (data.targetType) {
      case 'undefine':
        Taro.showModal({
          title: '温馨提示',
          content: '跳转类型未定义',
          showCancel: false
        })
        break;
      case 'activity':
        // 活动
        Taro.redirectTo({
          url: `/pagesCoWebs/activity/detail/index?id=${data.targetId}&channelCodeId=${data.channelCodeId}`
        });
        break;
      case 'news':
        // 图文
        Taro.redirectTo({
          url: `/pagesCoWebs/news/detail/index?id=${data.targetId}&channelCodeId=${data.channelCodeId}`
        });
        break;
      case 'product':
        // 商品
        Taro.redirectTo({
          url: `/pagesMall/product-detail/index?id=${data.targetId}`
        });
      case 'group-shopping':
        // 团购
        Taro.redirectTo({
          url: `/pagesMall/group-product/detail/index?id=${data.targetId}`
        });
        break;
      case 'mini-program-page':
        // 小程序页面
        getLittleProject(data.targetId, data.channelCodeId)
        break;
      default:
        Taro.showModal({
          title: '温馨提示',
          content: '未知类型',
          showCancel: false
        })
        return false
    }
  }

  return (
    <View className='ChannelTransfer'>
      <LoadingBox visible={pageLoading} />
    </View>
  );
}

export default ChannelTransfer;
