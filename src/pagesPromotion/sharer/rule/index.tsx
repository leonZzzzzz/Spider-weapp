import Taro, { useState, useEffect } from '@tarojs/taro'
import { View, Text, Image } from "@tarojs/components"
import './index.scss'

import { IMG_HOST } from '@/config'
import api from '@/api/index'
import { LoadingBox, LogoWrap, ContentWrap } from '@/components/common'

export default function Index() {
  const [ pageLoading, setPageLoading ] = useState(true)
  const [ qa, setQa ] = useState<any>({})
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

  const [ list, setList ] = useState<any[]>([])

  useEffect(() => {
    sharerLevelPage()
    distributerMaterialQaGet()
  }, [])

  const sharerLevelPage = async () => {
    const res = await api.sharerLevelPage()
    setList(res.data.data.list)
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
          <Text>推广员等级</Text>
          <Text className="qcfont qc-icon-youbian" />
        </View>
        <View className="card rank box-shadow">
          {list.map((item: any) => {
            return (
              <View key={item.id} className="item">
                <View className="title-wrap">
                  <View className="icon-img">
                    {item.icon ? (
                      <Image src={IMG_HOST + item.icon} mode="aspectFill" />
                    ) : (
                      <View className={`qcfont qc-icon-ji${item.level}`} />
                    )}
                  </View>
                  <Text>{item.name}</Text>
                </View>
                <View className="desc">直接推广佣金比例{item.commissionRate}%</View>
                <View className="desc">{item.description}</View>
              </View>
            )
          })}
          <View className="item-alone">
            <View className="icon-img">
              <View className="qcfont qc-icon-zhuyi" />
              {/* <Image src={IMG_HOST + '/attachments/null/9a6aef40058d4dcba14b50ba1b06f178.jpg'} mode="aspectFill" /> */}
            </View>
            <View>部分商品的佣金比例因商家设置而有所不同，以商品列表显示为准</View>
          </View>
        </View>
      </View>
      <View className="rule-group relative">
        <View className="title">
          <Text className="qcfont qc-icon-zuobian" />
          <Text>常见问题</Text>
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