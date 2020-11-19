import Taro, { useRouter, useEffect, useState } from '@tarojs/taro';
import { View, Button } from '@tarojs/components';
import { LogoWrap, ThemeView, CodeModel } from '@/components/common';
import './index.scss';
import api from '@/api';
import Utils from '@/utils/util';
import { IMG_HOST } from '@/config';

export default function ActivitySuccess() {
  const { id } = useRouter().params;
  const [config, setConfig] = useState<any>({});
  const [code, setCode] = useState(false);

  useEffect(() => {
    getAppidAndPath();
  }, []);

  const navigateToMiniProgram = async () => {
    setCode(true)
    // try {
    //   const res = await Taro.navigateToMiniProgram({
    //     appId: config.miniProgramAppId,
    //     path: config.miniProgramIndexPath
    //     // envVersion: 'trial'
    //   });
    //   console.log(res);
    // } catch (err) {
    //   console.error('navigateToMiniProgram', err);
    //   Utils.showToast(err.errMsg);
    // }
  };

  const getAppidAndPath = async () => {
    const res = await api.getAppidAndPath();
    const data = res.data.data;
    setConfig(data);
  };
  const savePoster = e => {
    //下载图片
    let imgPath1 = IMG_HOST + `/attachments/null/9d0d52219ee94ec8a3aa229e3d563902.png`;
    let that = this;
    Taro.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          //没有授权
          Taro.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              downloadImgToAlbum(imgPath1);
            },
            fail() {
              that.setState({
                //显示授权层
                openSetting: true
              });
            }
          });
        } else {
          //已授权
          downloadImgToAlbum(imgPath1);
        }
      }
    });
  };

  const downloadImgToAlbum = imgPath1 => {
    Taro.showToast({
      title: '正在保存，请稍等',
      icon: 'none',
      duration: 2000
    });
    //下载图片
    downloadHttpImg(imgPath1).then(res => {
      sharePosteCanvas(res);
    });
  };

  const downloadHttpImg = httpImg => {
    return new Promise((resolve, reject) => {
      Taro.downloadFile({
        url: httpImg,
        success: res => {
          if (res.statusCode === 200) {
            resolve(res.tempFilePath);
          } else {
            Taro.showToast({
              title: '图片下载失败！',
              icon: 'none',
              duration: 1000
            });
          }
        },
        fail: res => {
          Taro.showToast({
            title: '提示图片下载失败！',
            icon: 'none',
            duration: 1000
          });
        }
      });
    });
  };

  const sharePosteCanvas = imgUrl => {
    Taro.saveImageToPhotosAlbum({
      filePath: imgUrl,
      success(res) {
        Taro.showToast({
          title: '图片已保存到相册',
          icon: 'none',
          duration: 1000
        });
      },
      fail(err) {
        Taro.showToast({
          title: '图片保存失败',
          icon: 'none',
          duration: 1000
        });
      }
    });
  };

  return (
    <ThemeView>
      <CodeModel code={code} onCode={() => { setCode(false) }} saveposter={savePoster}></CodeModel>
      <View className='success'>
        <View className='success-wrap'>
          <View className='success-status'>
            <View className='qcfont qc-icon-checked'></View>
            <View className='status-title'>开通成功！</View>
          </View>

          <View className='btn-box'>
            <Button onClick={() => Taro.navigateBack()}>返回</Button>
            <Button type='primary' onClick={navigateToMiniProgram}>
              立即学习
            </Button>
          </View>
        </View>

        <LogoWrap />
      </View>
    </ThemeView>
  );
}

ActivitySuccess.config = {
  navigationBarTitleText: '报名成功'
};
