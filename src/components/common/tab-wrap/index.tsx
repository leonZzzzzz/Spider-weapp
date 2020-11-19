import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, ScrollView } from '@tarojs/components';
// import classnames from 'classnames'
import classNames from 'classnames';

import './index.scss';
import ThemeView from '../theme-view';

function TabsWrap(props: any) {
  const { tabs, current, isNum, onClickTabs, scroll, style, bottomLine, activeColorStyle, bgStyle } = props;
  const [scrollIntoView, setScrollIntoView] = useState('');

  const handleClickTabs = (val: number | string): void => {
    if (val === current) return;
    onClickTabs && onClickTabs(val);
    // if (scroll) updateState(index)
  };

  const updateState = (idx: number) => {
    if (scroll) {
      const index = Math.max(idx - 1, 0);
      setScrollIntoView(`tab${index}`);
    }
  };

  useEffect(() => {
    const index = tabs.findIndex((item: any) => item.id === current);
    console.log('useEffect current', index);
    // if (index === 0) updateState(index)
    if (scroll) updateState(index);
  }, [current]);

  const TabsCls = classNames({
    tabs__wrap: true,
    'bottom-line': bottomLine,
    [`${activeColorStyle}`]: true,
    [`${bgStyle}`]: true
  });

  const tabItems = tabs.map((item: any, index: number) => {
    const itemCls = classNames({
      'tabs__scroll-item': scroll,
      tabs__item: !scroll,
      'tabs__item-active': current === item.id
    });

    return (
      <View className={itemCls} key={item.id} id={`tab${index}`} onClick={() => handleClickTabs(item.id)}>
        {item.title ? item.title : item.name}
        {isNum ? `(${item.num})` : ''}
        <View className='tabs__item-underline'></View>
      </View>
    );
  });

  return scroll ? (
    <ThemeView>
      <ScrollView scrollX className={TabsCls} style={style} scrollIntoView={scrollIntoView} scrollWithAnimation>
        {tabItems}
      </ScrollView>
    </ThemeView>
  ) : (
    <ThemeView>
      <View className={TabsCls} style={style}>
        {tabItems}
      </View>
    </ThemeView>
  );
}

TabsWrap.defaultProps = {
  tabs: [],
  current: 0,
  isNum: false,
  scroll: true,
  style: {},
  bottomLine: false
};

export default TabsWrap;
