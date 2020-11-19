import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image,
  Checkbox
} from "@tarojs/components";
import { IMG_HOST, HOME_PATH } from '@/config';
import "./index.scss";
import { cardSetting, updataSetting } from "@/api/cards"

export default class Index extends Component {

  state = {
    lists: [],
    array: []
  };
  componentDidMount() {
    this.getlist(this.$router.params.id)
  }

  getlist = async (id) => {
    const res = await cardSetting(id)
    this.setState({ lists: res.data.data })
  }

  switch1Change(e, name, id, index) {
    console.log(e, name, id)
    const lists = this.state.lists
    const value = e.detail.value
    lists[index].isShow = value
    let array = []
    lists.map(item => {
      let data = {}
      data.id = item.id
      data.name = item.name
      data.fieldName = item.fieldName
      data.isShow = item.isShow
      array.push(data)
    })
    this.setState({ array })
  }

  // 保存
  save = async () => {
    const nameCardSettings = { nameCardSettings: this.state.array }
    const res = await updataSetting(nameCardSettings)
    if (res.data.code == 20000) {
      Taro.showToast({
        title: '保存成功',
        icon: 'none'
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1000);
    }
  }




  gojump(id) {
    Taro.navigateTo({ url: '../cardList/index?id=' + id })
  }

  config: Config = {
    navigationBarTitleText: "名片设置"
  };
  render() {
    const { lists } = this.state
    return (
      <Block>
        {/* <View className='title'>对外信息显示</View> */}
        <View className='content'>
          <View className='con'>以下信息将对外部联系人显示</View>
          <View className='container'>
            {lists.map((item, index) => {
              return (
                <View className='name'>
                  <Text>{item.name}</Text>
                  <Switch checked={item.isShow} onChange={(e) => { this.switch1Change(e, item.fieldName, item.id, index) }} />
                </View>
              )
            })}
            {/* <View className='name'>
              <Text>企业简介</Text>
              <Text className='name-a'>企成互动信息科技有限公司</Text>
            </View>
            <View className='name'>
              <Text>名字显示</Text>
              <Text className='name-a'>张小姐</Text>
            </View>
            <View className='name'>
              <Text>手机</Text>
              <Switch bindchange="switch1Change" />
            </View>
            <View className='name'>
              <Text>邮箱</Text>
              <Switch bindchange="switch1Change" />
            </View>
            <View className='name'>
              <Text>地址</Text>
              <Switch bindchange="switch1Change" />
            </View>
            <View className='name'>
              <Text>职务</Text>
              <Switch bindchange="switch1Change" />
            </View> */}
          </View>
        </View>
        <View className='addnewcard' onClick={this.save}>保存</View>
      </Block>
    )
  }
}
