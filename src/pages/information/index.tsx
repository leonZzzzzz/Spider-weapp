import Taro, { useState, useEffect, useReachBottom, usePullDownRefresh, usePageScroll, useDidShow } from '@tarojs/taro';
import { View } from '@tarojs/components';
import api from '@/api/cowebs';
import useGetListData from '@/useHooks/useGetListData';
import {
  QcEmptyPage,
  LoadingBox,
  SearchWrap,
  LogoWrap,
  AuthorizeWrap,
  TabsWrap,
  FixedBox,
  ThemeView
} from '@/components/common';
import { ResourceItem } from '@/components/cowebs';
import { checkAuthorize } from '@/utils/authorize';
import { useSelector, useDispatch } from '@tarojs/redux';
import { saveRefreshId } from '@/store/actions/information';
import './index.scss';
import { useTabbar } from '@/useHooks/useFlywheel';

export default function Index() {
  const [tabList, setTabList] = useState<any[]>([{ id: '', name: '全部' }]);
  const [scrollTop, setScrollTop] = useState(0);
  const {
    list,
    pageLoading,
    isMount,
    load,
    searchData,
    setSearchData,
    handleSearch,
    authorizeVisible,
    setAuthorizeVisible
  } = useGetListData(
    'informationPage',
    {
      keyword: '',
      categoryId: ''
    },
    false
  );

  const { refreshId } = useSelector((state: any) => state.information);
  const dispatch = useDispatch();
  useEffect(() => {
    informationPageTitle();
    const moreCategoryId = Taro.getStorageSync('moreCategoryId');
    categoryListByType(moreCategoryId);
    if (!moreCategoryId) {
      load();
    }
  }, []);

  useDidShow(() => {
    if (!isMount) return;
    const moreCategoryId = Taro.getStorageSync('moreCategoryId');
    if (moreCategoryId) {
      Taro.removeStorageSync('moreCategoryId');
      if ((moreCategoryId === 'all' && searchData.categoryId === '') || moreCategoryId === searchData.categoryId)
        return;
      searchData.categoryId = moreCategoryId === 'all' ? '' : moreCategoryId;
      setSearchData(searchData);
      load();
    } else {
      if (refreshId) {
        if (refreshId === 'new') load();
        else load(false, 'refresh', refreshId);
        dispatch(saveRefreshId(''));
      }
    }
  });
  useTabbar();
  useReachBottom(() => {
    load(true);
  });

  usePullDownRefresh(() => {
    categoryListByType(searchData.categoryId || 'all');
  });

  usePageScroll((res: any) => {
    setScrollTop(res.scrollTop);
  });

  const informationPageTitle = async () => {
    const res = await api.informationPageTitle();
    if (res.data.message) {
      Taro.setNavigationBarTitle({
        title: res.data.message
      });
    }
  };

  // 分类
  const categoryListByType = async (categoryId: string) => {
    console.log('categoryId', categoryId);
    const res = await api.categoryListByType({ type: 13 });
    let data = res.data.data;
    setTabList([{ title: '全部', id: '' }, ...data]);
    if (categoryId) {
      let _idx = data.findIndex((item: any) => item.id == categoryId);
      if (_idx === -1) categoryId = 'all';
      searchData.categoryId = categoryId === 'all' ? '' : categoryId;
      setSearchData(searchData);
      load();
      Taro.removeStorageSync('moreCategoryId');
    }
  };

  const navigateTo = () => {
    checkAuthorize({
      success: () => {
        Taro.navigateTo({
          url: `/pagesCoWebs/information/category/index`
        });
      }
    });
  };

  const handleMoreScroll = (height: number) => {
    console.log(height);
    Taro.pageScrollTo({
      scrollTop: scrollTop - height
    });
  };

  return (
    <ThemeView>
      <LoadingBox visible={pageLoading} />

      <FixedBox height={190}>
        <SearchWrap
          isInput={true}
          value={searchData.keyword}
          onConfirm={(e: string) => handleSearch('keyword', e)}
          onClear={() => handleSearch('keyword')}
        />
        <TabsWrap
          tabs={tabList}
          current={searchData.categoryId}
          onClickTabs={(e: string) => handleSearch('categoryId', e)}
        />
      </FixedBox>

      <View className='list relative'>
        {list.length > 0 ? (
          list.map(item => {
            return <ResourceItem item={item} id={item.id} key={item.id} onMoreScroll={handleMoreScroll} />;
          })
        ) : (
          <QcEmptyPage icon='none'></QcEmptyPage>
        )}
      </View>

      <LogoWrap bottom={80} />

      <View className='release-btn'>
        <View className='qcfont qc-icon-jia1' onClick={() => navigateTo()} />
      </View>

      <AuthorizeWrap visible={authorizeVisible} onHide={() => setAuthorizeVisible(false)} />
    </ThemeView>
  );
}

Index.config = {
  navigationBarTitleText: '资源对接',
  enablePullDownRefresh: true
};
