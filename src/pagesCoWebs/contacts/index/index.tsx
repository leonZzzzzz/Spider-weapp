import Taro, { useState, useDidShow, useReachBottom, usePullDownRefresh, useShareAppMessage } from '@tarojs/taro';
import { View } from '@tarojs/components';
import api from '@/api/cowebs';
import withShare from '@/utils/withShare';
import { QcEmptyPage, LoadingBox, SearchWrap, FixedBox, LogoWrap, ThemeView } from '@/components/common';
import { AlumniCard, InviteDialog } from '@/components/cowebs';
import { checkAuthorize } from '@/utils/authorize';
import useGetListData from '@/useHooks/useGetListData';
import './index.scss';

export default function Index() {
  const [tipVisible, setTipVisible] = useState(false);
  const [contactsInfo, setContactsInfo] = useState<any>({});
  const { list, pageLoading, isMount, load, searchData, handleSearch } = useGetListData(
    'getContactsList',
    {
      name: ''
    },
    false
  );
  const [groups] = useState([
    {
      id: 1,
      title: '校友圈',
      icon: 'qc-icon-iconfontzhizuobiaozhunbduan36',
      url: ''
    },
    {
      id: 2,
      title: '圈子',
      icon: 'qc-icon-iconfontzhizuobiaozhunbduan36',
      url: ''
    },
    {
      id: 3,
      title: '班级',
      icon: 'qc-icon-20',
      url: '/pagesCoWebs/contacts/class/index'
    },
    {
      id: 3,
      title: '关注',
      icon: 'qc-icon-like',
      url: ''
    }
  ]);
  useDidShow(() => {
    console.log('useDidShow ===>', isMount, list.length);
    if (list.length > 0) return;
    checkAuthorize({
      success: () => {
        const contactsInfo = Taro.getStorageSync('contactsInfo');
        if (contactsInfo) {
          setContactsInfo(contactsInfo);
          load();
        } else {
          contactsGet();
        }
      }
    });
  });

  useShareAppMessage(() => {
    return withShare();
  });

  useReachBottom(() => {
    load(true);
  });

  usePullDownRefresh(() => {
    const { memberStatus } = Taro.getStorageSync('authorize');
    if (memberStatus == 2) {
      load();
    }
  });

  const contactsGet = async () => {
    try {
      const res = await api.contactsGet();
      setContactsInfo(res.data.data);
      Taro.setStorageSync('contactsInfo', res.data.data);
      load();
    } catch (error) {
      setContactsInfo({});
    }
  };

  const navigateTo = (url: string, type?: string) => {
    if (!url) return;
    Taro[type ? type : 'navigateTo']({ url });
  };

  return (
    <ThemeView>
      <View className='alumni-contacts'>
        <LoadingBox visible={pageLoading} />

        <FixedBox>
          <SearchWrap
            isInput={true}
            value={searchData.name}
            onConfirm={(e: string) => handleSearch('name', e)}
            onClear={() => handleSearch('name')}
            highLevel={true}
            highLevelUrl='/pagesCoWebs/contacts/search/index'
          />
        </FixedBox>
        {/* <View className="group-items">
        {groups.map((item: any) => {
          return (
            <View key={item.id} className="item" hoverClass="item-hover" onClick={() => navigateTo(item.url, item.type)}>
              <View className={`${item.icon} qcfont`} />
              <View>{item.title}</View>
            </View>
          )
        })}
      </View> */}

        <View className='list relative'>
          {list.length > 0 && contactsInfo.isBind ? (
            list.map((item, index) => {
              return <AlumniCard item={item} index={index} key={item.id} onTip={() => setTipVisible(true)} />;
            })
          ) : (
            <QcEmptyPage icon='none'></QcEmptyPage>
          )}
        </View>

        {/* <View className='relative'>
        {list.length > 0 && !contactsInfo.isBind ? (
          list.map((item, index) => {
            return (
              <AlumniCard item={item} index={index} key={item.id} onTip={() => setTipVisible(true)} type='more-type' />
            );
          })
        ) : (
          <QcEmptyPage icon='none'></QcEmptyPage>
        )}
      </View> */}

        <LogoWrap />

        <InviteDialog visible={tipVisible} onTip={() => setTipVisible(false)} />
      </View>
    </ThemeView>
  );
}

Index.config = {
  navigationBarTitleText: '校友录',
  enablePullDownRefresh: true
};
