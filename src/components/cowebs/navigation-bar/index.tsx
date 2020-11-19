import { View, Text } from '@tarojs/components'
import Taro, { useState, useEffect } from '@tarojs/taro'
import './index.scss'


function NavigationBar(): JSX.Element {

  const systemInfo = Taro.getSystemInfoSync()

  const [ isIOS ] = useState(() => {
    return systemInfo.system.includes('iOS')
  })
  const [ statusBarHeight, setStatusBarHeight ] = useState(0)
  const [ navHeight, setNavHeight ] = useState(0)


  useEffect(() => {
    console.log(systemInfo)
    setStatusBarHeight(() => {
      let height = isIOS ? 6 : 8
      return systemInfo.statusBarHeight + height
    })
    setNavHeight(() => {
      let height = isIOS ? 44 : 48
      return systemInfo.statusBarHeight + height
    })
  }, [])

  const navigateTo = () => {
    // Taro.navigateTo({
    //   url: '/pagesCommon/advanced-search/index'
    // })
  }

  return (
    <View>
      <View style={{height: navHeight + 'px'}}></View>
    
      <View className="navigation-bar" style={{height: navHeight + 'px'}}>
        <View
          className="search"
          style={{marginTop: statusBarHeight + 'px'}}
          onClick={navigateTo}
        >
          <Text className="qcfont qc-icon-sousuo" />
          <Text className="text">搜索</Text>
        </View>
      </View>
    </View>
  )
}

NavigationBar.options = {
  addGlobalClass: true
}

export default NavigationBar