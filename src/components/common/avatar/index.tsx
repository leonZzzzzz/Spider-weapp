import { View, Image } from '@tarojs/components'
import Taro, { useMemo, useState, useEffect } from '@tarojs/taro'
import { IMG_HOST } from '@/config'
import util from '@/utils/util';
import api from '@/api/cowebs';
import './index.scss'

function Avatar(props: any): JSX.Element {
  let { imgUrl, width, style, onEvent } = props
  const [imageurl, setImageurl] = useState<any>('');

  const setStyles = (width: number) => {
    return {
      // width: width + 'rpx',
      // height: width + 'rpx',
      width: Taro.pxTransform(width),
      height: Taro.pxTransform(width),
      ...style
    }
  }

  const styles = useMemo(() => setStyles(width), [props.width])

  const handleClick = () => {
    onEvent && onEvent()
  }

  // 选择头像
  const chooseImage = async () => {
    const res = await Taro.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'] // 可以指定是原图还是压缩图，默认二者都有
    });
    handleWxChooseImage(res.tempFiles);
  };

  // 处理小程序端的选择图片上传
  const handleWxChooseImage = async (tempFiles: any[]) => {
    if (!tempFiles.length) return;

    // if (tempFiles.length + imageUrl.length > count) {
    //   util.showToast(`最多上传${count}张图片`);
    //   return;
    // } else {
    util.showLoading(true, '上传图片中...');
    let promiseArray: any[] = [];
    for (let i = 0; i < tempFiles.length; i++) {
      const file = tempFiles[i];
      // 判断选择的图片大小
      const fileSize = file.size / 1024 / 1024;
      if (fileSize > 5) {
        util.showToast(`大于5MB的图片将不会上传`);
      } else {
        console.log(file.path)
        const promise = api.uploadImg(file.path, { imageType: 'information' });
        promiseArray.push(promise);
      }
    }
    try {
      const result = await Promise.all(promiseArray);
      console.log('[result] :', result);
      const _imageUrl = result.map(res => res.data.data.imageUrl);
      console.log(IMG_HOST + _imageUrl[0])
      setImageurl(IMG_HOST + _imageUrl[0])
      // setImageUrl(prev => {
      //   return [...prev, ..._imageUrl];
      // });
      util.showLoading(false);
    } catch (err) {
      console.error('upload err :', err);
      // util.showLoading(false);
    }
    // }
  };

  return (
    <View className="head-wrap" style={styles} onClick={chooseImage}>
      {imageurl ? (
        <Image src={imageurl} mode="aspectFill" />
      ) : (
          <Image src={imgUrl} mode="aspectFill" />
        )}

    </View>
  )
}

Avatar.defaultProps = {
  imgUrl: '',
  width: 50,
  style: {},
}

export default Avatar