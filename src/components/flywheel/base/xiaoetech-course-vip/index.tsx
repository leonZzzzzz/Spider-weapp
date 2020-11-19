import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { LoadingBox, QcEmptyPage, XiaoetchCoursevipItem } from '@/components/common';
import { useProductList } from '@/useHooks/useFlywheel';
import './index.scss';

export default function QcXiaoetectCourseVip(props: any) {
  const { options } = props;
  const { list, loading } = useProductList('courseVipPage', options ? options.item : {}, 'id');

  return (
    <View className='qc-course-vip-group relative'>
      <View className='list'>
        {list.length > 0
          ? list.map((item: any, index: number) => {
              return <XiaoetchCoursevipItem key={item.id} item={item} index={index} />;
            })
          : !loading && <QcEmptyPage icon='none' size='mini'></QcEmptyPage>}
        <LoadingBox visible={false} size='mini' />
      </View>
    </View>
  );
}
QcXiaoetectCourseVip.defaultProps = {
  options: {
    item: []
  }
};
QcXiaoetectCourseVip.options = {
  addGlobalClass: true
};
