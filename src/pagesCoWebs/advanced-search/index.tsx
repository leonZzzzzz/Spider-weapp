import Taro, { useState, useEffect, usePageScroll } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './index.scss'
import api from '@/api/cowebs';

import { QcEmptyPage, SearchWrap, LoadingBox, TabsWrap, LogoWrap } from '@/components/common'
import { ActivityItem, ResourceItem, AlumniCard, CourseItem, NewsItem } from '@/components/cowebs'
import { ProductItem } from '@/components/mall'


export default function AdvancedSearch() {
  const [ pageLoading, setPageLoading ] = useState(false)
  const [ searchData, setSearchData ] = useState({
    keyword: '',
  })
  const [ isSearch, setIsSearch ] = useState(false)
  const [ data, setData ] = useState<any>({})
  const [ historyKeyword, setHistoryKeyword ] = useState<any[]>([])
  const [ current, setCurrent ] = useState('')
  const [ tabList, setTabList ] = useState<any[]>([])
  const [ scrollTop, setScrollTop ] = useState(0)

  useEffect(() => {
    let keyword = Taro.getStorageSync('keyword')
    console.log(keyword)
    setHistoryKeyword(keyword || [])
  }, [])

  usePageScroll((res: any) => {
    setScrollTop(res.scrollTop)
  })


  const handleSearchChange = (value: string) => {
    searchData.keyword = value || ''
    setCurrent('')
    setSearchData(searchData)
    homePageSearch()
    saveSearchKeyWord(searchData.keyword)
    Taro.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
  }

  const handleSearchClear = () => {
    console.log('handleSearchClear')
    searchData.keyword = ''
    setSearchData(searchData)
    setIsSearch(false)
  }
  const handleClickTabs = (current: string) => {
    setCurrent(current)
    Taro.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
  }

  const homePageSearch = async () => {
    setPageLoading(true)
    try {
      const res = await api.homeResponseSearch(searchData)
      console.log(res.data)
      let data = res.data.data
      

      let _data: any = {}
      let num = 0
      const tabs = data.map((item: any) => {
        _data[item.sign] = item.data
        num += item.data.length || 0
        return {
          title: item.showName,
          id: item.sign,
        }
      })
      setTabList([{ id: '', title: '全部', num }, ...tabs])
      setData(_data)
      setPageLoading(false)
      console.log('setState', _data)
      setIsSearch(true)
      saveSearchKeyWord(searchData.keyword)

    } catch (err) {
      console.log(err)
      setPageLoading(false)
    }
  }

  const saveSearchKeyWord = (val: string) => {
    let keyword = Taro.getStorageSync('keyword')
    keyword = keyword || []
    let flag = true
    keyword.map((item: string) => {
      if (item === val) flag = false
    })
    if (flag) keyword.push(val)
    Taro.setStorageSync('keyword', keyword)
    setHistoryKeyword(keyword)
  }
  const deleteHistorySearch = () => {
    Taro.removeStorageSync('keyword')
    setHistoryKeyword([])
  }

  const handleMoreScroll = (height: number) => {
    console.log(height)
    Taro.pageScrollTo({
      scrollTop: scrollTop - height,
    })
  }


  return (
    <View className="search-page">
      <LoadingBox visible={pageLoading} title="搜索中" />

      <View className="fixed-wrap">
        <SearchWrap 
          isInput={true} 
          value={searchData.keyword} 
          onConfirm={(e: any) => handleSearchChange(e)} 
          onClear={handleSearchClear}
        />
        {isSearch &&
          <TabsWrap tabs={tabList} current={current} onClickTabs={handleClickTabs} activeColorStyle="white" bgStyle="primary" />
        }

      
        {!isSearch && historyKeyword.length &&
          <View className="history-box">
            <View className="history-search">
              <View className="h-title-wrap">
                <View>历史搜索</View>
                {historyKeyword.length &&
                  <View className="qcfont qc-icon-shanchu" onClick={deleteHistorySearch} />
                }
              </View>
              <View className="key-wrap">
                {historyKeyword.length && historyKeyword.map((item: string) => {
                  return <View 
                    className="key" 
                    key={item} 
                    onClick={() => handleSearchChange(item)}
                  >{item}</View>
                })}
              </View>
            </View>
            {/* <View className="hot-search-box">
              <View className="hot">热门</View>
              <View className="title">大师傅大大师傅大师傅大师傅大师傅大师傅大师傅师傅</View>
              <View className="title">大师傅大师傅</View>
            </View> */}
          </View>
        }
      </View>

      {isSearch && <View style={{height: Taro.pxTransform(190)}} />}

      {isSearch && current === '' &&
        <View className="search-content-wrap relative">
          <View className="whole-wrap">
            {tabList.map((tab: any) => {
              return ( data[tab.id] && data[tab.id].length > 0 &&
                <View className="w-item">
                  <View className="w-title">{tab.title}</View>
                  <View className="content">
                    {data[tab.id].map((item: any, index: number) => {
                      return ({
                        'activity': <ActivityItem item={item} index={index} key={item.id} />,
                        'course': <CourseItem item={item} index={index} key={item.id} />,
                        'information': <ResourceItem item={item} key={item.id} onMoreScroll={handleMoreScroll} />,
                        'contacts': <AlumniCard item={item} index={index} key={item.id} />,
                        'singleContents': <NewsItem item={item} index={index} key={item.id} />,
                        'mall': <ProductItem item={item} index={index} key={item.id} />
                      }[tab.id])
                    })}
                  </View>
                </View>
              )
            })}
          </View>
          {tabList[0].num === 0 && <QcEmptyPage icon="none" text="没有找到相关的内容" />}
        </View>
      }
      {isSearch && current === 'activity' &&
        <View className="search-content-wrap relative">
          <View className="whole-wrap">
            {(data.activity && data.activity.length) ?
              <View className="w-item">
                <View className="content">
                  {data.activity.map((item: any, index: number) => {
                    return <ActivityItem item={item} index={index} key={item.id} />
                  })}
                </View>
              </View>
              :
              <QcEmptyPage icon="none" text="没有找到相关的内容" />
            }
          </View>
        </View>
      }
      {isSearch && current === 'course' &&
        <View className="search-content-wrap relative">
          <View className="whole-wrap">
            {(data.course && data.course.length) ?
              <View className="w-item">
                <View className="content">
                  {data.course.map((item: any, index: number) => {
                    return <ActivityItem item={item} index={index} key={item.id} />
                  })}
                </View>
              </View>
              :
              <QcEmptyPage icon="none" text="没有找到相关的内容" />
            }
          </View>
        </View>
      }
      {isSearch && current === 'information' &&
        <View className="search-content-wrap relative">
          <View className="whole-wrap">
            {(data.information && data.information.length) ?
              <View className="w-item">
                <View className="content">
                  {data.information.map((item: any, index: number) => {
                    return <ResourceItem item={item} index={index} key={item.id} onMoreScroll={handleMoreScroll} />
                  })}
                </View>
              </View>
              :
              <QcEmptyPage icon="none" text="没有找到相关的内容" />
            }
          </View>
        </View>
      }
      {isSearch && current === 'contacts' &&
        <View className="search-content-wrap relative">
          <View className="whole-wrap">
            {(data.contacts && data.contacts.length > 0) ?
              <View className="w-item">
                {/* <View className="content white"> */}
                <View className="content white-box" style="padding: 1rpx 0rpx;">
                  {data.contacts.map((item: any, index: number) => {
                    return <AlumniCard item={item} index={index} key={item.id} />
                  })}
                </View>
              </View>
              :
              <QcEmptyPage icon="none" text="没有找到相关的内容" />
            }
          </View>
        </View>
      }
      {isSearch && current === 'singleContents' &&
        <View className="search-content-wrap relative">
          <View className="whole-wrap">
            {(data.singleContents && data.singleContents.length) ?
              <View className="w-item">
                <View className="content">
                  {data.singleContents.map((item: any, index: number) => {
                    return <NewsItem item={item} index={index} key={item.id} />
                  })}
                </View>
              </View>
              :
              <QcEmptyPage icon="none" text="没有找到相关的内容" />
            }
          </View>
        </View>
      }
      {isSearch && current === 'mall' &&
        <View className="search-content-wrap relative">
          <View className="whole-wrap">
            {(data.mall && data.mall.length) ?
              <View className="w-item">
                <View className="content">
                  {data.mall.map((item: any, index: number) => {
                    return <ProductItem item={item} index={index} key={item.id} />
                  })}
                </View>
              </View>
              :
              <QcEmptyPage icon="none" text="没有找到相关的内容" />
            }
          </View>
        </View>
      }

      <LogoWrap />
    </View>
  )
}

AdvancedSearch.config = {
  navigationBarTitleText: '高级搜索',
}