import { View, Text, Button } from '@tarojs/components';
import Taro, { useState, useEffect, useRouter, useShareAppMessage } from '@tarojs/taro';
import { LoadingBox, Avatar, LogoWrap, ThemeView } from '@/components/common';
import { IconTagItem } from '@/components/cowebs';
import { IMG_HOST } from '@/config'
import api from '@/api/cowebs';
import './index.scss';

export default function Detail() {
  const [pageLoading, setPageLoading] = useState(true);
  const [member, setMember] = useState<any>({});
  const { id, memberId } = useRouter().params;
  useEffect(() => {
    console.log(this.$router.params)
    contactsGet();
    Taro.hideShareMenu();
  }, []);

  useShareAppMessage(() => {
    const params = {
      title: member.name
    };
    return params;
  });


  // 获取个人资料
  const contactsGet = async () => {
    try {
      const res: any = await api.contactsGet({ id: id || '', memberId: memberId || '' });
      setMember(res.data.data);
      setPageLoading(false);
    } catch (error) {
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    }
  };

  // 保存到通讯录
  const addPhoneContact = async () => {
    await Taro.addPhoneContact({
      photoFilePath: member.headImage || '',
      firstName: `${member.name}-${member.className}` || '',
      nickName: `${member.name}-${member.className}` || '',
      // remark: member.trade || '',
      mobilePhoneNumber: member.phone || '',
      weChatNumber: member.wechat || '',
      addressCity: member.city || '',
      organization: member.company,
      title: member.position || '',
      email: member.mailbox || ''
    });
    Taro.showToast({
      title: '成功保存到通讯录',
      icon: 'none'
    });
  };

  return (
    <ThemeView>
      <View className='card'>
        <LoadingBox visible={pageLoading} />

        <View className='relative'>
          <View className='bg-top'></View>

          <View className='card-wrap box-shadow'>
            <View className='info-wrap'>
              <View className='head-image'>
                {member.headImage ? (
                  <Avatar imgUrl={member.headImage} width={150} />
                ) : (
                    <View className='qcfont qc-icon--user default-head'></View>
                    // <Avatar imgUrl={IMG_HOST + '/attachments/null/3e9ded5db9e142558ecca607f8a8908b.png'} width={150} style={{ border: '1px solid rgb(243, 243, 243)' }} />
                  )}
              </View>
              <View className='info'>
                <View className='name'>
                  <View className='name-text'>
                    <Text>{member.name}</Text>
                    {member.isBind && <Text className='qcfont qc-icon-renzheng renzheng' />}
                  </View>
                </View>
                <View className='desc'>
                  <View>{member.position}</View>
                  <View>{member.company}</View>
                </View>
              </View>
              <View className='pink'>
                {/* <Text onClick={() => { Taro.navigateTo({ url: '../card-list/index?memberId=' + memberId }) }}>去关注></Text> */}
              </View>
            </View>

            {/* 个性标签 */}
            {member.labels &&
              <View className="tags">
                {member.labels.map((tag: any) => {
                  return <Text key={tag.id} className='tag'>{tag.name}</Text>
                })}
              </View>
            }

            <View className='intro'>{member.intro}</View>

            {member.iconTags && member.iconTags.length && (
              <View className='icon-tags'>
                {member.iconTags &&
                  member.iconTags.map((item: any) => {
                    return <IconTagItem item={item} key={item.title} />;
                  })}
              </View>
            )}
          </View>

          {/* <View className='group-wrap box-shadow'>
          <View className='title'>
            <Text>TA的需求</Text>
          </View>
          <View className='content'>
            萨佛是发送到飞机萨佛是发送到飞机搜房收费睡觉哦i飞机送i接送机官方哦结果搜房收费睡觉哦i飞机送i接送机官方哦结果
          </View>
        </View>
        <View className='group-wrap box-shadow'>
          <View className='title'>TA的资源</View>
          <View className='content'>
            萨佛是发送到飞机萨佛是发送到飞机搜房收费睡觉哦i飞机送i接送机官方哦结果搜房收费睡觉哦i飞机送i接送机官方哦结果
          </View>
        </View> */}

          <View className='btn-wrap'>
            <Button className='border' openType='share' hoverClass='hover-button'>
              <Text className='qc-icon-fenxiang qcfont' />
              <Text>分享名片</Text>
            </Button>
            <Button className='primary' onClick={addPhoneContact} hoverClass='hover-button'>
              <Text className='qc-icon-baocun qcfont' />
              <Text>保存至通讯录</Text>
            </Button>
          </View>
          {/* <View className="visit-wrap">
        <View className="num-box">
          <View className="head">
            <Avatar imgUrl={member.headImage} width={50} style={{border: '1px solid rgb(187, 187, 187)', marginRight: Taro.pxTransform(10)}} />
            <Avatar imgUrl={member.headImage} width={50} style={{border: '1px solid rgb(187, 187, 187)', marginRight: Taro.pxTransform(10)}} />
            <View className="qcfont qc-icon-gengduo" />
          </View>
          <View className="num">2342浏览</View>
        </View>
        <View className="like-box">
          <View className="qcfont qc-icon-like" />
          <View className="num">234</View>
        </View>
      </View>
      <View className="company-wrap">
        <View className="title">公司介绍</View>
        <Image src={member.headImage} />
      </View> */}
        </View>
        <LogoWrap />
      </View>
    </ThemeView >
  );
}

Detail.config = {
  navigationBarTitleText: '校友详情'
};
