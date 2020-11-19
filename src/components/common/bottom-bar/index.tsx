import Taro from '@tarojs/taro';
import { View, Text, Button, Form } from '@tarojs/components';
import { HOME_PATH } from '@/config';
import { checkVisitor } from '@/utils/authorize';
import util from '@/utils/util';
import './index.scss';

const checkAuthorize = (e: any, callback: Function) => {
  checkVisitor(e).then(() => {
    callback && callback();
  });
};
export default function BottomBar(props: any) {
  const {
    children,
    onComment,
    praiseQuantity,
    onPraise,
    isPraise,
    isAudit,
    onTip,
    onShare,
    isPoster,
    showPraise,
    showComment,
    showShare,
    showHome,
    showMy,
    showCart
  } = props;
  const handleComment = async (e: any) => {
    checkAuthorize(e, () => {
      onComment();
    });
  };
  const handlePraise = async (e: any) => {
    checkAuthorize(e, () => {
      onPraise();
    });
  };

  return (
    <View className='bottom-bar'>
      {showHome && (
        <Button className='item' plain onClick={() => Taro.switchTab({ url: HOME_PATH })}>
          <Text className='qcfont qc-icon-shouye1' />
          <Text>首页</Text>
        </Button>
      )}

      {showMy && (
        <Button className='item' plain onClick={() => Taro.switchTab({ url: '/pages/my/index' })}>
          <Text className='qcfont qc-icon--user' />
          <Text>我的</Text>
        </Button>
      )}

      {showShare &&
        (isAudit ? (
          isPoster ? (
            <Button className='item' plain onClick={() => onShare && onShare()}>
              <Text className='qcfont qc-icon-fenxiang7' />
              <Text>分享</Text>
            </Button>
          ) : (
              <Button className='item' plain openType='share'>
                <Text className='qcfont qc-icon-fenxiang7' />
                <Text>分享</Text>
              </Button>
            )
        ) : (
            <Button className='item' plain onClick={() => onTip && onTip()}>
              <Text className='qcfont qc-icon-fenxiang7' />
              <Text>分享</Text>
            </Button>
          ))}
      {showComment && (
        <Button openType='getUserInfo' onGetUserInfo={handleComment} className='item' plain>
          <Text className='qcfont qc-icon-liuyan2' />
          <Text>留言</Text>
        </Button>
      )}
      {showPraise && (
        <Form style='flex: 1;'>
          <Button className='item' plain openType='getUserInfo' onGetUserInfo={handlePraise}>
            <Text className={`qcfont qc-icon-zan ${isPraise ? 'praise-active' : ''}`} />
            <Text>{praiseQuantity || 0}</Text>
          </Button>
        </Form>
      )}
      {showCart && (
        <Button className='item' plain onClick={() => util.navigateTo('/pages/cart/index')}>
          <Text className='qcfont qc-icon-gouwuche2' />
          <Text>购物车</Text>
        </Button>
      )}
      {children}
    </View>
  );
}

BottomBar.options = {
  addGlobalClass: true
};
BottomBar.defaultProps = {
  isPoster: false,
  isAudit: true,
  showPraise: true,
  showComment: true,
  showShare: true,
  showHome: true,
  showMy: false,
  showCart: false
};
