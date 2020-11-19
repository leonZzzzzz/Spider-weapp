import { View, Button } from '@tarojs/components'

import './index.scss';

import { Dialog } from '@/components/common'
// import Dialog from '@/components/common/dialog'

export default function InviteDialog(props: any) {

  const { onTip, visible } = props

  const HandleTip = () => {
    onTip && onTip()
  }

  return (
    <Dialog
      visible={visible}
      isMaskClick={false}
    >
      <View className="tip-dialog">
        <View className="close qcfont qc-icon-guanbi1" onClick={HandleTip}></View>
        <View className="content">
          <View>该校友还未加入</View>
          <View>我们邀请Ta加入吧！</View>
        </View>
        <View className="share-btn">
          <Button openType="share" onClick={HandleTip} hoverClass="hover-button">邀 请</Button>
        </View>
      </View>
    </Dialog>
  )
}

InviteDialog.options = {
  addGlobalClass: true
}

InviteDialog.defaultProps = {
  visible: false
}