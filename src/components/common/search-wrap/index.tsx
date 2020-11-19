import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, Text, Button, Image } from '@tarojs/components';
import { AtSearchBar } from 'taro-ui';
import { Dialog, AuthorizeWrap, ThemeView } from '@/components/common';
// import Dialog from '../dialog'
// import AuthorizeWrap from '../authorize-wrap'
import api from '@/api/cowebs';
import { IMG_HOST } from '@/config';
import './index.scss';

function SearchWrap(props: any) {
  const [authorizeVisible, setAuthorizeVisible] = useState(false);
  const { value, isInput, onConfirm, onClear, highLevel, highLevelUrl, onChange, options, placeholderText } = props;
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');
  const [phone, setPhone] = useState('');
  // console.log('SearchWrap')

  useEffect(() => {
    if (!isInput) getAppCustomer();
  }, []);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    onChange && onChange(text);
  }, [text]);

  const handleSearch = () => {
    onConfirm && onConfirm(text);
  };

  const handleClear = () => {
    onClear && onClear();
  };

  const navigateTo = () => {
    // if (isInput) return
    // if (!Taro.getStorageSync('memberId')) {
    //   setAuthorizeVisible(true)
    //   return
    // }
    Taro.navigateTo({ url: '/pagesCoWebs/advanced-search/index' });
  };

  const handleSearchChange = (e: any) => {
    setText(e);
  };

  const getAppCustomer = async () => {
    const res = await api.getAppCustomer();
    const data = res.data.data;
    setPhone(data.value || '');
  };

  const makePhoneCall = async () => {
    if (!phone) {
      Taro.showToast({
        title: '没有号码，请先配置',
        icon: 'none'
      });
      return;
    }
    try {
      await Taro.makePhoneCall({
        phoneNumber: phone || ''
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <ThemeView>
      {isInput ? (
        <View className='qc-search-bar'>
          <AtSearchBar
            value={value}
            onClear={handleClear}
            onChange={handleSearchChange}
            onActionClick={handleSearch}
            onConfirm={handleSearch}
            placeholder={text ? '' : placeholderText}
            className={`search-bar ${highLevel ? 'search-bar-level' : ''}`}
          />
          {highLevel && (
            <Button className='height-level' plain onClick={() => Taro.navigateTo({ url: highLevelUrl })}>
              高级查询
            </Button>
          )}
        </View>
      ) : (
        <View className='search-wrap'>
          <View className='search-input' onClick={navigateTo}>
            <Text className='icon qcfont qc-icon-sousuo'></Text>
            <Text>输入关键字搜索</Text>
          </View>
          {options.isService && (
            <View className={`kefu ${options.icon ? 'kefu-img' : ''}`} onClick={() => setVisible(true)}>
              {options.icon ? (
                <Image src={IMG_HOST + options.icon} mode='aspectFill' />
              ) : (
                <Text className='qcfont qc-icon-kefu2' />
              )}
            </View>
          )}
        </View>
      )}
      {!isInput && (
        <Dialog visible={visible} position='center' onClose={() => setVisible(false)}>
          <View className='kefu-dialog'>
            <View className='kefu-btn'>
              <Button hoverClass='hover-button' onClick={makePhoneCall}>
                一键拨号
              </Button>
            </View>
            <View className='kefu-btn'>
              <Button hoverClass='hover-button' openType='contact'>
                联系微信客服
              </Button>
            </View>
          </View>
        </Dialog>
      )}

      <AuthorizeWrap visible={authorizeVisible} onHide={() => setAuthorizeVisible(false)} isClose={true} />
    </ThemeView>
  );
}

SearchWrap.options = {
  addGlobalClass: true
};

SearchWrap.defaultProps = {
  placeholderText: '搜索'
  // isInput: false,
  // value: '',
  // onConfirm: () => {},
  // onClear: () => {},
  // highLevel: false,
  // highLevelUrl: '',
};

// function areEqual(prevProps: any, nextProps: any) {
//   console.log('areEqual', prevProps, nextProps)
//   if (nextProps.value == prevProps.value) return true
//   return false
// }

// export default Taro.memo(SearchWrap)
export default SearchWrap;
