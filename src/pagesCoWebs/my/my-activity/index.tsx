import Taro, { useState, useEffect, useReachBottom, usePullDownRefresh, useDidShow } from '@tarojs/taro';
import { View } from '@tarojs/components'
import './index.scss';

import api from '@/api/cowebs'
import util from '@/utils/util'


import { QcEmptyPage, LoadingBox, TabsWrap, LogoWrap, AuthorizeWrap, FixedBox } from '@/components/common';
import { ActivityItem } from '@/components/cowebs'

export default function MyActivity() {
  const [ authorizeVisible, setAuthorizeVisible ] = useState(false)
  const [ pageLoading, setPageLoading ] = useState(true)

  const [ tabList ] = useState<any[]>([
    { title: '进行中', id: 1 },
    { title: '已结束', id: 2 },
  ])
  const [ searchData, setSearchData ] = useState<any>({
    status: 1,
    pageSize: 20,
    pageNum: 1,
    total: 0,
  })
  const [ list, setList ] = useState<any[]>([])
  const [ isMount, setIsMount ] = useState(false)

  useEffect(() => {
    signActivityPage()
  }, [])

  useDidShow(() => {
    if (!isMount) return
    signActivityPage(false, 'didShow')
  })

  useReachBottom(() => {
    console.log('onReachBottom')
    if (util.isHasNextPage(searchData, list.length)) {
      signActivityPage(true)
    }
  })

  usePullDownRefresh(() => {
    signActivityPage()
  })

  const handleClickTabs = (e: string | number) =>{
    searchData.status = e;
    setSearchData(searchData);
    signActivityPage()
  }


  // 列表
  const signActivityPage = async (isLoadMore?: boolean, type?: string) => {
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
      const res = await api.signActivityPage(searchData);
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


  return (
    <View>
      <LoadingBox visible={pageLoading} />

      <FixedBox height={90}>
        <TabsWrap tabs={tabList} current={searchData.status} onClickTabs={handleClickTabs} scroll={false} style={{background: '#fff'}} />
      </FixedBox>


      <View className="relative">
        {list.length > 0 ? (
          list.map((item, index) => {
            return <ActivityItem item={item} index={index} key={item.id} showPayStatus={true} />
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
  navigationBarTitleText: '我的活动',
  enablePullDownRefresh: true,
}

// export default Index