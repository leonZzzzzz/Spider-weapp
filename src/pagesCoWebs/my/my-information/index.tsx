import Taro, { useState, useEffect, useReachBottom, usePullDownRefresh, useDidShow, usePageScroll } from '@tarojs/taro';
import { View } from '@tarojs/components'
import './index.scss';

import api from '@/api/cowebs'
import util from '@/utils/util'


import { QcEmptyPage, LoadingBox, TabsWrap, LogoWrap, AuthorizeWrap } from '@/components/common';
import { ResourceItem } from '@/components/cowebs'

export default function MyActivity() {
  const [ authorizeVisible, setAuthorizeVisible ] = useState(false)
  const [ pageLoading, setPageLoading ] = useState(true)

  const [ tabList, setTabList ] = useState<any[]>([
    { title: '进行中', id: 1 },
    { title: '已结束', id: 2 },
  ])
  const [ searchData, setSearchData ] = useState<any>({
    listType: 2,
    pageSize: 20,
    pageNum: 1,
    total: 0,
  })
  const [ list, setList ] = useState<any[]>([])
  const [ isMount, setIsMount ] = useState(false)
  const [ scrollTop, setScrollTop ] = useState(0)

  usePageScroll((res: any) => {
    setScrollTop(res.scrollTop)
  })

  useEffect(() => {
    informationJoined()
  }, [])

  useDidShow(() => {
    if (!isMount) return
    informationJoined(false, 'didShow')
  })

  useReachBottom(() => {
    console.log('onReachBottom')
    if (util.isHasNextPage(searchData, list.length)) {
      informationJoined(true)
    }
  })

  usePullDownRefresh(() => {
    informationJoined()
  })

  const handleClickTabs = (e: string | number) =>{
    searchData.status = e;
    setSearchData(searchData);
    informationJoined()
  }


  // 列表
  const informationJoined = async (isLoadMore?: boolean, type?: string) => {
    try {
      let _list = list
      if (!isLoadMore) {
        if (type !== 'didShow') setPageLoading(true)
        util.pageScrollTo()
        searchData.pageNum = 0
        searchData.total = 0
        _list = []
      }
      searchData.pageNum++

      const res = await api.informationPage(searchData);

      const data = res.data.data
      if (data.total) searchData.total = data.total

      setList([..._list, ...data.list])
      setSearchData(searchData)
      setPageLoading(false)
      Taro.stopPullDownRefresh()
      setIsMount(true)
    } catch (err) {
      setIsMount(true)
      Taro.stopPullDownRefresh()
      setPageLoading(false)
      const memberId = Taro.getStorageSync('memberId')
      if (!memberId) setAuthorizeVisible(true)
    }
  }

  const handleMoreScroll = (height: number) => {
    console.log(height)
    Taro.pageScrollTo({
      scrollTop: scrollTop - height,
    })
  }


  return (
    <View>
      <LoadingBox visible={pageLoading} />

      {/* <View className='tab-wrap'>
        <TabsWrap tabs={tabList} current={searchData.status} onClickTabs={handleClickTabs} scroll={false} />
      </View>
      <View style={{height: Taro.pxTransform(100)}} /> */}

      <View className="relative">
        {list.length > 0 ? (
          list.map(item => {
            return <ResourceItem item={item} key={item.id} isEdit={true} onMoreScroll={handleMoreScroll} />
          })
        ) : (
          <QcEmptyPage icon='none'></QcEmptyPage>
        )}
      </View>
      <LogoWrap />

      <AuthorizeWrap visible={authorizeVisible} />
    </View>
  )
}

MyActivity.config = {
  navigationBarTitleText: '我的资源对接',
  enablePullDownRefresh: true,
}