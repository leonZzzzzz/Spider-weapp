import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, Button, ScrollView } from '@tarojs/components';
import { AlumniCard } from '@/components/cowebs'
import { QcEmptyPage, LoadingBox, AuthorizeWrap, Dialog } from '@/components/common';
// import LoadingBox from '@/components/common/loading-wrap'
// import QcEmptyPage from '@/components/common/empty-page'
// import AuthorizeWrap from '@/components/common/authorize-wrap'
// import Dialog from '@/components/common/dialog'
// import AlumniCard from '@/components/cowebs/activity-item'
import api from '@/api/cowebs';
import { useTheme } from '@/useHooks/useFlywheel';
import './index.scss';

// 校友圈
export default function QcAlumniCirCle() {

  const [ authorizeVisible, setAuthorizeVisible ] = useState(false)
  const [ list, setList ] = useState<any[]>([])
  const [ tipVisible, setTipVisible ] = useState(false)
  const [ pageLoading, setPageLoading ] = useState(true)
  const theme =useTheme()
  useEffect(() => {
    getContactsList()
    console.log('QcAlumniCirCle')

    Taro.eventCenter.on('pullDownRefresh', () => {
      console.log('pullDownRefresh')
      setPageLoading(true)
      setList([])
      getContactsList()
    })

    return () => {
      Taro.eventCenter.off('pullDownRefresh')
    }
  }, [])

  const getContactsList = async () => {
    const res = await api.getContactsList({pageSize: 5, bindStatus: 1})
    setList(res.data.data.list)
    setPageLoading(false)
  }

  return (
    <View className="qc-alumni-circle relative" style={theme}>
      <ScrollView className="overflow-x" scrollX>
        {list.length > 0 ? (
          list.map((item: any, index: number) => {
            return <AlumniCard item={item} key={item.id} index={index} type="scrollX" onAuthorize={() => setAuthorizeVisible(true)} onTip={() => setTipVisible(true)} />
          })
        ) : (
          !pageLoading && <QcEmptyPage icon='none' size="mini"></QcEmptyPage>
        )}
        <LoadingBox visible={pageLoading} size="mini" />
      </ScrollView>

      <AuthorizeWrap visible={authorizeVisible} onHide={() => setAuthorizeVisible(false)} isClose={true} />
      
      <Dialog
        visible={tipVisible}
        isMaskClick={false}
        onClose={() => setTipVisible(false)}
      >
        <View className="tip-dialog">
          <View className="close qcfont qc-icon-guanbi1" onClick={() => setTipVisible(false)}></View>
          <View className="content">
            <View>该校友还未加入</View>
            <View>我们邀请Ta加入吧！</View>
          </View>
          <View className="bottom">
            <Button openType="share" onClick={() => setTipVisible(false)}>邀 请</Button>
          </View>
        </View>
      </Dialog>
    </View>
  )
}

QcAlumniCirCle.options = {
  addGlobalClass: true
}