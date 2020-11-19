import { View, Image } from '@tarojs/components';
import { IMG_HOST } from '@/config';
import useGetListData from '@/useHooks/useGetListData';
import util from '@/utils/util';
import { LogoWrap } from '@/components/common';
import './index.scss';

function XiaoetechResource() {
  const { list } = useGetListData('resourcePage');
  return (
    <View className='xiaoetech-resource'>
      {list.map(item => {
        return (
          <View
            key={item.id}
            className='xiaoetech-resource__item'
            onClick={() => {
              util.navigateTo(`/pagesXiaoetech/course-vip/detail/index?id=${item.goodsId}`);
            }}>
            <View className='xiaoetech-resource__cover'>
              <Image
                src={/http/.test(item.icon) ? item.icon : IMG_HOST + item.icon}
                style='width:70px;height:70px'
                mode='aspectFill'></Image>
            </View>
            <View className='xiaoetech-resource__info'>
              <View className='xiaoetech-resource__info-title'>{item.title}</View>
              <View className='xiaoetech-resource__info-time'>有效期：{item.expireTime.substring(0, 10)}</View>
            </View>
          </View>
        );
      })}
      <LogoWrap></LogoWrap>
    </View>
  );
}
XiaoetechResource.config = {
  navigationBarTitleText: '我的VIP'
};
export default XiaoetechResource;
