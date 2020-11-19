import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, Image, Text, ScrollView, Block } from '@tarojs/components';
import { IMG_HOST } from '@/config';
import util from '@/utils/util';
import { ThemeView } from '@/components/common';
import './index.scss';

export default function ActivityItem(props: any) {
  const { item, index, type, showCategory, showPayStatus } = props;
  const [screen] = useState(() => Taro.getSystemInfoSync().screenWidth / 750);
  const [widthScrollView1, setWidthScrollView1] = useState(0);
  const [widthScrollView2, setWidthScrollView2] = useState(0);

  useEffect(() => {
    if (item.id) {
      getScrollViewWidth();
    }
  }, [item]);

  const getScrollViewWidth = () => {
    const query = Taro.createSelectorQuery().in(this.$scope);
    query.select(type === 'scrollX' ? '.price1' : '.price2').boundingClientRect();
    query.exec((res: any) => {
      console.log('getScrollViewWidth===>', res)
      if (!res[0]) res[0] = {width: 0}
      if (type === 'scrollX') {
        // console.log(item.title, 392 - Math.round(res[0].width / screen))
        setWidthScrollView1(392 - Math.round(res[0].width / screen));
      } else {
        // console.log(item.title, 312 - Math.round(res[0].width / screen))
        setWidthScrollView2(312 - Math.round(res[0].width / screen));
      }
    });
  };
  const famter = (val) => {
    var tag = parseFloat(val / 100).toFixed(2)
    return tag
  }

  const navigateTo = () => {
    util.navigateTo(
      `/pagesCoWebs/activity/${item.showStyle === 2 ? 'detail-commission' : 'detail'}/index?id=${item.id}`
    );
  };

  const statusStr = (status: number) => {
    return {
      0: '预览',
      1: '未开始',
      2: '报名中',
      3: '已截止',
      4: '进行中',
      5: '已结束'
    }[status];
  };

  return type === 'scrollX' ? (
    <View className={`activity-item-scrollX ${index === 0 ? 'first' : ''}`} key={item.id} onClick={navigateTo}>
      <ThemeView>
        <View className='activity-box box-shadow'>
          <View className='top'>
            <Image className='activity-pic' mode='aspectFill' src={IMG_HOST + item.iconUrl} />
          </View>
          <View className='bottom'>
            <View className='activity-title'>
              {item.categoryStr && showCategory && <Text className='category'>{item.categoryStr}</Text>}
              <Text selectable>{item.title}</Text>
            </View>
            <View className='time-wrap'>
              <Text>{item.signNum > 0 ? `${item.signNum}人已报名` : ''}</Text>
              <Text>{item.startTimeStr}</Text>
            </View>
            <View className='desc'>
              <View className='price price1'>
                {item.isEnableFee ? (
                  <Block>
                    {item.activityFee.price > 0 && (<Text>￥{famter(item.activityFee.price)} </Text>)}
                    {(item.activityFee.price > 0 && item.activityFee.point > 0) && (<text>|</text>)}
                    {item.activityFee.point > 0 && (<Text> {item.activityFee.point}积分</Text>)}
                  </Block>
                ) : (
                    <Text>免费</Text>
                  )}
              </View>
              {item.activityTagList && item.activityTagList.length > 0 ? (
                <ScrollView style={{ width: Taro.pxTransform(widthScrollView1) }} scrollX>
                  <View className='tags'>
                    {item.activityTagList.map((tag: any) => {
                      return (
                        <Text key={tag.id} className='tag'>
                          {tag.name}
                        </Text>
                      );
                    })}
                  </View>
                </ScrollView>
              ) : (
                  <View />
                )}
            </View>
          </View>
        </View>
      </ThemeView>
    </View>
  ) : (
      <ThemeView>
        <View className={`activity-item ${index > 0 ? 'activity-item-line' : ''}`} key={item.id} onClick={navigateTo}>
          <View className='activity-item__left'>
            <Image mode='aspectFill' src={IMG_HOST + item.iconUrl} />
          </View>
          <View className='activity-item__right'>
            <View className='title'>
              {item.status !== '' && (
                <Text
                  className={`item-status-text ${
                    item.status === 1 ? 'not-start' : item.status === 2 || item.status === 4 ? 'start' : ''
                    }`}>
                  {statusStr(item.status)}
                </Text>
              )}
              <Text selectable>{item.title}</Text>
            </View>
            <View className='time-wrap'>
              {item.startTimeStr && <Text>{item.startTimeStr}</Text>}
              <Text>{item.signNum > 0 ? `${item.signNum}人已报名` : ''}</Text>
            </View>
            <View className='desc'>
              {!showPayStatus && (
                <Block>
                  {item.activityTagList && item.activityTagList.length > 0 ? (
                    <ScrollView style={{ width: Taro.pxTransform(widthScrollView2) }} scrollX>
                      <View className='tags'>
                        {item.activityTagList.map((tag: any) => {
                          return (
                            <Text key={tag.id} className='tag'>
                              {tag.name}
                            </Text>
                          );
                        })}
                      </View>
                    </ScrollView>
                  ) : (
                      <View />
                    )}
                </Block>
              )}
              {showPayStatus && item.isEnableFee && item.signStatus === 4 && (item.payWay == 'online' || item.payWay == '' || item.payWay == undefined) ? (
                <View className='tags'><Text className='tag'>待支付</Text></View>
              ) : (
                  <View />
                )}
              <View className='price price1'>
                {item.isEnableFee ? (
                  <Block>
                    {item.activityFee.price > 0 && (<Text>￥{util.filterPrice(item.activityFee.price)} </Text>)}
                    {(item.activityFee.price > 0 && item.activityFee.point > 0) && (<text>|</text>)}
                    {item.activityFee.point > 0 && (<Text> {item.activityFee.point}积分</Text>)}
                  </Block>
                ) : (
                    <Text>免费</Text>
                  )}
              </View>
              {/* <View className='price price2'>
                {item.isEnableFee ? '￥' + util.filterPrice(item.activityFee.price): '免费'}
              </View> */}
            </View>
          </View>
        </View>
      </ThemeView>
    );
}

ActivityItem.defaultProps = {
  item: {
    activityFee: {}
  },
  type: '',
  showCategory: true,
  showPayStatus: false
};

ActivityItem.options = {
  addGlobalClass: true
};
