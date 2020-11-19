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

  // const [ tabList, setTabList ] = useState<any[]>([
  //   { title: '进行中', id: 1 },
  //   { title: '已结束', id: 2 },
  // ])
  const [ searchData, setSearchData ] = useState<any>({
    status: 1,
    pageSize: 20,
    pageNum: 1,
    total: 0,
  })
  const [ list, setList ] = useState<any[]>([])
  const [ isMount, setIsMount ] = useState(false)

  useEffect(() => {
    signCoursePage()
  }, [])

  useDidShow(() => {
    if (!isMount) return
    signCoursePage(false, 'didShow')
  })

  useReachBottom(() => {
    console.log('onReachBottom')
    if (util.isHasNextPage(searchData, list.length)) {
      signCoursePage(true)
    }
  })

  usePullDownRefresh(() => {
    signCoursePage()
  })

  // const handleClickTabs = (e: string | number) =>{
  //   searchData.status = e;
  //   setSearchData(searchData);
  //   signCoursePage()
  // }


  // 列表
  const signCoursePage = async (isLoadMore?: boolean, type?: string) => {
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
      const res = await api.signCoursePage(searchData);
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

      {/* <FixedBox height={90}>
        <TabsWrap tabs={tabList} current={searchData.status} onClickTabs={handleClickTabs} scroll={false} style={{background: '#fff'}} />
      </FixedBox> */}

      <View className="relative">
        {list.length > 0 ? (
          list.map((item, index) => {
            return <ActivityItem item={item} index={index} key={item.id} />
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
  navigationBarTitleText: '我的课程',
  enablePullDownRefresh: true,
}

// export default Index