import { View, Text, Picker, Input, Button, Textarea, Block, Form, Switch } from '@tarojs/components';
import Taro, { useState, useEffect, useDidShow } from '@tarojs/taro';
import { Avatar, LogoWrap, LoadingBox, ThemeView } from '@/components/common';
import util from '@/utils/util';
import { IconTagItem } from '@/components/cowebs';
import { IMG_HOST } from '@/config'
import api from '@/api/cowebs';
import './index.scss';

export default function CardEdit() {
  const [pageLoading, setPageLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [member, setMember] = useState<any>({});
  const [imageurl, setImageurl] = useState<any>('');
  const [tradeList, setTradeList] = useState<any[]>([]);
  const [personalList, setPersonalList] = useState<any[]>([]);
  const [tradeIndex, setTradeIndex] = useState(0);
  let [templateColors] = useState([
    { color: '#8e92d9' },
    { color: '#b8dab3' },
    { color: '#eecf33' },
    { color: '#fff' },
    { color: '#000' },
    { color: '#bbbbbb' }
  ]);

  let [isTemplate, setIsTemplate] = useState(false);
  let [tagDialogVisible, setTagDialogVisible] = useState(false);
  const [personalityLabel, setMyPersonalityLabel] = useState<any[]>();
  useDidShow(() => {
    personalProfile()
    getConfigTrade();
    getMyPersonalityTag()
  });

  useEffect(() => {
    if (member && member.id && tradeList.length > 0) {
      const index = tradeList.findIndex(item => item === member.trade);
      setTradeIndex(index);
    }
  }, [member]);

  // 获取显示资料
  const personalProfile = async () => {
    const res = await api.personalProfile()
    setPersonalList(res.data.data)
    setPageLoading(false);
    contactsGet()
  }

  // 获取个人信息
  const contactsGet = async () => {
    const res: any = await api.contactsGet();
    const data = res.data.data;
    setMember(data);
    setPageLoading(false);
  };
  // 标签
  const getMyPersonalityTag = async () => {
    const res = await api.myPersonalityTag({ pageNum: 1, pageSize: 100 });
    setMyPersonalityLabel(res.data.data.list);
  };

  // 行业
  const getConfigTrade = async () => {
    try {
      const res = await api.getConfigTrade();
      const data = res.data.data.value;
      setTradeList(data.split('_'));
      contactsGet();
    } catch (err) {
      contactsGet();
    }
  };

  const handleInput = (type: string, e: any) => {
    member[type] = e.detail.value
    // personalList.map(item => {
    //   if (type == item.fieldId) {
    //     item.showName == e.detail.value
    //     item.type = e.detail.value
    //   }
    // })
    // setPersonalList(personalList);
    setMember(member);
  };

  const addTags = (e: any) => {
    console.log(e);
    let tag = e.detail.value.tag;
    if (!tag) {
      Taro.showToast({
        title: '请输入标签',
        icon: 'none'
      });
    }
    member.iconTags.push({ title: tag, icon: 'qc-icon--user' });
    setMember(member);
  };
  // 删除标签
  const deleteTags = (index: number) => {
    member.iconTags.splice(index, 1);
    setMember(member);
  };

  // 保存
  const handleSubmit = (e: any) => {
    member.wxMiniFormId = e.detail.formId;
    member.headImage = imageurl ? imageurl : member.headImage
    setSubmitLoading(true);
    let a = 0, b = 0
    personalList.map(item => {
      if (item.required) {
        a++
        console.log(member[item.fieldId])
        if (member[item.fieldId]) {
          b++
        }
      }
    })
    if (a > b) {
      Taro.showToast({
        title: '带*号的为必填项,请填写完整',
        icon: 'none'
      })
      return
    }
    contactsUpdate(member);
  };

  const contactsUpdate = async (params: any) => {
    const res = await api.contactsUpdate(params);
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

  // 选择头像
  const chooseImage = async () => {
    const res = await Taro.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'] // 可以指定是原图还是压缩图，默认二者都有
    });
    handleWxChooseImage(res.tempFiles);
  };

  // 处理小程序端的选择图片上传
  const handleWxChooseImage = async (tempFiles: any[]) => {
    if (!tempFiles.length) return;

    // if (tempFiles.length + imageUrl.length > count) {
    //   util.showToast(`最多上传${count}张图片`);
    //   return;
    // } else {
    util.showLoading(true, '上传图片中...');
    let promiseArray: any[] = [];
    for (let i = 0; i < tempFiles.length; i++) {
      const file = tempFiles[i];
      // 判断选择的图片大小
      const fileSize = file.size / 1024 / 1024;
      if (fileSize > 5) {
        util.showToast(`大于5MB的图片将不会上传`);
      } else {
        console.log(file.path)
        const promise = api.uploadImg(file.path, { imageType: 'information' });
        promiseArray.push(promise);
      }
    }
    try {
      const result = await Promise.all(promiseArray);
      console.log('[result] :', result);
      const _imageUrl = result.map(res => res.data.data.imageUrl);
      console.log(IMG_HOST + _imageUrl[0])
      setImageurl(IMG_HOST + _imageUrl[0])
      // setImageUrl(prev => {
      //   return [...prev, ..._imageUrl];
      // });
      util.showLoading(false);
    } catch (err) {
      console.error('upload err :', err);
      // util.showLoading(false);
    }
    // }
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
          {member.headImage ? (
            // <Avatar imgUrl={member.headImage} width={100} style={{ border: '1px solid rgb(243, 243, 243)' }} />
            <View className="head-wrap" onClick={chooseImage}>
              {imageurl ? (
                <Image src={imageurl} mode="aspectFill" />
              ) : (
                  <Image src={member.headImage} mode="aspectFill" />
                )}

            </View>
          ) : (
              <View className="head-wrap" onClick={chooseImage}>
                {imageurl ? (
                  <Image src={imageurl} mode="aspectFill" />
                ) : (
                    <View className='qcfont qc-icon--user default-head'></View>
                  )}
              </View>

              // <Avatar imgUrl={IMG_HOST + '/attachments/null/3e9ded5db9e142558ecca607f8a8908b.png'} width={100} style={{ border: '1px solid rgb(243, 243, 243)' }} />
            )}



          <View className='info'>
            <View className='title-wrap'>
              <View className='name'>{member.name || '姓名'}</View>
              {/* <Button className="change" onClick={() => setIsTemplate(true)}>
              <Text>更换模板</Text>
              <Text className="qcfont qc-icon-chevron-right" />
            </Button> */}
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
              <View className='tag-edit' onClick={() => Taro.navigateTo({ url: '/pagesCoWebs/my/tag-edit/index' })}>
                <Text className='at-icon at-icon-edit'></Text>
                <Text>添加</Text>
              </View>
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
              {templateColors.map((item: any) => {
                return (
                  <View
                    className='item'
                    key={item.color}
                    style={{ background: item.color }}
                    onClick={() => {
                      member.templateColor = item.color;
                      setMember(member);
                    }}>
                    {member.templateColor === item.color && <Text className='qcfont qc-icon--user check' />}
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
            <Block>
              <View className='input-wrap'>
                {personalList.length > 0 && (
                  personalList.map((item, index) => {
                    return (
                      <Block>
                        {/* {(item.fieldName != "学位" && item.fieldName != "学号") && ( */}
                        <View className='item'>
                          <View className='title'>
                            <Text>{item.fieldName}</Text>
                            {item.required && (
                              <Text className='red'>*</Text>
                            )}
                          </View>
                          <Input
                            placeholder={'请输入' + item.fieldName}
                            value={member[item.fieldId]}
                            onInput={e => handleInput(item.fieldId, e)}
                          // disabled
                          // className='disabled'
                          />
                        </View>
                        {/* )} */}
                      </Block>
                    )
                  })
                )}

                {/* <View className='item'>
                  <View className='title'>
                    <Text>公司</Text>
                    <Text className='red'>*</Text>
                  </View>
                  <Input placeholder='请输入公司' value={member.company} onInput={e => handleInput('company', e)} />
                </View>
                <View className='item'>
                  <View className='title'>
                    <Text>职务</Text>
                    <Text className='red'>*</Text>
                  </View>
                  <Input placeholder='请输入职务' value={member.position} onInput={e => handleInput('position', e)} />
                </View>
                <View className='item'>
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
                <View className='item'>
                  <View className='title'>
                    <Text>邮箱</Text>
                  </View>
                  <Input placeholder='请输入邮箱' value={member.mailbox} onInput={e => handleInput('mailbox', e)} />
                </View>
                <View className='item'>
                  <View className='title'>
                    <Text>城市</Text>
                  </View>
                  <Input placeholder='请输入城市' value={member.city} onInput={e => handleInput('city', e)} />
                </View>
                <View className='item'>
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
                </View>
                <View className='item'>
                  <View className='title'>
                    <Text>行业</Text>
                  </View>
                  <Picker
                    mode='selector'
                    range={tradeList}
                    value={tradeIndex}
                    onChange={handlePickerChange}
                    className='picker'>
                    {member.trade ? (
                      <View className='text'>
                        <Text style='color: #4d4d4d;'>{member.trade}</Text>
                        <Text className='qcfont qc-icon-chevron-down' />
                      </View>
                    ) : (
                        <View className='text'>
                          <Text>请选择行业</Text>
                          <Text className='qcfont qc-icon-chevron-down' />
                        </View>
                      )}
                  </Picker>
                </View>
                <View className='item'>
                  <View>是否公开通讯录</View>
                  <Switch checked={member.isPublic} onChange={switchChange} />
                </View> */}

                {/* <View className="item">
              <View className="title">
                <Text>介绍</Text>
              </View>
              <Textarea placeholder="请输入介绍" value={member.intro} onInput={(e) => handleInput('intro', e)} />
            </View>
            <View className="item item-tag">
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

        {tagDialogVisible && (
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
        )}

        <LogoWrap styles={{ zIndex: 3 }} />
      </View>
    </ThemeView>
  );
}

CardEdit.config = {
  navigationBarTitleText: '名片编辑'
};
