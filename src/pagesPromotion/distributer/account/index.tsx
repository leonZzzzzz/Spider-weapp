import Taro, { useState, useEffect } from '@tarojs/taro'
import { View, Text, Button, Input } from "@tarojs/components"
import './index.scss'

import api from '@/api/index'
import util from '@/utils/util'
import { LoadingBox, LogoWrap } from '@/components/common'
import { useTheme } from '@/useHooks/useFlywheel'


export default function Index() {

  const [ pageLoading, setPageLoading ] = useState(true)
  const [ model, setModel ] = useState<any>({
    amount: '',
  })
  const [ withdraw, setWithdraw ] = useState<any>({
    withdrawAccount: '',
    withdrawName: '',
  })
  const theme =useTheme()
  useEffect(() => {
    getWithdrawAccount()
  }, [])

  const getWithdrawAccount = async () => {
    const res = await api.getWithdrawAccount()
    setWithdraw(res.data.data)
    setPageLoading(false)
  }

  const updateWithdrawAccount = async () => {
    if (!withdraw.withdrawAccount || !withdraw.withdrawName) {
      util.showToast(`请输入提现${!withdraw.withdrawAccount ? '账号' : '姓名'}`)
      return
    }
    const res = await api.updateWithdrawAccount(withdraw)
    util.showToast(res.data.message || '修改成功')
  }

  const handleSubmit = () => {
    if (!model.amount) {
      util.showToast('请输入金额', 'none', 2000, false)
      return
    }
    console.log(model)
    model.amount = model.amount.replace(/^\s*|\s*$/g, "")
    const reg = /((^[1-9]\d*)|^0)(\.\d{0,2}){0,1}$/
    if (!reg.test(model.amount)) {
      const str = model.amount.split('.')
      if (str.length === 2 && str[1].length > 2 && !isNaN(Number(str[1]))) {
        util.showToast('金额最多到小数点后两位，请重新输入', 'none', 2000, false)
      } else {
        util.showToast('金额格式错误，请重新输入', 'none', 2000, false)
      }
      return
    }
    console.log(model)
    let _model = JSON.parse(JSON.stringify(model))
    _model.amount = util.mul(_model.amount, 100)
    if (_model.amount === 0) {
      this.showToast('金额需大于0', 'none', 2000, false)
      return
    }
    console.log(_model)
    distributerCommissionWithdraw(_model)
  }

  const distributerCommissionWithdraw = async (params: any) => {
    const res = api.distributerCommissionWithdraw(params)
  }

  return (
    <View className="account" style={theme}>
      <LoadingBox visible={pageLoading} />

      <View className="take-card">
        <View className="input-box">
          <Text className="label">提现账号</Text>
          <Input value={withdraw.withdrawAccount} onInput={(e) => {
            withdraw.withdrawAccount = e.detail.value
            setWithdraw(withdraw)
          }} />
        </View>
        <View className="input-box">
          <Text className="label">提现姓名</Text>
          <Input value={withdraw.withdrawName} onInput={(e) => {
            withdraw.withdrawName = e.detail.value
            setWithdraw(withdraw)
          }} />
        </View>
        <Button className="take-btn" type="primary" onClick={updateWithdrawAccount}>保存</Button>
      </View>

      <View className="take-card">
        <View>请输入提现金额</View>
        <View className="input-box">
          <Text className="symbol">￥</Text>
          <Input value={model.amount} className="price-input" type="digit" onInput={(e) => {
            model.amount = e.detail.value
            setModel(model)
          }} />
          {model.amount &&
            <Text className="qcfont qc-icon-close" onClick={() => {
              model.amount = ''
              setModel(model)
            }} />
          }
        </View>
        <View className="grey">可提现余额 ￥0.00</View>
        <Button className="take-btn" type="primary" onClick={handleSubmit}>提现</Button>
      </View>


      <View className="complete-card" hoverClass="hover-white-color" onClick={() => util.navigateTo('/pagesPromotion/distributer/account-details/index')}>
        <View>
          <Text className="qcfont qc-icon-yitixian" />
          <Text className="total-amount">已提现（￥0.00）</Text>
        </View>
        <View className="qcfont qc-icon-chevron-right"></View>
      </View>

      <LogoWrap />
    </View>
  )
}

Index.config = {
  navigationBarTitleText: '我的账户',
}