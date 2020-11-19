import Taro, { useState, useEffect, useRouter } from '@tarojs/taro';
import { View } from '@tarojs/components';
import api from '@/api/donate';
import { ContentWrap } from '@/components/common';

import './index.scss';
// import Utils from '@/utils/util';


export default function Index() {
  const { id } = useRouter().params;

  const [detail, setDetail] = useState<any>({
    title: '',
    content: '',
  });

  useEffect(() => {
    api.donateAgreementDetail({id}).then(res => {
      setDetail(res.data.data)
      if (res.data.data.title) {
        Taro.setNavigationBarTitle({title: res.data.data.title})
      }
    })
  }, []);

  return (
    <View className='relative donate-agreement'>
      <ContentWrap title='' content={detail.content} />
    </View>
  );
}
Index.config = {
  navigationBarTitleText: '协议详情',
};
