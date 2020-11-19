import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image
} from "@tarojs/components";
import { IMG_HOST, HOME_PATH } from '@/config';
import { QcEmptyPage, LoadingBox, SearchWrap, FixedBox, LogoWrap, ThemeView } from '@/components/common';
import "./index.scss";
import { getcardpage, pinkName, unpinkName } from "@/api/cards"

export default class Index extends Component {

  state = {
    lists: []
  };
  componentDidMount() {
    this.getlist(this.$router.params.memberId)
  }

  getlist = async (id) => {
    const res = await getcardpage(id)
    const lists = res.data.data.list
    // lists.map(item => {
    //   item.follow = false
    // })
    this.setState({ lists })

  }

  pinkName = async (id) => {
    const params = { type: 'FOLLOW', nameCardId: id }
    const res = await pinkName(params)
    if (res.data.code == 20000) {
      Taro.showToast({
        title: '关注成功',
        icon: 'none'
      })
      this.getlist(this.$router.params.memberId)
    }
  }
  // 取消关注
  unpinkName = async (id) => {
    const params = { type: 'FOLLOW', nameCardId: id }
    const res = await unpinkName(params)
    if (res.data.code == 20000) {
      Taro.showToast({
        title: '已取消关注',
        icon: 'none'
      })
      this.getlist(this.$router.params.memberId)
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
          {lists.length > 0 ? (
            lists.map(val => {
              return (
                <View className='cardlist' style='background:#fff'>
                  {/* {val.logo ? (
                  <Image className='cardlist-img' src={IMG_HOST + val.logo} onClick={() => { this.gojump(val.id) }}></Image>
                ) : ( */}
                  <Image className='cardlist-img' src='https://athena-1255600302.cosgz.myqcloud.com/static/avatar.png' onClick={() => { this.gojump(val.id) }}></Image>
                  {/* )} */}

                  <View className='cardlist-info' onClick={() => { this.gojump(val.id) }}>
                    <View className='cardlist-info-name'>{val.name}<Text className='qcfont qc-icon-renzheng' style='margin-left:10px;color:yellow' /></View>
                    {/* <View className='cardlist-info-duty'>{val.position}</View>
                  <View className='cardlist-info-duty'>{val.company}</View> */}
                    <View className='cardlist-info-firm'>
                      {val.labels.map(lab => {
                        return (
                          <Text>{lab.name}</Text>
                        )
                      })}

                    </View>
                  </View>
                  {/* <Text className='qcfont qc-icon-renzheng tag' /> */}
                  {val.isFollow ? (
                    <Text className='qcfont qc-icon-shoucangactive red' onClick={() => { this.unpinkName(val.id) }} />
                  ) : (
                      <Text className='qcfont qc-icon-xingxing3 tag' onClick={() => { this.pinkName(val.id) }} />
                    )}

                </View>
              )
            })
          ) : (
              <QcEmptyPage icon='none'></QcEmptyPage>
            )}


        </View>

      </Block>
    )
  }
}
