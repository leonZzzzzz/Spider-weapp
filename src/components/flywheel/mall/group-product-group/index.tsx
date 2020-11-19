import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, ScrollView } from '@tarojs/components'
import './index.scss'

import api from '@/api/mall'

// import GroupProductItem from '@/components/mall/group-product-item'
// import QcEmptyPage from '@/components/common/empty-page';
// import LoadingBox from '@/components/common/loading-wrap';
import { GroupProductItem } from '@/components/mall'
import { LoadingBox, QcEmptyPage } from '@/components/common';

export default function GroupProductGroup() {
  
  const [ list, setList ] = useState([])
  const [ pageLoading, setPageLoading ] = useState(true)

  useEffect(() => {
    console.log('useEffect groupProductPage')
    groupProductPage()

    Taro.eventCenter.on('pullDownRefresh', () => {
      console.log('pullDownRefresh')
      setPageLoading(true)
      groupProductPage()
    })

    return () => {
      Taro.eventCenter.off('pullDownRefresh')
    }
  }, [])

  // 列表
  const groupProductPage = async () => {
    console.log('groupProductPage 调用')
    try {
      const res = await api.groupProductPage({pageSize: 5});
      setList(res.data.data.list)
      console.log('groupProductPage', res.data.data)
      setPageLoading(false)
    } catch(err) {
      console.log('groupProductPage err', err)
    }
  }


  return (
    <View className="qc-group-product-group relative">
      <ScrollView scrollX className="list">
        {list.length > 0 ? (
          list.map((item: any, index: number) => {
            return <GroupProductItem item={item} index={index} key={item.id} type="scrollX" />
          })
        ) : (
          !pageLoading && <QcEmptyPage icon='none' size="mini"></QcEmptyPage>
        )}
        <LoadingBox visible={pageLoading} size="mini" />
      </ScrollView>
    </View>
  )
}

GroupProductGroup.defaultProps = {
  groupProductData: []
}
GroupProductGroup.options = {
  addGlobalClass: true
}
