import { View, Button } from '@tarojs/components';
import Taro, { useState, useEffect } from '@tarojs/taro';
import { checkVisitor } from '@/utils/authorize';

import './index.scss';

import { Dialog } from '@/components/common';
import api from '@/api';

function ShareWrap(props: any) {
  const { visible, onClose, onPoster } = props;

  const [shareVisible, setShareVisible] = useState(false);

  const [memberInfo, setMemberInfo] = useState<any>({});

  useEffect(() => {
    if (visible) {
      setShareVisible(true);
      setMemberInfo(Taro.getStorageSync('memberInfo'));
    }
  }, [visible]);

  const handleClose = () => {
    console.log('share-wrap handleClose');
    setShareVisible(false);
    onClose && onClose();
  };

  const generatePoster = () => {
    onPoster && onPoster();
    handleClose();
  };

  return (
    <View>
      <Dialog visible={shareVisible} onClose={handleClose} position='bottom'>
        <View className='share-btn-dialog'>
          <Button className='item' plain hoverClass='hover-item' openType='share' onClick={handleClose}>
            <View className='qcfont qc-icon-weixin' />
            <View>发送给朋友</View>
          </Button>
          {memberInfo.id && memberInfo.headImage && memberInfo.name ? (
            <Button className='item' plain hoverClass='hover-item' onClick={generatePoster}>
              <View className='qcfont qc-icon-haibao1' />
              <View>生成海报</View>
            </Button>
          ) : (
              <Button
                className='item'
                plain
                hoverClass='hover-item'
                openType='getUserInfo'
                onGetUserInfo={async e => {
                  const {
                    detail: { userInfo }
                  } = e;
                  if (userInfo) {
                    await checkVisitor(e);
                    generatePoster();
                  }
                }}>
                <View className='qcfont qc-icon-haibao1' />
                <View>生成海报</View>
              </Button>
            )}
        </View>
      </Dialog>
    </View>
  );
}

ShareWrap.options = {
  addGlobalClass: true
};

export default ShareWrap;
