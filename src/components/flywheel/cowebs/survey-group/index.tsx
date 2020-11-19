import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './index.scss';

import { SurveyItem } from '@/components/cowebs'
import { QcEmptyPage, LoadingBox } from '@/components/common';
// import LoadingBox from '@/components/common/loading-wrap'
// import QcEmptyPage from '@/components/common/empty-page'
// import SurveyItem from '@/components/cowebs/survey-item'

import api from '@/api/cowebs';

export default function QcSurveyGroup() {

  const [ list, setList ] = useState<any[]>([])
  const [ pageLoading, setPageLoading ] = useState(true)

  useEffect(() => {
    surveyPage()
    Taro.eventCenter.on('pullDownRefresh', () => {
      console.log('pullDownRefresh')
      setPageLoading(true)
      setList([])
      surveyPage()
    })

    return () => {
      Taro.eventCenter.off('pullDownRefresh')
    }
  }, [])

  const surveyPage = async () => {
    const res = await api.surveyPage({pageSize: 5})
    setList(res.data.data.list)
    setPageLoading(false)
  }

  return (
    <View className="qc-survey-group relative">
      <View>
        {list.length > 0 ? (
          list.map((item: any, index: number) => {
            return <SurveyItem item={item} key={item.id} index={index} />
          })
        ) : (
          !pageLoading && <QcEmptyPage icon='none' size="mini"></QcEmptyPage>
        )}
        <LoadingBox visible={pageLoading} size="mini" />
      </View>
    </View>
  )
}

QcSurveyGroup.options = {
  addGlobalClass: true
}