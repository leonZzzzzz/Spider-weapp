import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image
} from "@tarojs/components";
import { IMG_HOST, HOME_PATH } from '@/config';
import "./index.scss";
import { myPick, unpinkName } from "@/api/cards"

export default class Index extends Component {

  state = {
    lists: [],
    type: 'FOLLOW'
  };
  componentDidMount() {
    this.getlist()
  }

  getlist = async () => {
    const res = await myPick(this.state.type)
    this.setState({ lists: res.data.data })

  }
  unpinkName(id) {
    Taro.showModal({
      content: '确定取消关注吗？',
      success: (res) => {
        if (res.confirm) {
          this.unpink(id)
        }
      }
    })
  }

  unpink = async (id) => {
    const params = { type: 'FOLLOW', nameCardId: id }
    const res = await unpinkName(params)
    if (res.data.code == 20000) {
      this.getlist()
    }
  }



  config: Config = {
    navigationBarTitleText: "关注列表"
  };
  render() {
    const { lists } = this.state
    return (
      <Block>
        <View className='cards'>
          {lists.map(val => {
            return (
              <View className='cardlist' style='background:#fff' >
                {val.logo ? (
                  <Image className='cardlist-img' src={IMG_HOST + val.logo} ></Image>
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
                <Text className='qcfont qc-icon-shoucangactive tag' onClick={() => { this.unpinkName(val.id) }} />
              </View>
            )
          })}

        </View>
      </Block>
    )
  }
}
