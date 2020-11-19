import { View, Image, Text } from '@tarojs/components';
import Taro, { useState, useEffect, useDidShow } from '@tarojs/taro';
import { LoadingBox, LogoWrap, ThemeView } from '@/components/common';
import { IconTagItem, CustomerBox, CircleItem } from '@/components/cowebs';
import { IMG_HOST, HOME_PATH } from '@/config';
import { getCardDetail, getNum } from '@/api/cards'
import './index.scss';

import api from '@/api/cowebs';

export default function Card() {
  const [pageLoading, setPageLoading] = useState(true);
  const [member, setMember] = useState<any>({});
  const [personalityLabel, setMyPersonalityLabel] = useState<any[]>();
  // const [ list, setList ] = useState<any[]>([
  //   {
  //     id: '1',
  //     name: '80后',
  //     iconUrl: '/attachments/null/b2ab4baed665453c8ddfd318b3d9c36f.png',
  //     url: '',
  //   },
  //   {
  //     id: '13',
  //     name: '太极俱乐部多少',
  //     iconUrl: '/attachments/null/b2ab4baed665453c8ddfd318b3d9c36f.png',
  //     url: '',
  //   },
  //   {
  //     id: '1',
  //     name: '80后',
  //     iconUrl: '/attachments/null/b2ab4baed665453c8ddfd318b3d9c36f.png',
  //     url: '',
  //   },
  // ])
  const [groups] = useState([
    {
      id: 1,
      name: '名片海报',
      desc: '我的名人秀',
      icon: 'qc-icon-mingpian',
      color: 'rgb(57,112,223)',
      url: '../self-poster/index'
    },
    {
      id: 2,
      name: '企业黄页',
      desc: '介绍我的企业',
      icon: 'qc-icon-qiye',
      color: 'rgb(170,123,218)',
      url: '../yellow-page/index'
    },
    {
      id: 3,
      name: '活动',
      desc: '我的活动',
      icon: 'qc-icon-biaoqian1',
      color: 'rgb(119,203,37)',
    },
    {
      id: 4,
      name: '商城',
      desc: '我的商城',
      icon: 'qc-icon-shangcheng',
      color: 'rgb(255,180,0)',
    },
    {
      id: 5,
      name: '企业资讯',
      desc: '企业新闻动态',
      icon: 'qc-icon-xingzhuangcopy',
      color: 'rgb(91,205,201)',
    },
    {
      id: 6,
      name: '我的关注',
      desc: '我关注的名片',
      icon: 'qc-icon-shoucangactive',
      color: 'rgb(255,96,0)',
      url: '../myfocus/index'
    },
  ])

  useDidShow(() => {
    console.log(this.$router.params)
    const id = this.$router.params.id
    contactsGet(id);
    getpink(id)
    // getMyPersonalityTag()
  });

  const contactsGet = async (id) => {
    const res = await getCardDetail(id);
    setMember(res.data.data);
    setPageLoading(false);
  };
  // 获取浏览关注粉丝
  const getpink = async (id) => {
    const res = await getNum(id)
    setMyPersonalityLabel(res.data.data)
  }

  const getMyPersonalityTag = async () => {
    const res = await api.myPersonalityTag({ pageNum: 1, pageSize: 100 });
    setMyPersonalityLabel(res.data.data.list);
  };
  const goOthers = async (url) => {
    // if (member.posterBgUrl){
    Taro.navigateTo({
      url: url + '?id=' + member.id + '&name=' + member.name + '&info=' + member.info + '&posterBgUrl=' + member.posterBgUrl
    })
    // }else{
    //   Taro.navigateTo({
    //     url: url + '?id=' + member.id + '&name=' + member.name + '&info=' + member.info + '&posterBgUrl=' + member.posterBgUrl
    //   })
    // }
  }

  return (
    <ThemeView>
      <View className='card'>
        <LoadingBox visible={pageLoading} />
        <View className='bg-top'></View>

        <View className='card-wrap'>
          <View className='info-wrap'>
            <View className='head-image'>
              {member.logo ? (
                <Image src={IMG_HOST + member.logo} mode='widthFix' />
              ) : (
                  <Image src='https://athena-1255600302.cosgz.myqcloud.com/static/avatar.png'></Image>
                )}

            </View>
            <View className='info'>
              <View className='name'>
                <View className='name-text'>
                  <Text>{member.name}</Text>
                  {member.isBind && <Text className='qcfont qc-icon-renzheng' />}
                </View>
                <View className='edit' onClick={() => Taro.navigateTo({ url: '/pagesCoWebs/my/callCard-edit/index?id=' + member.id + '&name=' + member.name + '&phone=' + member.phone })}>
                  <Text>编辑</Text>
                  <Text className='qcfont qc-icon-chevron-right' />
                </View>
              </View>
              <View className='desc'>
                <View>{member.position}</View>
                <View>{member.company}</View>
              </View>
            </View>
          </View>

          {/* 个性标签 */}
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
          <View className='cells-list'>
            <View className='cells'>
              {member.phone && (
                <View className='cell'>
                  <Text className='qcfont qc-icon-shouji' />
                  <Text>{member.phone || '无'}</Text>
                </View>
              )}
              {member.email && (
                <View className='cell'>
                  <Text className='qcfont qc-icon-youxiang' />
                  <Text>{member.email || '无'}</Text>
                </View>
              )}
              {member.city && (
                <View className='cell'>
                  <Text className='qcfont qc-icon-didian3' />
                  <Text>{member.city || '无'}</Text>
                </View>
              )}
              {/* {member.className && (
              <View className='cell'>
                <Text className='qcfont qc-icon-banji1' />
                <Text>
                  {/-\/-/.test(member.className) ? member.className.replace('-/-', '-') : member.className || '无'}
                </Text>
              </View>
            )} */}
              {member.position && (
                <View className='cell'>
                  <Text className='qcfont qc-icon-hangye1' />
                  <Text>{member.position || '无'}</Text>
                </View>
              )}
            </View>
            <View className='setting' onClick={() => Taro.navigateTo({ url: '/pagesCoWebs/my/setting/index?id=' + member.id })}>
              <Text>设置</Text>
              <Text className='qcfont qc-icon-chevron-right' />
            </View>
          </View>


          <View className='intro'>{member.info}</View>

          {/* {member.iconTags && (
            <View className='icon-tags'>
              {member.iconTags.map((item: any) => {
                return <IconTagItem item={item} key={item.title} />;
              })}
            </View>
          )} */}
        </View>

        {/* <View className="circle-box">
        <View className="title">我的圈子</View>
        <View className="list">
          {list.map((item: any) => {
            return <CircleItem item={item} key={item.id} width={690/4} />
          })}
        </View>
      </View> */}

        <View className="data-items">
          <View className="item">
            <Text className="qcfont qc-icon-yanjing" />
            <Text>浏览·{personalityLabel.viewNum}</Text>
          </View>
          <View className="item">
            <Text className="qcfont qc-icon-xingxing3" />
            <Text>关注·{personalityLabel.followNum}</Text>
          </View>
          <View className="item">
            <Text className="qcfont qc-icon-icon-test1" />
            <Text>粉丝·{personalityLabel.fansNum}</Text>
          </View>
        </View>

        <View className="group-items">
          {groups.map((item: any) => {
            return (
              <View className="item" hoverClass="hover-item" key={item.id} onClick={() => { goOthers(item.url) }}>
                <View className={`qcfont ${item.icon}`} style={{ color: item.color }} />
                <View className="text-wrap">
                  <View>{item.name}</View>
                  <View className="desc">{item.desc}</View>
                </View>
              </View>
            )
          })}
        </View>

        <CustomerBox visible={!true} />

        <LogoWrap />
      </View>
    </ThemeView>
  );
}

Card.config = {
  navigationBarTitleText: '我的名片'
};
