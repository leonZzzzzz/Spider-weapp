import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, ScrollView } from '@tarojs/components';
import './index.scss';

import { CourseItem } from '@/components/cowebs'
import { QcEmptyPage, LoadingBox } from '@/components/common';
// import LoadingBox from '@/components/common/loading-wrap'
// import QcEmptyPage from '@/components/common/empty-page'
// import CourseItem from '@/components/cowebs/course-item'

import api from '@/api/cowebs'

// 最新课程
export default function QcCourseGroup() {

  const [ list, setList ] = useState([])
  const [ pageLoading, setPageLoading ] = useState(true)

  useEffect(() => {
    console.log('useEffect coursePage')
    coursePage()

    Taro.eventCenter.on('pullDownRefresh', () => {
      console.log('pullDownRefresh')
      setPageLoading(true)
      coursePage()
    })

    return () => {
      Taro.eventCenter.off('pullDownRefresh')
    }
  }, [])

  

  // 列表
  const coursePage = async () => {
    console.log('coursePage 调用')
    try {
      const res = await api.coursePage({pageSize: 5});
      setList(res.data.data.list)
      console.log('coursePage', res.data.data)
      setPageLoading(false)
    } catch(err) {
      console.log('coursePage err', err)
    }
  }

  return (
    <View className="qc-activity-group relative">
      <ScrollView scrollX className="list">
        {list.length > 0 ? (
          list.map((item: any, index: number) => {
            return <CourseItem item={item} index={index} key={item.id} type="scrollX" />
          })
        ) : (
          !pageLoading && <QcEmptyPage icon='none' size="mini"></QcEmptyPage>
        )}
        <LoadingBox visible={pageLoading} size="mini" />
      </ScrollView>
    </View>
  )
}

QcCourseGroup.options = {
  addGlobalClass: true
}