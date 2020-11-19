import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image
} from "@tarojs/components";
import { IMG_HOST, HOME_PATH } from '@/config';
import "./index.scss";
import { getCardList, deleteCard } from "@/api/cards"

export default class Index extends Component {

  state = {
    lists: []
  };
  componentDidShow() {
    this.getlist()
  }

  getlist = async () => {
    const res = await getCardList()
    this.setState({ lists: res.data.data })

  }
  // 删除名片
  deleteCard(id) {
    Taro.showModal({
      content: '确定要删除此名片吗？',
      success: (res => {
        if (res.confirm) {
          this.getdelete(id)
        }
      })
    })
  }
  getdelete = async (id) => {
    const res = await deleteCard(id)
    if (res.data.code == 20000) {
      Taro.showToast({
        title: '删除成功',
        icon: 'none'
      })
      this.getlist()
    }
  }




  gojump(id) {
    Taro.navigateTo({ url: '../cardList/index?id=' + id })
  }

  config: Config = {
    navigationBarTitleText: "名片列表"
  };
  render() {
    const { lists } = this.state
    return (
      <Block>
        <View className='cards'>
          {lists.map(val => {
            return (
              <View className='cardlist' style={{ 'background': val.templateRgb }} >
                {val.logo ? (
                  <Image className='cardlist-img' src={IMG_HOST + val.logo} onClick={() => { this.gojump(val.id) }}></Image>
                ) : (
                    <Image className='cardlist-img' src='https://athena-1255600302.cosgz.myqcloud.com/static/avatar.png' onClick={() => { this.gojump(val.id) }}></Image>
                  )}

                <View className='cardlist-info' onClick={() => { this.gojump(val.id) }}>
                  <View className='cardlist-info-name'>{val.name}<Text className='qcfont qc-icon-renzheng' style='margin-left:10px;color:yellow' /></View>
                  <View className='cardlist-info-duty'>{val.position}</View>
                  <View className='cardlist-info-duty'>{val.company}</View>
                  <View className='cardlist-info-firm'>
                    {val.labels.map(lab => {
                      return (
                        <Text>{lab.name}</Text>
                      )
                    })}

                  </View>
                </View>
                {/* <Text className='qcfont qc-icon-renzheng tag' /> */}
                <Text className='qcfont qc-icon-guanbi close tag' onClick={() => { this.deleteCard(val.id) }} />
              </View>
            )
          })}

        </View>
        <View className='addnewcard' onClick={() => Taro.navigateTo({ url: '/pagesCoWebs/my/callCard-edit/index?name=' + lists[0].name + '&phone=' + lists[0].phone })}>添加新名片</View>
      </Block>
    )
  }
}
