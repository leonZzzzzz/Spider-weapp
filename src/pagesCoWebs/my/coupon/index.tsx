import Taro, { useState, useEffect, useReachBottom, usePullDownRefresh, useDidShow } from '@tarojs/taro';
import { View } from '@tarojs/components'
import './index.scss';

import api from '@/api/cowebs'
import util from '@/utils/util'

import { QcEmptyPage, LoadingBox, TabsWrap, LogoWrap, FixedBox } from '@/components/common';
import { CouponItem } from '@/components/cowebs'

export default function Coupon() {

  const [ pageLoading, setPageLoading ] = useState(true)

  const [ tabList, setTabList ] = useState<any[]>([
    { title: '全部', id: '' },
  ])
  const [ searchData, setSearchData ] = useState<any>({
    title: '',
    categoryId: '',
    pageSize: 20,
    pageNum: 1,
    total: 0,
  })
  const [ list, setList ] = useState<any[]>([])
  const [ isMount, setIsMount ] = useState(false)


  useEffect(() => {
    apiCategoryListByType()
    welfarePage()
  }, [])

  useDidShow(() => {
    if (!isMount) return
    welfarePage(false, 'didShow')
  })

  useReachBottom(() => {
    console.log('onReachBottom')
    if (util.isHasNextPage(searchData, list.length)) {
      welfarePage(true)
    }
  })

  usePullDownRefresh(() => {
    welfarePage()
  })

  const handleClickTabs = (e: string | number) =>{
    searchData.categoryId = e;
    setSearchData(searchData);
    welfarePage()
  }

  
  // 分类
  const apiCategoryListByType = async () => {
    const res = await api.categoryListByType({ type: 4 });
    tabList.push(...res.data.data)
    setTabList(tabList)
  }

  // 列表
  const welfarePage = async (isLoadMore?: boolean, type?: string) => {
    let _list = list
    if (!isLoadMore) {
      if (type !== 'didShow') setPageLoading(true)
      util.pageScrollTo()
      searchData.pageNum = 0
      searchData.total = 0
      _list = []
    }
    searchData.pageNum++

    const res = await api.welfarePage(searchData);

    const data = res.data.data
    if (data.total) searchData.total = data.total

    setList([..._list, ...data.list])
    setSearchData(searchData)
    setPageLoading(false)
    Taro.stopPullDownRefresh()
    setIsMount(true)
  }

  return (
    <View>
      <LoadingBox visible={pageLoading} />
      <FixedBox height={90}>
        <TabsWrap tabs={tabList} current={searchData.categoryId} onClickTabs={handleClickTabs} style={{background: '#fff'}} />
      </FixedBox>

      <View className="relative">
        {list.length > 0 ? (
          list.map((item, index) => {
            return <CouponItem item={item} index={index} key={item.id} />
          })
        ) : (
          <QcEmptyPage icon='none'></QcEmptyPage>
        )}
      </View>
      <LogoWrap />
    </View>
  )
}

Coupon.config = {
  navigationBarTitleText: '校友优惠&校友资讯',
  enablePullDownRefresh: true,
}
