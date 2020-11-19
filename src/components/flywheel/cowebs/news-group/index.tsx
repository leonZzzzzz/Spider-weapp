import Taro, { useState, useEffect } from '@tarojs/taro';
import { View } from '@tarojs/components';
import { NewsItem } from '@/components/cowebs';
import { QcEmptyPage, LoadingBox } from '@/components/common';
import api from '@/api/cowebs';
import './index.scss';

export default function QcNewsGroup(props: any) {
  const { options } = props;
  const [list, setList] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (options.item.length > 0) {
      const ids = options.item.map(item => item.id);
      singleContentPageByIds(ids.join('_'));
    } else {
      singleContentPage();
    }
    Taro.eventCenter.on('pullDownRefresh', () => {
      setList([]);
      setPageLoading(e => (e = true));
      if (options.item.length > 0) {
        const ids = options.item.map(item => item.id);
        singleContentPageByIds(ids.join('_'));
      } else {
        singleContentPage();
      }
    });
    return () => {
      Taro.eventCenter.off('pullDownRefresh');
    };
  }, [options]);

  const singleContentPage = async () => {
    const res = await api.singleContentPage({ pageSize: 5 });
    setList(res.data.data.list);
    setPageLoading(false);
  };

  const singleContentPageByIds = async idStr => {
    const res = await api.singleContentPageByIds({ idStr });
    setList(res.data.data.list);
    setPageLoading(false);
  };

  return (
    <View className='qc-news-group relative'>
      {list.length > 0
        ? list.map((item: any, index: number) => {
            return <NewsItem item={item} key={item.id} index={index} />;
          })
        : !pageLoading && <QcEmptyPage icon='none' size='mini'></QcEmptyPage>}
      <LoadingBox visible={pageLoading} size='mini' />
    </View>
  );
}

QcNewsGroup.options = {
  addGlobalClass: true
};

QcNewsGroup.defaultProps = {
  options: {}
};
