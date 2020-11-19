import { View, Text, Picker, Input, Button, Textarea, Block, Form, Switch } from '@tarojs/components';
import Taro, { useState, useEffect, useDidShow } from '@tarojs/taro';
import { Avatar, LogoWrap, LoadingBox, ThemeView } from '@/components/common';
import { IMG_HOST, HOME_PATH } from '@/config';
import util from '@/utils/util';
import { IconTagItem } from '@/components/cowebs';
import api from '@/api/cowebs';
import { getyellowInfo } from '@/api/cards'
import './index.scss';

export default function CardEdit() {
  const [pageLoading, setPageLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [member, setMember] = useState<any>({});
  const [imageUrl, setImageUrl] = useState<any[]>([]);
  const [logourl, setLogourl] = useState<any[]>([]);
  const [tradeList, setTradeList] = useState<any[]>([]);
  const [tradeIndex, setTradeIndex] = useState(0);
  let [templateRgbs] = useState([
    { color: '#8e92d9' },
    { color: '#b8dab3' },
    { color: '#eecf33' },
    { color: '#fff' },
    { color: '#000' },
    { color: '#bbbbbb' }
  ]);

  let [isTemplate, setIsTemplate] = useState(false);
  const [count] = useState(9); // 上传图片数量
  const [limitSize] = useState(5); // 上传图片限制  5mb
  let [tagDialogVisible, setTagDialogVisible] = useState(false);
  const [personalityLabel, setMyPersonalityLabel] = useState<any[]>();
  useDidShow(() => {
    console.log(this.$router.params)
    let member = {}
    member.id = this.$router.params.id
    setMember(member)
    const id = this.$router.params.id
    contactsGet(id)
  });
  // 获取详情
  const contactsGet = async (id) => {
    const res = await getyellowInfo(id);
    const member = res.data.data
    let logourl = member.pdfUrl
    logourl = logourl.split('_')
    setLogourl(logourl)
    let imageUrl = member.imgUrl
    imageUrl = imageUrl.split('_')
    setImageUrl(imageUrl)
    setMember(res.data.data);
    setPageLoading(false);
  };

  useEffect(() => {
    // myMenu()
    if (member && member.id && tradeList.length > 0) {
      const index = tradeList.findIndex(item => item === member.trade);
      setTradeIndex(index);
    }
  }, [member]);









  return (
    <View className='page'>
      <LoadingBox visible={pageLoading} />
      <Swiper
        className="swiper-container"
        circular
        indicatorDots
        indicatorColor='#999'
        indicatorActiveColor='#bf708f'
        autoplay>
        {imageUrl.map(item => {
          return (
            <SwiperItem className='container'>
              <Image className="swiper-img" mode="widthFix" src={IMG_HOST + item}></Image>
            </SwiperItem>
          )
        })}

      </Swiper>
      <View className='pagetext'>
        <Text>{member.contentStr}</Text>
      </View>
      <View className='pdfpic'>
        {logourl.map(item => {
          return (
            <Image className="swiper-img" mode="widthFix" src={IMG_HOST + item}></Image>
          )
        })}
      </View>
      <View style='height:150px;'></View>
      <View className='btn'><Text onClick={() => { Taro.navigateTo({ url: '../yellow-edit/index?id=' + member.id }) }}>编辑</Text></View>
      {/* <LogoWrap /> */}
    </View >
  )
}

CardEdit.config = {
  navigationBarTitleText: '企业黄页'
};
