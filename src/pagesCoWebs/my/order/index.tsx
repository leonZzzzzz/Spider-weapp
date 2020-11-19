import Taro, { useState, useEffect, useReachBottom, usePullDownRefresh } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './index.scss'

import api from '@/api/cowebs'
import util from '@/utils/util'
import { QcEmptyPage, LoadingBox, LogoWrap,  TabsWrap, FixedBox } from '@/components/common';
import { OrderItem } from '@/components/cowebs'

export default function Index() {
  const [ pageLoading, setPageLoading ] = useState(true)
  const [ searchData, setSearchData ] = useState<any>({
    orderType: 2,
    pageSize: 20,
    pageNum: 1,
    total: 0,
  })
  const [ list, setList ] = useState<any[]>([])
  const [ tabList ] = useState<any[]>([
    { title: '活动', id: 2 },
    { title: '课程', id: 3 },
  ])

  useEffect(() => {
    getPage()
  }, [])

  useReachBottom(() => {
    console.log('onReachBottom')
    if (util.isHasNextPage(searchData, list.length)) {
      getPage(true)
    }
  })

  usePullDownRefresh(() => {
    getPage()
  })
  // 列表
  const getPage = async (isLoadMore?: boolean, type?: string) => {
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
      const res = await api.myPayPage(searchData);
      const data = res.data.data
      if (data.total) searchData.total = data.total

      setList([..._list, ...data.list])
      setSearchData(searchData)
      setPageLoading(false)
      Taro.stopPullDownRefresh()
    } catch (err) {
      Taro.stopPullDownRefresh()
      setPageLoading(false)
    }
  }

  const handleClickTabs = (e: string | number) =>{
    searchData.orderType = e;
    setSearchData(searchData);
    getPage()
  }

  return (
    <View>
      <LoadingBox visible={pageLoading} />

      <FixedBox height={90}>
        <TabsWrap tabs={tabList} current={searchData.orderType} onClickTabs={handleClickTabs} scroll={false} style={{background: '#fff'}} />
      </FixedBox>

      <View className="relative">
        {list.length > 0 ? (
          list.map((item, index) => {
            return <OrderItem item={item} index={index} key={item.id} />
          })
        ) : (
          <QcEmptyPage icon='none'></QcEmptyPage>
        )}
      </View>
      <LogoWrap />
    </View>
  )
}

Index.config = {
  navigationBarTitleText: '我的订单',
  enablePullDownRefresh: true,
}