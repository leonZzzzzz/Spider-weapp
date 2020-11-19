import Taro, { useState, useEffect, useDidShow } from '@tarojs/taro';
import { View, Text, Image, Button } from '@tarojs/components';
import './index.scss';

import api from '@/api/membership';
import { LogoWrap, LoadingBox, ContentWrap, Dialog } from '@/components/common';
import Utils from '@/utils/util';
import { IMG_HOST, HOME_PATH } from '@/config';

export default function Index() {
  const [pageLoading, setPageLoading] = useState(true);
  const [detail, setDetail] = useState('');
  const [visibleOpen, setVisibleOpen] = useState(false);
  const [levelList, setLevelList] = useState<any[]>([]);
  const [current, setCurrent] = useState<number | string>('');
  const [visibleTip, setVisibleTip] = useState(false);
  const [status, setStatus] = useState(true);
  const [membership, setMembership] = useState<any>({});

  useEffect(() => {
    memberLevelFeeGetInfo();
    memberLevelFeePage();
    memberLevelJoinGetMember();
  }, []);

  useDidShow(() => {
    memberLevelGetMemberStatus();
  });
  const memberLevelGetMemberStatus = async () => {
    const res = await api.memberLevelGetMemberStatus();
    setStatus(res.data.data.status);
  };

  const memberLevelJoinGetMember = async () => {
    const res = await api.memberLevelJoinGetMember();
    setMembership(res.data.data || {});
  };

  const memberLevelFeeGetInfo = async () => {
    const res = await api.memberLevelFeeGetInfo();
    setDetail(res.data.message);
    setPageLoading(false);
  };

  const memberLevelFeePage = async () => {
    const res = await api.memberLevelFeePage();
    const data = res.data.data;
    setLevelList(data);
  };

  const handleOppen = () => {
    if (current === '') {
      Utils.showToast('请选择');
      return;
    }
    const id = levelList[current].id;
    Utils.navigateTo(`/pagesCoWebs/membership/open/index?id=${id}`);
    setTimeout(() => {
      setVisibleOpen(false);
      setCurrent('');
    }, 1000);
  };

  return (
    <View className='membership'>
      <LoadingBox visible={pageLoading} />
      <View className='relative'>
        <ContentWrap content={detail} />
      </View>
      <LogoWrap bottom={110} />

      <View className='bottom-bar'>
        <View className='home-icon' onClick={() => Taro.switchTab({ url: HOME_PATH })}>
          <View className='qcfont qc-icon-home' />
          <View>首页</View>
        </View>
        <Button
          className='open-btn'
          onClick={() => {
            if (membership.memberLevelId && levelList.length === 0) {
              return;
            } else if (status) {
              setVisibleOpen(true);
            } else {
              setVisibleTip(true);
            }
          }}>
          {membership.memberLevelId && levelList.length === 0 ? (
            <View>
              <View>{membership.memberLevel.name}</View>
              {membership.endTime && (
                <View className='time'>有效期至：{membership.endTime.splice(10, membership.endTime.length)}</View>
              )}
            </View>
          ) : (
            <Text>{membership.memberLevelId ? '立即续费' : '立即开通'}</Text>
          )}
        </Button>
      </View>

      <Dialog visible={visibleOpen} isMaskClick={false} position='bottom'>
        <View className='open-dialog'>
          <View className='qcfont qc-icon-close' onClick={() => setVisibleOpen(false)} />
          <View className='group'>
            {levelList.map((item, index) => {
              return (
                <View className='item' key={item.id} onClick={() => setCurrent(index)}>
                  <View className='left'>
                    <View className='cover'>
                      {item.memberLevel.iconUrl && (
                        <Image className='cover-icon' src={IMG_HOST + item.memberLevel.iconUrl} mode='aspectFill' />
                      )}
                    </View>
                    <View className='name'>{item.name}</View>
                  </View>
                  <View className='right'>
                    <View className='price'>￥{Utils.filterPrice(item.amount)}</View>
                    <View className='checked'>
                      <View className={`qcfont ${current === index ? 'qc-icon-checked' : 'qc-icon-weixuanzhong'}`} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
          <Button className='open-btn' onClick={handleOppen}>
            {membership.memberLevelId ? '立即续费' : '立即开通'}
            {current !== '' && <Text>￥{Utils.filterPrice(levelList[current].amount)}</Text>}
          </Button>
        </View>
      </Dialog>

      <Dialog visible={visibleTip} isMaskClick={false}>
        <View className='tip-dialog'>
          <View>温馨提示</View>
          <View className='content'>您的会员申请资料待管理员审核中，请耐心等候</View>
          <Button className='tip-btn' onClick={() => setVisibleTip(false)}>
            知道了
          </Button>
        </View>
      </Dialog>
    </View>
  );
}

Index.config = {
  navigationBarTitleText: '会员权益'
};
