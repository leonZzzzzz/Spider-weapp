import Taro, { useState, useEffect, useReachBottom, usePullDownRefresh, useDidShow } from '@tarojs/taro';
import { View } from '@tarojs/components'
import './index.scss';

import api from '@/api/cowebs'
import util from '@/utils/util'


import { QcEmptyPage, LoadingBox, LogoWrap, AuthorizeWrap } from '@/components/common';
import { SurveyItem } from '@/components/cowebs'

export default function Index() {
  const [ authorizeVisible, setAuthorizeVisible ] = useState(false)
  const [ pageLoading, setPageLoading ] = useState(true)
  const [ list, setList ] = useState<any[]>([])
  const [ tabList, setTabList ] = useState<any[]>([
    {id: '', name: '全部' } 
  ])

  const [ searchData, setSearchData ] = useState<any>({
    keyword: '',
    categoryId: '',
    pageSize: 20,
    pageNum: 1,
    total: 0,
  })
  const [ isMount, setIsMount ] = useState(false)


  useEffect(() => {
    categoryListByType()
    surveyPage()
  }, [])

  useDidShow(() => {
    if (!isMount) return
    surveyPage(false, 'didShow')
  })

  useReachBottom(() => {
    console.log('onReachBottom')
    if (util.isHasNextPage(searchData, list.length)) {
      surveyPage(true)
    }
  })

  usePullDownRefresh(() => {
    surveyPage()
  })


  const categoryListByType = async () => {
    const res = await api.categoryListByType({type: 13})
    setTabList([...tabList, ...res.data.data])
  }

  const handleSearch = (value?: string) => {
    searchData.keyword = value || ''
    setSearchData(searchData);
    surveyPage()
  }

  const handleClickTabs = (e: string | number) =>{
    searchData.categoryId = e;
    setSearchData(searchData);
    surveyPage()
  }
  // 列表
  const surveyPage = async (isLoadMore?: boolean, type?: string) => {
    try{
      let _list = list
      if (!isLoadMore) {
        if (type !== 'didShow') setPageLoading(true)
        searchData.pageNum = 0
        searchData.total = 0
        _list = []
      }
      searchData.pageNum++

      const res = await api.surveyPage(searchData);

      const data = res.data.data
      if (data.total) searchData.total = data.total

      setList([..._list, ...data.list])
      setSearchData(searchData)
      setPageLoading(false)
      Taro.stopPullDownRefresh()
      setIsMount(true)
    } catch(err) {
      if (err.data.code === 63021 && !Taro.getStorageSync('memberId')) {
        setAuthorizeVisible(true)
      }
    }
  }

  return (
    <View>
      <LoadingBox visible={pageLoading} />

      <View className="survey-list relative">
        {list.length > 0 ? (
          list.map(item => {
            return <SurveyItem item={item} key={item.id} />
          })
        ) : (
          <QcEmptyPage icon='none'></QcEmptyPage>
        )}
      </View>
      <LogoWrap />
      <AuthorizeWrap visible={authorizeVisible} onHide={() => setAuthorizeVisible(false)} isClose={true} />
    </View>
  )
}

Index.config = {
  navigationBarTitleText: '问卷列表',
  enablePullDownRefresh: true,
}

// export default Index