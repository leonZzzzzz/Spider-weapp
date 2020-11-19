import Taro, { useState, useEffect, useShareAppMessage } from '@tarojs/taro'
import { View, Text, Image, Input } from "@tarojs/components"
import './index.scss'

import { IMG_HOST } from '@/config'
import api from '@/api/index'
import withShare from '@/utils/withShare'
import { LoadingBox, LogoWrap, ContentWrap, Dialog } from '@/components/common'

export default function Index() {
  const [ pageLoading, setPageLoading ] = useState(true)
  const [ rule, setRule ] = useState<any>({})
  const [ qa, setQa ] = useState<any>({})
  const [ rankList ] = useState<any[]>([
    {
      id: 1,
      title: '普通推广员',
      desc: '用户成为推广员时，默认是该等级。',
      ratio: 20,
      icon: 'qc-icon-ji',
      iconUrl: '/attachments/null/9a6aef40058d4dcba14b50ba1b06f178.jpg',
    },
    {
      id: 2,
      title: '高级推广员',
      desc: '累计推广金额1000元，升级为高级推广员。',
      ratio: 30,
      icon: 'qc-icon-ji1',
      iconUrl: '/attachments/null/9a6aef40058d4dcba14b50ba1b06f178.jpg',
    },
    {
      id: 3,
      title: '超级推广员',
      desc: '累计推广金额10000元，升级为超级推广员。',
      ratio: 40,
      icon: 'qc-icon-ji2',
      iconUrl: '/attachments/null/9a6aef40058d4dcba14b50ba1b06f178.jpg',
    }
  ])
  const [ questionList ] = useState<any[]>([
    {
      id: 1,
      title: '普通推广员普通推广员普通推广员普通推广员普通推广员普通推广员',
      desc: '用户成为推广员时，默认用户成为推广员时，默认是该等级用户成为推广员时，默认是该等级用户成为推广员时，默认是该等级用户成为推广员时，默认是该等级是该等级',
    },
    {
      id: 2,
      title: '普通推广员',
      desc: '用户成为推广员时，默认是该等级',
    }
  ])

  useEffect(() => {
    distributerMaterialRuleGet()
    distributerMaterialQaGet()
  }, [])

  const distributerMaterialRuleGet = async () => {
    const res = await api.distributerMaterialRuleGet()
    const data = res.data.data
    setRule(data)
    setPageLoading(false)
  }
  const distributerMaterialQaGet = async () => {
    const res = await api.distributerMaterialQaGet()
    const data = res.data.data
    setQa(data)
  }

  return (
    <View className="rule">
      <LoadingBox visible={pageLoading} />
      <View className="rule-group relative">
        <View className="title">
          <Text className="qcfont qc-icon-zuobian" />
          <Text>{rule.title}</Text>
          <Text className="qcfont qc-icon-youbian" />
        </View>
        <View className="card rank box-shadow">
          <ContentWrap content={rule.content} />
        </View>
      </View>
      <View className="rule-group relative">
        <View className="title">
          <Text className="qcfont qc-icon-zuobian" />
          <Text>{qa.title}</Text>
          <Text className="qcfont qc-icon-youbian" />
        </View>
        <View className="card box-shadow">
          {/* {questionList.map((item: any) => {
            return (
              <View key={item.id} className="item">
                <View className="title-wrap">{item.title}</View>
                <View className="desc">{item.desc}</View>
              </View>
            )
          })} */}
          <ContentWrap content={qa.content} />
        </View>
      </View>

      <LogoWrap />
    </View>
  )
}

Index.config = {
  navigationBarTitleText: '推广规则',
}