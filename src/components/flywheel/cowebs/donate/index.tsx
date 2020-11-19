import Taro, { useState, useEffect, useDidShow } from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import './index.scss';

import { QcEmptyPage, LoadingBox } from '@/components/common';
import { DonateItem} from '@/components/cowebs';

import api from '@/api/donate';
import Utils from '@/utils/util';

export default function QcDonate() {

  const [ total, setTotal ] = useState<number>(0)
  const [ list, setList ] = useState<any[]>([])
  const [ pageLoading, setPageLoading ] = useState(true)

  useEffect(() => {
    donateOrderPage()
  }, [])

  useDidShow(() => {
    donateOrderPage()
  })

  const donateOrderPage = async () => {
    try {
      const res = await api.donateOrderPage({pageSize: 3})
      setPageLoading(false)
      setTotal(res.data.data.total)
      setList(res.data.data.list)
    } catch (error) {
      setPageLoading(false)
    }
  }

  return (
    <View className="qc-donate relative">
      <View className='qc-donate__title'>随喜乐捐捐赠名单</View>
      <View className='qc-donate__list'>
        {list.length > 0 ? (
          list.map((item: any, index: number) => {
            return <DonateItem item={item} index={index} key={item.id} />
          })
        ) : (
          !pageLoading && <QcEmptyPage icon='none' size="mini" text='暂无捐赠记录'></QcEmptyPage>
        )}
        <LoadingBox visible={pageLoading} size="mini" />
      </View>
      <View className='qc-donate__footer'>
        <View className='left'><Text className='left-value'>{total}</Text>人已参与
          {/* <Text className='qcfont qc-icon-chevron-right'></Text> */}
        </View>
        <View className='btn' onClick={() => Utils.navigateTo('/pagesCoWebs/donate/category/index')}>我要随喜</View>
      </View>
    </View>
  )
}

QcDonate.options = {
  addGlobalClass: true
}