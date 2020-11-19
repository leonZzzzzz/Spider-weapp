import { View, Text, Picker, Input, Button, Textarea, Block, Form, Switch } from '@tarojs/components';
import Taro, { useState, useEffect, useDidShow } from '@tarojs/taro';
import { Avatar, LogoWrap, LoadingBox, ThemeView } from '@/components/common';
import { IMG_HOST, HOME_PATH } from '@/config';
import util from '@/utils/util';
import { IconTagItem } from '@/components/cowebs';
import api from '@/api/cowebs';
import { getCardDetail, addcard } from '@/api/cards'
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
    // let member = {}
    member.name = this.$router.params.name
    member.phone = this.$router.params.phone
    setMember(member)
    const id = this.$router.params.id
    id ? contactsGet(id) : ''
  });
  // 获取详情
  const contactsGet = async (id) => {
    const res = await getCardDetail(id);
    const member = res.data.data
    let logourl = []
    logourl.push(member.logo)
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
  // const myMenu = async () => {
  //   const res = await addcard();
  //   setMenu(res.data.data);
  // };


  // const getMyPersonalityTag = async () => {
  //   const res = await api.myPersonalityTag({ pageNum: 1, pageSize: 100 });
  //   setMyPersonalityLabel(res.data.data.list);
  // };

  // 行业
  // const getConfigTrade = async () => {
  //   try {
  //     const res = await api.getConfigTrade();
  //     const data = res.data.data.value;
  //     setTradeList(data.split('_'));
  //     getMemberInfo();
  //   } catch (err) {
  //     getMemberInfo();
  //   }
  // };
  // 上传头像
  const chooseImage1 = async () => {
    const res = await Taro.chooseImage({
      count: 1 - logourl.length, // 默认9
      sizeType: ['compressed'] // 可以指定是原图还是压缩图，默认二者都有
    });
    handleWxChooseImage1(res.tempFiles, count);
  };

  // 处理小程序端的选择图片上传
  const handleWxChooseImage1 = async (tempFiles: any[], count: number) => {
    if (!tempFiles.length) return;

    if (tempFiles.length + logourl.length > count) {
      util.showToast(`最多上传${count}张图片`);
      return;
    } else {
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
        const _imageUrl = result.map(res => res.data.data.imageUrl);
        setLogourl(prev => {
          return [...prev, ..._imageUrl];
        });
        util.showLoading(false);
      } catch (err) {
        console.error('upload err :', err);
        // util.showLoading(false);
      }
    }
  };

  // 选择图片
  const chooseImage = async () => {
    const res = await Taro.chooseImage({
      count: 9 - imageUrl.length, // 默认9
      sizeType: ['compressed'] // 可以指定是原图还是压缩图，默认二者都有
    });
    handleWxChooseImage(res.tempFiles, count);
  };

  // 处理小程序端的选择图片上传
  const handleWxChooseImage = async (tempFiles: any[], count: number) => {
    if (!tempFiles.length) return;

    if (tempFiles.length + imageUrl.length > count) {
      util.showToast(`最多上传${count}张图片`);
      return;
    } else {
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
        const _imageUrl = result.map(res => res.data.data.imageUrl);
        setImageUrl(prev => {
          return [...prev, ..._imageUrl];
        });
        util.showLoading(false);
      } catch (err) {
        console.error('upload err :', err);
        // util.showLoading(false);
      }
    }
  };

  const handleInput = (type: string, e: any) => {
    member[type] = e.detail.value;
    setMember(member);
  };

  // const addTags = (e: any) => {
  //   console.log(e);
  //   let tag = e.detail.value.tag;
  //   if (!tag) {
  //     Taro.showToast({
  //       title: '请输入标签',
  //       icon: 'none'
  //     });
  //   }
  //   member.iconTags.push({ title: tag, icon: 'qc-icon--user' });
  //   setMember(member);
  // };

  // const deleteTags = (index: number) => {
  //   member.iconTags.splice(index, 1);
  //   setMember(member);
  // };
  // 保存名片
  const handleSubmit = (e: any) => {
    console.log(imageUrl)
    let imgUrl = ''
    imageUrl.map(img => {
      imgUrl += img + "_"
    })
    imgUrl = imgUrl.slice(0, -1)

    let params = {}
    params.id = member.id
    params.templateRgb = member.templateRgb ? member.templateRgb : ''
    params.imgUrl = imgUrl
    params.position = member.position
    params.company = member.company
    params.email = member.email
    params.city = member.city
    params.logo = logourl[0]
    params.info = member.info
    setSubmitLoading(true);
    contactsUpdate(params);
  };
  const contactsUpdate = async (params: any) => {
    const res = await addcard(params);
    Taro.showToast({
      title: res.data.message,
      icon: 'none'
    });
    setSubmitLoading(false);
    const resInfo = await api.contactsGet();
    setMember(resInfo.data.data);
    Taro.setStorageSync('memberInfo', resInfo.data.data);
    Taro.showToast({
      title: '保存成功',
      icon: 'none'
    });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  };

  const handlePickerChange = (e: any) => {
    const index = Number(e.detail.value);
    setTradeIndex(index);
    member.trade = tradeList[index];
    setMember(member);
  };
  const switchChange = (e: any) => {
    member.isPublic = e.detail.value;
    setMember(member);
  };




  return (
    <ThemeView>
      <View className='card-edit'>
        <LoadingBox visible={pageLoading} />
        <View className='bg-top'></View>

        <View className='template-card'>
          <View className='pics'>
            {logourl.map((item: string, index: number) => {
              return (
                <View className='items size' key={item}>
                  <Image src={IMG_HOST + item} mode='aspectFill' style='border-radius:50%' />
                  <Text style='font-size:26rpx !important;'
                    className='qcfont qc-icon-guanbi close'
                    onClick={() => {
                      setLogourl(prev => {
                        prev.splice(index, 1);
                        return [...prev];
                      });
                    }}
                  />
                </View>
              );
            })}
            {logourl.length < 1 && (
              <View className='add radius' onClick={chooseImage1}>
                <Text className='qcfont qc-icon-jia' />
                <View style='font-size:22rpx;'>上传头像</View>
              </View>
            )}
          </View>

          {/* <Avatar imgUrl={member.headImage} width={150} style={{ border: '1px solid rgb(243, 243, 243)' }} /> */}
          <View className='info'>
            <View className='title-wrap'>
              <View className='name'>{member.name || '姓名'}</View>
              <Button className="change" onClick={() => setIsTemplate(true)}>
                <Text>更换模板</Text>
                <Text className="qcfont qc-icon-chevron-right" />
              </Button>
            </View>
            <View className='desc'>
              <View>{member.position || '职务'}</View>
              <View>{member.company || '公司全称'}</View>
            </View>

            <View className='tags'>
              {member.labels.map((tag: any) => {
                return (
                  <Text key={tag.id} className='tag'>
                    {tag.name}
                  </Text>
                );
              })}
              {/* <View className='tag-edit' onClick={() => Taro.navigateTo({ url: '/pagesCoWebs/my/tag-edit/index' })}>
                <Text className='at-icon at-icon-edit'></Text>
                <Text>添加</Text>
              </View> */}
            </View>
          </View>
        </View>

        {isTemplate ? (
          <View className='template-wrap'>
            <View className='title'>
              <View>请选择一张模板</View>
              <Button size='mini' onClick={() => setIsTemplate(false)}>
                确定
              </Button>
            </View>
            <View className='group'>
              {templateRgbs.map((item: any) => {
                return (
                  <View
                    className='item'
                    key={item.color}
                    style={{ background: item.color }}
                    onClick={() => {
                      member.templateRgb = item.color;
                      setMember(member);
                    }}>
                    {member.templateRgb === item.color && <Text className='qcfont qc-icon--user check' />}
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
            <Block>
              <View className='input-wrap'>
                <View className='newitem'>
                  <View className='title'>
                    <Text>姓名</Text>
                    <Text className='red'>*</Text>
                  </View>
                  <Input
                    placeholder='请输入姓名'
                    value={member.name}
                    onInput={e => handleInput('name', e)}
                    disabled
                    className='disabled'
                  />
                </View>
                <View className='newitem'>
                  <View className='title'>
                    <Text>公司</Text>
                    <Text className='red'>*</Text>
                  </View>
                  <Input placeholder='请输入公司' value={member.company} onInput={e => handleInput('company', e)} />
                </View>
                <View className='newitem'>
                  <View className='title'>
                    <Text>职务</Text>
                    <Text className='red'>*</Text>
                  </View>
                  <Input placeholder='请输入职务' value={member.position} onInput={e => handleInput('position', e)} />
                </View>
                <View className='newitem'>
                  <View className='title'>
                    <Text>手机</Text>
                    <Text className='red'>*</Text>
                  </View>
                  <Input
                    placeholder='请输入手机'
                    value={member.phone}
                    type='number'
                    onInput={e => handleInput('phone', e)}
                    disabled
                    className='disabled'
                  />
                </View>
                <View className='newitem'>
                  <View className='title'>
                    <Text>邮箱</Text>
                    <Text className='red'></Text>
                  </View>
                  <Input placeholder='请输入邮箱' value={member.email} onInput={e => handleInput('email', e)} />
                </View>
                <View className='newitem'>
                  <View className='title'>
                    <Text>城市</Text>
                    <Text className='red'></Text>
                  </View>
                  <Input placeholder='请输入城市' value={member.city} onInput={e => handleInput('city', e)} />
                </View>
                {/* <View className='item'>
                  <View className='title'>
                    <Text>班级</Text>
                  </View>
                  <Input
                    placeholder='请输入班级'
                    value={member.className}
                    onInput={e => handleInput('className', e)}
                  disabled
                  className='disabled'
                  />
                </View> */}

                <View className="intro textare">
                  <View className="title">
                    <Text>介绍</Text>
                  </View>
                  <Textarea className='area' placeholder="请输入介绍" value={member.info} onInput={(e) => handleInput('info', e)} />
                </View>

                <View className="intro">
                  <View className="title">
                    <Text>上传图片</Text>
                  </View>
                  <View className='pics'>
                    {imageUrl.map((item: string, index: number) => {
                      return (
                        <View className='items' key={item}>
                          <Image src={IMG_HOST + item} mode='aspectFill' />
                          <Text
                            className='qcfont qc-icon-guanbi close'
                            onClick={() => {
                              setImageUrl(prev => {
                                prev.splice(index, 1);
                                return [...prev];
                              });
                            }}
                          />
                        </View>
                      );
                    })}
                    {imageUrl.length < 9 && (
                      <View className='add' onClick={chooseImage}>
                        <Text className='qcfont qc-icon-jia' />
                        <View>添加图片</View>
                      </View>
                    )}
                  </View>
                </View>

                {/* <View className="item item-tag">
                  <View className="title">
                    <Text>标签</Text>
                  </View>
                  <View className="icon-tags">
                    {member.iconTags && member.iconTags.map((item: any, index: number) => {
                      return (
                        <IconTagItem key={item.title} item={item} index={index} onDelete={deleteTags} type="delete" />
                      )
                    })}
                    <View className="qcfont qc-icon-jia add" onClick={() => setTagDialogVisible(true)} />
                  </View>
                </View> */}
              </View>
            </Block>
          )}
        <View style={{ height: Taro.pxTransform(120) }} />

        {!isTemplate && (
          <View className='save-btn'>
            <Form onSubmit={handleSubmit} reportSubmit>
              <Button formType='submit' loading={submitLoading} hoverClass='hover-button'>
                确认保存
              </Button>
            </Form>
          </View>
        )}

        {/* {tagDialogVisible && (
          <View className='tags-add-dialog'>
            <Form reportSubmit={true} onSubmit={addTags}>
              <View className='tags-add-box'>
                <View className='title'>添加标签</View>
                <View className='input-box'>
                  <Input name='tag' />
                </View>
                <View className='btn-box'>
                  <Button onClick={() => setTagDialogVisible(false)}>取消</Button>
                  <Button className='primary' formType='submit'>
                    添加
                  </Button>
                </View>
              </View>
            </Form>
          </View>
        )} */}

        <LogoWrap styles={{ zIndex: 3 }} />
      </View>
    </ThemeView>
  );
}

CardEdit.config = {
  navigationBarTitleText: '名片编辑'
};
