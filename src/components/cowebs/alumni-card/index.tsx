import Taro, { useState } from '@tarojs/taro';
import { View, Text, Button, Image, ScrollView } from '@tarojs/components';
import './index.scss';
import { getprivatefolder } from '@/api/common'

// import Avatar from '@/components/common/avatar'
import { Avatar } from '@/components/common';
import { IMG_HOST } from '@/config';

export default function AlumniCard(props: any) {
  const { item, index, showLike, type, onTip, onAuthorize } = props;

  const jumpPage = async () => {
    const { memberId, memberStatus } = Taro.getStorageSync('authorize');
    const privateStatus = Taro.getStorageSync('privateStatus');
    if (!memberId) {
      onAuthorize && onAuthorize();
      return;
    }
    const res = await getprivatefolder()
    // Taro.setStorageSync('privateStatus', res.data.data.contactStatus)
    if (res.data.data.contactStatus != 2) {
      Taro.showToast({ title: '您不是认证会员，暂无查看权限', icon: 'none' });
      return;
    }
    if (!item.isBind) {
      onTip && onTip();
      return;
    }
    const contactsInfo = Taro.getStorageSync('contactsInfo');
    if (contactsInfo && !contactsInfo.isPublic) {
      Taro.showToast({
        title: '请先完善我的资料',
        icon: 'none'
      });
      return;
    }
    if (!item.isPublic) {
      Taro.showToast({
        title: '用户未公开资料，无法查看',
        icon: 'none'
      });
      return;
    }
    Taro.navigateTo({
      url: `/pagesCoWebs/contacts/detail/index?id=${item.id}`
    });
  };

  return type === 'scrollX' ? (
    <View className={`alumni-card-scrollX ${index === 0 ? 'first' : ''}`} onClick={jumpPage}>
      <View className='alumni-card-box'>
        <View className='head-image'>
          {item.headImage ? (
            <Avatar imgUrl={item.headImage} width={120} />
          ) : (
              <View className='qcfont qc-icon--user default-head' />
            )}
        </View>
        {!item.isPublic && <View className='qcfont qc-icon-jiami jiami' />}
        <View className='info-wrap box-shadow'>
          <View className='name'>
            <View className='name-text'>{item.name}</View>
            {item.isBind && <Text className='qcfont qc-icon-renzheng' />}
          </View>
          <View className='desc'>
            <View className='position'>
              {/-\/-/.test(item.className) ? item.className.replace('-/-', '-') : item.className}
            </View>
            {item.position && <View className='position'>{item.position}</View>}
            {item.company && <View className='company'>{item.company}</View>}
          </View>
          {/* 个性标签 */}
          {item.labels && item.labels.length > 0 && (
            <View className='tags'>
              {item.labels.map((tag: any) => {
                return (
                  <Text key={tag.id} className='tag'>
                    {tag.name}
                  </Text>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </View>
  ) : type === 'more-type' ? (
    <View className='alumni-card-more' onClick={jumpPage}>
      <View className='top-user-wrap'>
        <View className='head-image'>
          {/* <Image src={item.headImage} /> */}
          {item.headImage ? (
            <Avatar imgUrl={item.headImage} width={100} />
          ) : (
              <View className='qcfont qc-icon--user default-head' />
            )}
          {!item.isPublic && <View className='qcfont qc-icon-jiami jiami' />}
          {!item.isBind && (
            <Button className='yaoqing' openType='share' onClick={e => e.stopPropagation()} hoverClass='hover-button'>
              邀请加入
            </Button>
          )}
        </View>
        <View className='info-wrap'>
          <View className='name'>
            <View className='name-text'>
              <Text className='i-name'>{item.name}</Text>
              {item.isBind && <Text className='qcfont qc-icon-renzheng' />}
              <View className='title-rank'>
                <View className='icon'>
                  {/* <Text className='qcfont qc-icon-qiyeyonghu rank-icon' /> */}
                  <Image src={IMG_HOST + '/attachments/null/eb4fd2f60d994133b1dc2b9a1eccd5bb.png'} mode='aspectFill' />
                </View>
                <Text className='rank-name'>金卡会员</Text>
              </View>
            </View>
            <View className='member-title'>协会副会长</View>

            {/* {showLike && item.isBind && (
              <Text className={`qcfont ${true ? 'qc-icon-xingxing like-active' : 'qc-icon-xingxing3 like'}`} />
            )} */}
          </View>
          <View className='desc'>
            <View>
              {item.position && <Text>{item.position}</Text>}
              {item.company && <Text>｜{item.company}</Text>}
            </View>
            {/* <View>CEO｜广州飞腾信息科技有限公司州飞腾信息科技有限公司</View> */}
          </View>
          {/* 个性标签 */}
          {item.labels && item.labels.length > 0 && (
            <ScrollView style={{ width: Taro.pxTransform(500), marginTop: Taro.pxTransform(20) }} scrollX>
              <View className='tags'>
                {item.labels.map((tag: any) => {
                  return (
                    <Text key={tag.id} className='tag'>
                      {tag.name}
                    </Text>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
      <View className='text-wrap'>
        <View className='line'>
          <Text className='l-title orange'>需求</Text>
          <Text className='l-content'>
            送i经典服饰送到附近山东送i经典服饰送到附近山东覅就上的飞机山东覅就史丹佛就覅就上的飞机山东覅就史丹佛就
          </Text>
        </View>
        <View className='line'>
          <Text className='l-title green'>资源</Text>
          <Text className='l-content'>送i经典服饰送到附近山东覅就上的飞机山东覅就史丹佛就</Text>
        </View>
      </View>
    </View>
  ) : (
        <View
          className={`alumni-card ${index % 3 === 0 ? 'yellow' : index % 3 === 1 ? 'blue' : 'white'}`}
          onClick={jumpPage}>
          <View className='head-image'>
            {/* <Image src={item.headImage} /> */}
            {item.headImage ? (
              <Avatar imgUrl={item.headImage} width={140} />
            ) : (
                <View className='qcfont qc-icon--user default-head' />
              )}
            {!item.isPublic && <View className='qcfont qc-icon-jiami jiami' />}
            {!item.isBind && (
              <Button className='yaoqing' openType='share' onClick={e => e.stopPropagation()} hoverClass='hover-button'>
                邀请加入
              </Button>
            )}
          </View>

          <View className='info-wrap'>
            <View className='name'>
              <View className='name-text'>
                <Text>{item.name}</Text>
                {item.isBind && <Text className='qcfont qc-icon-renzheng' />}
              </View>

              {showLike && item.isBind && (
                <Text className={`qcfont ${true ? 'qc-icon-xingxing like-active' : 'qc-icon-xingxing3 like'}`} />
              )}
              {/* {!item.isBind &&
            <Button className="yaoqing" openType="share" onClick={(e) => e.stopPropagation()}>邀请加入</Button>
          } */}
            </View>
            <View className='desc'>
              <View className='position'>
                {/-\/-/.test(item.className) ? item.className.replace('-/-', '-') : item.className}
              </View>
              {item.position && <View className='position'>{item.position}</View>}
              {item.company && <View className='company'>{item.company}</View>}
            </View>
            {/* 个性标签 */}
            {item.labels && item.labels.length > 0 && (
              <View className='tags'>
                {item.labels.map((tag: any) => {
                  return (
                    <Text key={tag.id} className='tag'>
                      {tag.name}
                    </Text>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      );
}

AlumniCard.options = {
  addGlobalClass: true
};

AlumniCard.defaultProps = {
  item: {},
  index: 0,
  showLike: false,
  type: ''
};
