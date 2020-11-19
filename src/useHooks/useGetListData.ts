import Taro, { useState, useEffect } from '@tarojs/taro';
import api from '@/api/index';
import util from '@/utils/util';

const useGetListData = (apiString: string, search: any = {}, init: boolean = true, cb?: any) => {
  const [apiStr, setApiStr] = useState(apiString);
  const [authorizeVisible, setAuthorizeVisible] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [isMount, setIsMount] = useState(false);
  const [searchData, setSearchData] = useState<any>(() => {
    const pageData = {
      pageSize: 20,
      pageNum: 0,
      total: 0
    };
    return Object.assign(pageData, search);
  });
  const [list, setList] = useState<any[]>([]);
  const [packList, setPackList] = useState<any[]>([]);

  useEffect(() => {
    console.log('apiStr', apiStr);
    if (init) load();
  }, [apiStr]);

  const load = async (isLoadMore?: boolean, type?: 'didShow' | 'refresh', resetId?: string) => {
    console.log('isLoadMore type resetId =======>', isLoadMore, type, resetId);
    try {
      if (isLoadMore && !util.isHasNextPage(searchData, list.length)) return;
      let _list = JSON.parse(JSON.stringify(list));
      if (!isLoadMore) {
        if (type !== 'didShow') setPageLoading(true);

        if (resetId && type === 'refresh') {
          console.log('_list =======>', _list);
          const resetIdx = _list.findIndex(item => item.id === resetId);
          console.log('resetIdx ==========>', resetIdx);
          searchData.pageNum = Math.floor(resetIdx / searchData.pageSize);
          if (searchData.pageNum > 0) {
            _list = _list.splice(0, searchData.pageNum * searchData.pageSize);
            console.log('_list.splice', searchData.pageNum * searchData.pageSize, _list);
          } else {
            _list = [];
          }
        } else {
          searchData.pageNum = 0;
          searchData.total = 0;
          _list = [];
          util.pageScrollTo();
        }
      }
      searchData.pageNum++;
      const res = await api[apiStr](searchData);

      const data = res.data.data;

      if (data.total) searchData.total = data.total;

      console.warn('list =========>', [..._list, ...data.list]);
      if (cb) setPackList(cb([..._list, ...data.list]));
      setList([..._list, ...data.list]);
      setSearchData(searchData);
      setPageLoading(false);
      Taro.stopPullDownRefresh();
      setIsMount(true);
    } catch (err) {
      console.error('load =========>', err);
      if (err.data.code === 63021 && !Taro.getStorageSync('memberId')) {
        setAuthorizeVisible(true);
      }
    }
  };

  const handleSearch = (key: string, value: string | number = '') => {
    console.log('handleSearch ==========>', key, value);
    searchData[key] = value !== '' ? value : '';
    setSearchData(searchData);
    load();
    util.pageScrollTo();
  };

  return {
    list,
    pageLoading,
    setPageLoading,
    isMount,
    load,
    searchData,
    setSearchData,
    handleSearch,
    setApiStr,
    authorizeVisible,
    setAuthorizeVisible,
    packList
  };
};

export default useGetListData;
