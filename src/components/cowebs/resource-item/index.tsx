import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, Text, Image, Block } from '@tarojs/components';
import { IMG_HOST } from '@/config';
import { useDispatch } from '@tarojs/redux';
import { saveRefreshId } from '@/store/actions/information';
import { Avatar, ThemeView } from '@/components/common';
import './index.scss';

function ResourceItem(props: any) {
  // console.log('ResourceItem')
  const dispatch = useDispatch();
  const { item, isEdit, onMoreScroll } = props;
  const [maxHeight] = useState(450);
  const [contentHeight, setContentHeight] = useState(0);
  const [max, setMax] = useState(false);
  const [hidden, setHidden] = useState(false);
  let stop = false;

  useEffect(() => {
    checkUpHeight();
  }, []);

  const checkUpHeight = () => {
    let query: any = null;
    if (process.env.TARO_ENV === 'h5') {
      query = Taro.createSelectorQuery().in(this);
    } else {
      query = Taro.createSelectorQuery().in(this.$scope);
    }
    query.select('.content-box').boundingClientRect();
    query.exec((res: any) => {
      if (res[0] && res[0].height) {
        // console.log('------------checkUpHeight', res[0].height)
        setContentHeight(res[0].height);
        setMax(res[0].height > maxHeight);
      }
    });
  };

  const navigateTo = () => {
    if (stop) {
      stop = false;
      return;
    }
    dispatch(saveRefreshId(item.id));
    if (item.type === 2) {
      Taro.navigateTo({
        url: `/pagesCoWebs/information/relay-detail/index?id=${item.id}`
      });
    } else {
      Taro.navigateTo({
        url: `/pagesCoWebs/information/detail/index?id=${item.id}`
      });
    }
  };
  // 预览轮播列表的大图
  const previewImage = (index: number) => {
    stop = true;
    let imgList = item.imgUrl.split(',').map((img: string) => IMG_HOST + img);

    let current = imgList[index];
    Taro.previewImage({
      current,
      urls: imgList
    });
  };

  const open = () => {
    setMax(prevMax => !prevMax);
    setHidden(prevHidden => !prevHidden);
    if (!max) onMoreScroll && onMoreScroll(contentHeight - 400);
  };

  return (
    <ThemeView>
      <View className='resource-item box-shadow' onClick={navigateTo}>
        {isEdit ? (
          <View className='category-wrap'>
            <Text>{item.category}</Text>
          </View>
        ) : (
          <View className='top-wrap'>
            <View
              className='avatar-box'
              onClick={e => {
                e.stopPropagation();
                Taro.navigateTo({ url: `/pagesCoWebs/contacts/detail/index?memberId=${item.memberId}` });
              }}>
              <Avatar imgUrl={item.headImage} width={60} style={{ border: '1rpx solid rgb(250, 96, 0)' }} />
              <Text>{item.username}</Text>
            </View>
          </View>
        )}
        <View className='right'>{item.type === 2 && <View className='jielong'>接龙报名</View>}</View>
        <View className={`content-box ${max ? 'max-height' : ''}`}>
          {item.title && item.type === 2 && <View className='title'>{item.title}</View>}
          <View className='content--text'>{item.content}</View>
          {item.imgUrl && (
            <View className='attachment-list'>
              {item.imgUrl.split(',').map((img: any, index: number) => {
                return (
                  <View key={img} className={`attachment-item ${item.imgUrl.split(',').length === 1 ? 'big-img' : ''}`}>
                    <Image src={IMG_HOST + img} mode='aspectFill' onClick={() => previewImage(index)} />
                  </View>
                );
              })}
            </View>
          )}

          {contentHeight > maxHeight && (
            <Block>
              {hidden ? (
                <View
                  className='more'
                  onClick={e => {
                    e.stopPropagation();
                    open();
                  }}>
                  <Text className='qcfont qc-icon-chevron-up-copy' />
                  <Text>收起</Text>
                </View>
              ) : (
                <View
                  className='more'
                  onClick={e => {
                    e.stopPropagation();
                    open();
                  }}>
                  <Text className='qcfont qc-icon-chevron-down' />
                  <Text>展开</Text>
                </View>
              )}
            </Block>
          )}
        </View>
        <View className='resource-bottom-wrap'>
          {/* {item.createTime &&
          <View>{item.createTime.substring(0, item.createTime.length - 3)}</View>
        } */}
          <View>{item.createTimeStr}</View>
          <View className='icon-group'>
            <View className='i-item'>
              <Text className='qcfont qc-icon-fenxiang' />
              <Text>{item.shareQuantity}</Text>
            </View>
            <View className='i-item'>
              <Text className='qcfont qc-icon-liuyan' />
              <Text>{item.commentQuantity}</Text>
            </View>
            <View className='i-item'>
              <Text className='qcfont qc-icon-yanjing' />
              <Text>{item.visitQuantity}</Text>
            </View>
          </View>
        </View>

        {/* {isEdit && 
        <View className="edit-wrap">
          <Button>删除</Button>
          <Button className="blue">发布</Button>
          <Button className="blue">修改</Button>
        </View>
      } */}
      </View>
    </ThemeView>
  );
}

ResourceItem.options = {
  addGlobalClass: true
};

ResourceItem.defaultProps = {
  item: {}
};

export default ResourceItem;
