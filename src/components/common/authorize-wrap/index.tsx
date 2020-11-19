import Taro, { useState, useEffect } from '@tarojs/taro'
import { View, Text, Button, Image } from '@tarojs/components'
import './index.scss'
import api from '@/api/cowebs'
import { IMG_HOST } from '@/config'

function AuthorizeWrap(props: any) {

  const { visible, onHide, isClose } = props

  const [ verifyType, setVerifyType ] = useState(2)
  const [ guide, setGuide ] = useState('')
  const [ registerAudit, setRegisterAudit ] = useState(0)
  const [ auditBg, setAuditBg ] = useState('')
  const [ memberInfo, setMemberInfo ] = useState<any>({})

  useEffect(() => {
    if (visible) {
      setVerifyType(Taro.getStorageSync('verifyType') || 2)

      const _memberInfo = Taro.getStorageSync('memberInfo')
      console.log(_memberInfo)
      if (_memberInfo && _memberInfo.memberId) setMemberInfo(_memberInfo)

      const _guide = Taro.getStorageSync('guide')
      if (_guide) setGuide(_guide)
      else getGUIDE()

      if (_memberInfo.status === 3) {
        contactsGet()
      }
    }

  }, [visible])

  useEffect(() => {
    console.log(memberInfo)
  }, [memberInfo])

  const getGUIDE = async () => {
    const res = await api.GUIDE()
    const data = res.data.data
    Taro.setStorageSync('guide', data ? data.value : '')
    setGuide(data.value || '')
  }

  const contactsGet = async () => {
    console.log('contactsGet -----------')
    const res: any = await api.contactsGet()
    const data = res.data.data
    // data.status = 3
    setMemberInfo(data)
    Taro.setStorageSync('memberInfo', data)
    const _registerAudit = Taro.getStorageSync('registerAudit')
    setRegisterAudit(_registerAudit)
    if (data.status === 3 && _registerAudit === 1) {
      const _auditBg = Taro.getStorageSync('auditBg')
      if (_auditBg) {
        setAuditBg(_auditBg)
      } else {
        AUDIT_BG()
      }
    }
  }

  const AUDIT_BG = async () => {
    const res: any = await api.AUDIT_BG()
    const data = res.data.data
    if (data && data.value) {
      Taro.setStorageSync('auditBg', data.value)
      setAuditBg(data.value)
    }
  }

  const handleHide = () => {
    onHide && onHide()
  }

  const navigateTo = () => {
    // const pages = Taro.getCurrentPages()
    // const currentPage = pages[pages.length - 1]
    // if (/pages\//.test(currentPage.route)) {
    //   Taro.setStorageSync('backUrl', currentPage.route)
    // }
    handleHide()
    Taro.navigateTo({url: '/pagesCoWebs/authorize/index'})
  }


  return visible && (
    <View className="anthorize-wrap">
      <View className="mask"></View>
      <View className="container">
        {isClose && <View className="close qcfont qc-icon-guanbi1" onClick={handleHide}></View>}
        {memberInfo.status === 3 && registerAudit === 1 && auditBg ?
          <View className="audit-img">
            <Image src={IMG_HOST + auditBg} mode="aspectFill" />
          </View>  
          :
          <View className="text-wrap">
            <View className="title">温馨提示</View>
            {memberInfo.isFrozen ?
              <View>该账户已被冻结。</View>
              :
              memberInfo.memberId && memberInfo.status === 2 ?
              <View>审核不通过, 无法操作</View>
              :
              <View>
                {guide ?
                  <Text>{guide}</Text>
                  :
                  <Text>您还不是校友或还未{verifyType === 1 ? '认证' : '注册'}，暂无法查看或者操作，去验证一下吧</Text>
                }
              </View>
            }
            {!memberInfo.memberId &&
              <View className="btn-wrap">
                <Button className="primary" onClick={navigateTo}>去{verifyType === 1 ? '认证' : '注册'}</Button>
              </View>
            }
          </View>
        }
        
      </View>
    </View>
  )
}

AuthorizeWrap.defaultProps = {
  visible: false,
  isClose: false,
  onCancel: () => {},
}
AuthorizeWrap.options = {
  addGlobalClass: true
}

export default AuthorizeWrap
