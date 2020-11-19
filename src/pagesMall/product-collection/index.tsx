import Taro, { useReachBottom, usePullDownRefresh } from '@tarojs/taro';
import { View } from '@tarojs/components';
import './index.scss';

import api from '@/api/mall';
import useGetListData from '@/useHooks/useGetListData';

import { QcEmptyPage, LoadingBox, LogoWrap } from '@/components/common';
import { ProductItem } from '@/components/mall';

export default function Index() {
  const { list, pageLoading, load } = useGetListData('pageProductCollection');

  useReachBottom(() => {
    load(true);
  });

  usePullDownRefresh(() => {
    load();
  });

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '提示',
      content: '是否取消喜欢？'
    }).then((res: any) => {
      if (res.confirm) {
        deleteProductCollection(id);
      }
    });
  };

  /**
   * 取消收藏商品
   * @param id 商品id
   */
  const deleteProductCollection = async (id: string) => {
    await api.deleteProductCollection({ id });
    load(false, 'refresh', id);
  };

  return (
    <View>
      <LoadingBox visible={pageLoading} />

      <View className='relative'>
        {list.length > 0 ? (
          list.map((item: any) => {
            return <ProductItem item={item} key={item.id} isDetele={true} onDelete={handleDelete} />;
          })
        ) : (
          <QcEmptyPage icon='none'></QcEmptyPage>
        )}
      </View>
      <LogoWrap />
    </View>
  );
}

Index.config = {
  navigationBarTitleText: '商品收藏',
  enablePullDownRefresh: true
};
