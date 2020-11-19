import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import { IMG_HOST } from '@/config';
import util from '@/utils/util';
import './index.scss';

export default function XiaoetchCoursevipItem(props: any) {
  const { item, index } = props;

  return (
    <View
      className={`qc-course-vip-group_item ${index > 0 ? 'top-line' : ''}`}
      onClick={() => {
        util.navigateTo(`/pagesXiaoetech/course-vip/detail/index?id=${item.id}`);
      }}>
      <View className='cover'>
        <Image src={/http/.test(item.icon) ? item.icon : IMG_HOST + item.icon} mode='aspectFill' />
      </View>
      <View className='content-box'>
        <View className='title'>{item.name}</View>
        <View className='desc'>
          <View>
            <Text className="price">￥{util.filterPrice(item.price)}</Text>/
            {
              {
                '7': '7天',
                '15': '15天',
                '31': '1个月',
                '92': '3个月',
                '183': '半年',
                '366': '1年',
                '731': '2年',
                '1827': '5年'
              }[item.validDays]
            }
          </View>
        </View>
      </View>
    </View>
  );
}

XiaoetchCoursevipItem.defaultProps = {
  item: {},
  index: 0
};

// XiaoetchCoursevipItem.options = {
//   addGlobalClass: true
// };
