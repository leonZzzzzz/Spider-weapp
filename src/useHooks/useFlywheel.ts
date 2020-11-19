import Taro, { useEffect, useShareAppMessage, usePullDownRefresh, useState } from '@tarojs/taro';
import withShare from '@/utils/withShare';
import http from '@/api';
type PageConfig = {
  layoutAppId: string;
  fileId: string;
  background: string;
  filledBlock: {
    isHeaderColor: boolean;
    height: string;
    themeColor: string;
  };
};

const ext: any = Taro.getExtConfigSync();

Taro.eventCenter.on('setTabbarItem', () => {
  if (ext.tabbar) {
    ext.tabbar.map(item => {
      Taro.setTabBarItem(item);
    });
  }
  Taro.eventCenter.off('setTabbarItem');
});
export function useTabbar() {
  useEffect(() => {
    Taro.eventCenter.trigger('setTabbarItem');
  }, []);
}
export function useCustomInit() {
  useShareAppMessage(() => {
    return withShare();
  });

  usePullDownRefresh(() => {
    Taro.eventCenter.trigger('pullDownRefresh');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  });
}

export function usePageConfig(index: number): PageConfig {
  return ext.pageConfig[index];
}

export function useTheme() {
  return ext.theme;
}

export function useProductList(api, item, searchKey) {
  const [list, setList] = useState<[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    let search = {};
    if (item.length > 0) {
      search[searchKey] = item.map(item => item.id).join(',');
      getData(search);
    } else {
      getData();
    }
    Taro.eventCenter.on('pullDownRefresh', () => {
      setLoading(true);
      if (item.length > 0) {
        search[searchKey] = item.map(item => item.id);
        getData(search);
      } else {
        getData();
      }
    });

    return () => {
      Taro.eventCenter.off('pullDownRefresh');
    };
  }, []);

  const getData = async (search?) => {
    try {
      const res = await http[api](search);
      setList(res.data.data.list);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };
  

  return { list, loading };
}
