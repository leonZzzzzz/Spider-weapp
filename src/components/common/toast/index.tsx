import Taro, { useState, useEffect } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './index.scss'

export default function Toast(props: any) {

  const { visible, onClose, duration, text } = props

  const [ show, setShow ] = useState(false)
  const [ animShow, setSnimShow ] = useState(false)

  useEffect(() => {
    // console.log(duration)
    // visible ? showAnim() : animHide()
    visible && showAnim()
  }, [visible])

  // 组件显示动画
  function showAnim(): void {
    setShow(true)
    setTimeout(() => {
      setSnimShow(true)
      console.log(3, new Date())
      setTimeout(() => {
        animHide()
      }, duration)
    }, 250);
  }

  // 组件关闭动画
  function animHide(): void {
    console.log(1, new Date())
    setSnimShow(false)
    setTimeout(() => {
      onHide()
    }, 250);
  }

  // 整个组件关闭
  function onHide(): void {
    setShow(false)
    onClose && onClose()
  }

  return (
    <View>
      {show && (
        <View className={`toast-wrap ${animShow ? 'fade-up' : ''}`}>{text}</View>
      )}
    </View>
  )
}


Toast.defaultProps = {
  text: '',
  visible: false,
  duration: 3000,
  onClose: () => {},
}