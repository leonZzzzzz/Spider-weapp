import Taro, {
  useState,
  useEffect,
  useDidShow,
  useReachBottom,
  usePullDownRefresh,
  useShareAppMessage
} from '@tarojs/taro';
import { View, Canvas, Text } from '@tarojs/components';
import './index.scss';

import { QcEmptyPage, LogoWrap, LoadingBox, TabsWrap, FixedBox, Dialog, AuthorizeWrap } from '@/components/common';
import { HelpOrderItem } from '@/components/mall';

import drawQrcode from 'weapp-qrcode';
import withShare from '@/utils/withShare';
import { IMG_HOST } from '@/config';
import api from '@/api/mall';
import util from '@/utils/util';
import useGetListData from '@/useHooks/useGetListData';

export default function Index() {
  // const [ authorizeVisible, setAuthorizeVisible ] = useState(false)
  // const [ pageLoading, setPageLoading ] = useState(true)
  const [tabList] = useState<any[]>([
    { title: '全部', id: '' },
    { title: '进行中', id: 1 },
    { title: '已完成', id: 2 },
    { title: '已过期', id: -1 }
  ]);
  // const [ searchData, setSearchData ] = useState<any>({
  //   pageNum: 0,
  //   pageSize: 20,
  //   total: 0,
  //   helpStatus: '',
  // })
  // const [ list, setList ] = useState<any[]>([])
  // const [ isMount, setIsMount ] = useState(false)
  const [qrcodeVisible, setQrcodeVisible] = useState(false);

  const { list, pageLoading, load, searchData, handleSearch, authorizeVisible } = useGetListData('helpOrderPage', {
    helpStatus: ''
  });

  useEffect(() => {
    Taro.hideShareMenu();
    load();
  }, []);

  // useDidShow(() => {
  //   if (!isMount) return
  //   orderPage(false, 'didShow')
  // })

  useShareAppMessage((res?: any) => {
    if (res.from === 'button') {
      const { title, coverurl, id } = res.target.dataset;
      return withShare({
        title,
        imageUrl: IMG_HOST + coverurl,
        path: `/pagesMall/firend-help/index/index?id=${id}`
      });
    }
  });

  useReachBottom(() => {
    load(true);
  });

  usePullDownRefresh(() => {
    load();
  });

  // /**
  //  * 列表
  //  * @param isLoadMore
  //  */
  // const orderPage = async (isLoadMore?: boolean, type?: string) => {
  //   try {
  //     let _list = list
  //     if (!isLoadMore) {
  //       if (type !== 'didShow') setPageLoading(true)
  //       util.pageScrollTo()
  //       searchData.pageNum = 0
  //       searchData.total = 0
  //       _list = []
  //     }
  //     searchData.pageNum++

  //     const res = await api.helpOrderPage(searchData);

  //     const data = res.data.data
  //     if (data.total) searchData.total = data.total

  //     setList([..._list, ...data.list])
  //     setSearchData(searchData)
  //     setPageLoading(false)
  //     Taro.stopPullDownRefresh()
  //     setIsMount(true)
  //   } catch (err) {
  //     setIsMount(true)
  //     Taro.stopPullDownRefresh()
  //     setPageLoading(false)
  //     const memberId = Taro.getStorageSync('memberId')
  //     if (!memberId) setAuthorizeVisible(true)
  //   }
  // }

  // const handleClickTabs = (e: string | number) =>{
  //   searchData.helpStatus = e;
  //   setSearchData(searchData);
  //   orderPage()
  // }

  const showQrcode = (id: string) => {
    setQrcodeVisible(true);
    setTimeout(() => {
      drawQrcode({
        width: 200,
        height: 200,
        canvasId: 'myQrcode',
        text: JSON.stringify({ id: id, type: 'zhuli' })
      });
    }, 500);
  };

  const handleEnd = (id: string) => {
    load(false, 'refresh', id);
  };

  return (
    <View>
      <LoadingBox visible={pageLoading} />

      <FixedBox height={90}>
        <TabsWrap
          scroll={false}
          tabs={tabList}
          current={searchData.helpStatus}
          onClickTabs={(e: string) => handleSearch('helpStatus', e)}
          style={{ background: '#fff' }}
        />
      </FixedBox>

      <View className='relative'>
        {list.length > 0 ? (
          list.map((item: any) => {
            return <HelpOrderItem item={item} key={item.id} onEnd={handleEnd} onShowQrcode={showQrcode} />;
          })
        ) : (
          <QcEmptyPage icon='none' text='暂无相关订单'></QcEmptyPage>
        )}
      </View>

      <LogoWrap />

      <Dialog visible={qrcodeVisible} position='center' isMaskClick={false} onClose={() => setQrcodeVisible(false)}>
        <View className='code-dialog'>
          <View className='box'>
            <View className='code-img'>
              <Canvas style='width: 200px; height: 200px;' canvasId='myQrcode'></Canvas>
            </View>
            <View className='title'>出示二维码核销并兑换奖品</View>
          </View>
          <View className='close'>
            <Text className='qcfont qc-icon-guanbi1' onClick={() => setQrcodeVisible(false)} />
          </View>
        </View>
      </Dialog>

      <AuthorizeWrap visible={authorizeVisible} />
    </View>
  );
}

Index.config = {
  navigationBarTitleText: '我的助力',
  enablePullDownRefresh: true
};
