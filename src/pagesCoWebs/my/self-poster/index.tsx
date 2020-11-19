import Taro, { useState, useEffect } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './index.scss'
import util from '@/utils/util';
import api from '@/api/cowebs'
import { IMG_HOST } from '@/config';
import { LoadingBox, LogoWrap, ContentWrap } from '@/components/common';
import { uploadPoster } from '@/api/cards'

export default function Index() {
  const [pageLoading, setPageLoading] = useState(true)
  const [detail, setDetail] = useState<any>({})
  const [logourl, setLogourl] = useState<any[]>([]);
  const [count] = useState(1); // 上传图片数量
  const [limitSize] = useState(5); // 上传图片限制  5mb
  const [list, setList] = useState({});
  useEffect(() => {
    console.log(this.$router.params)
    setList(this.$router.params)
    let posterBgUrl = this.$router.params.posterBgUrl
    posterBgUrl = posterBgUrl.split('_')
    setLogourl(posterBgUrl)
  }, [])


  // 上传海报
  const chooseImage = async () => {
    const res = await Taro.chooseImage({
      count: 1 - logourl.length, // 默认1
      sizeType: ['compressed'] // 可以指定是原图还是压缩图，默认二者都有
    });
    handleWxChooseImage(res.tempFiles, count);
  };

  // 处理小程序端的选择图片上传
  const handleWxChooseImage = async (tempFiles: any[], count: number) => {
    if (!tempFiles.length) return;

    // if (tempFiles.length + logourl.length > count) {
    //   util.showToast(`最多上传${count}张图片`);
    //   return;
    // } else {
    util.showLoading(true, '上传图片中...');
    let promiseArray: any[] = [];
    for (let i = 0; i < tempFiles.length; i++) {
      const file = tempFiles[i];
      // 判断选择的图片大小
      const fileSize = file.size / 1024 / 1024;
      if (fileSize > limitSize) {
        util.showToast(`大于${limitSize}MB的图片将不会上传`);
      } else {
        const promise = api.uploadImg(file.path, { imageType: 'information' });
        promiseArray.push(promise);
      }
    }
    try {
      const result = await Promise.all(promiseArray);
      console.log('[result] :', result);
      setLogourl([])
      const _imageUrl = result.map(res => res.data.data.imageUrl);
      setLogourl(prev => {
        return [...prev, ..._imageUrl];
      });
      util.showLoading(false);
    } catch (err) {
      console.error('upload err :', err);
      // util.showLoading(false);
    }
    // }
  };
  // 上传海报
  const handleSubmit = (e: any) => {
    console.log(logourl)
    let params = {}
    params.id = list.id
    params.posterBgUrl = logourl[0]
    contactsUpdate(params);
  };
  const contactsUpdate = async (params: any) => {
    const res = await uploadPoster(params);
    Taro.showToast({
      title: res.data.message,
      icon: 'none'
    });
    // const resInfo = await api.contactsGet();
    // setMember(resInfo.data.data);
    // Taro.setStorageSync('memberInfo', resInfo.data.data);
    Taro.showToast({
      title: '保存成功',
      icon: 'none'
    });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  };

  return (
    <View className='page'>
      {/* <LoadingBox visible={pageLoading} /> */}
      <View className='all'>
        {logourl.map((item: string, index: number) => {
          return (
            <View className='items size' key={item}>
              <Image src={IMG_HOST + item}></Image>
            </View>
          );
        })}

        <View className='dialay'></View>
        <View className='allcontent'>
          <View className='uploadpic'>
            {/* {logourl.length < 1 && ( */}
            <Text onClick={chooseImage}>上传海报</Text>
            {/* )} */}
          </View>
          <View className='content'>
            <View className='name'>
              <Text>姓名</Text>
              <Input value={list.name}></Input>
            </View>
            <View className='name'>
              <Text>介绍</Text>
              <Input value={list.info}></Input>
            </View>
          </View>
          {/* <Text className='quanzi'>圈子</Text> */}
          <View className='btn' onClick={handleSubmit}>确认保存</View>
        </View>
      </View>
      {/* <LogoWrap /> */}
    </View>
  )
}

Index.config = {
  navigationBarTitleText: '个人海报'
}