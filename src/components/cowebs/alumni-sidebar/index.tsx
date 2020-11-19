import Taro, { useState } from '@tarojs/taro'
import { View, Button } from '@tarojs/components'
import classNames from 'classnames'
import './index.scss'

import { Avatar } from '@/components/common'
// import Avatar from '@/components/common/avatar'

export default function AlumniSidebar(props: any) {

  const { position, headImage, isLike, showLike, onLike, index, onShare } = props

  const [ down, setDown ] = useState(true)

  const handleLike = () => {
    onLike && onLike(index)
  }

  const handleShare = () => {
    console.log('sidebar-handleShare')
    onShare && onShare()
  }

  const cls = classNames({
    'sidebar-box': true,
    'sidebar-box-top': position === 'top',
    'sidebar-hide': !down,
  })

  const likeCls = classNames({
    'qcfont': true,
    'qc-icon-xingxing3': !isLike,
    'qc-icon-xingxing': isLike,
  })

  return (
    // <View className={`sidebar-box ${position === 'top' ? 'sidebar-box-top' : ''} ${down ? '' : 'sidebar-hide'}`}>
    <View className={cls}>
      <View className="item">
        <Avatar imgUrl={headImage} width={60} style={{border: '1px solid #fff', margin: '0 auto'}} />
        <View className="text">了解TA</View>
      </View>
      <Button className="item" plain onClick={handleShare}>
        <View className="qcfont qc-icon-fenxiang" />
        <View className="text">分享</View>
      </Button>
      
      <Button className="item" plain>
        <View className="qcfont qc-icon-liuyan" />
        <View className="text">聊一聊</View>
      </Button>
      {showLike ?
        <Button className="item" plain onClick={handleLike}>
          <View className={likeCls} />
          <View className="text">关注</View>
        </Button>
        :
        <Button className="item" plain>
          <View className="qcfont qc-icon-gengduo" />
          <View className="text">更多</View>
        </Button>
      }
      {position === 'top' &&
        <View className="controller" onClick={() => setDown(prevDown => !prevDown)}>
          <View className={`qcfont ${down ? 'qc-icon-xiangshang1' : 'qc-icon-xiangxiazhanhang'}`} />
        </View>
      }
    </View>
  )
}

AlumniSidebar.options = {
  addGlobalClass: true
}

AlumniSidebar.defaultProps = {
  position: '',
  isLike: false,
  showLike: false,
}