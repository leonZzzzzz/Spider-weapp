import Taro, { useState, useEffect } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './index.scss'
import util from '@/utils/util';
import api from '@/api/cowebs'
import { baseUrl, IMG_HOST } from '@/config';
// import { LoadingBox, LogoWrap, ContentWrap } from '@/components/common';
import { upyellowPage } from '@/api/cards'

export default function Index() {
  const [pageLoading, setPageLoading] = useState(true)
  const [contentStr, setContentStr] = useState<any>('')
  const [imageUrl, setImageUrl] = useState<any[]>([]);
  const [pdfUrl, setPdfUrl] = useState<any[]>([]);
  const [count] = useState(9); // 上传图片数量
  const [limitSize] = useState(5); // 上传图片限制  5mb
  const [list, setList] = useState({});
  useEffect(() => {
    setList(this.$router.params)
  }, [])


  // 选择图片
  const chooseImage = async () => {
    const res = await Taro.chooseImage({
      count: 9 - imageUrl.length, // 默认9
      sizeType: ['compressed'] // 可以指定是原图还是压缩图，默认二者都有
    });
    handleWxChooseImage(res.tempFiles, count);
  };

  // 处理小程序端的选择图片上传
  const handleWxChooseImage = async (tempFiles: any[], count: number) => {
    if (!tempFiles.length) return;
    if (tempFiles.length + imageUrl.length > count) {
      util.showToast(`最多上传${count}张图片`);
      return;
    } else {
      util.showLoading(true, '上传图片中...');
      let promiseArray: any[] = [];
      for (let i = 0; i < tempFiles.length; i++) {
        const file = tempFiles[i];
        // 判断选择的图片大小
        const fileSize = file.size / 1024 / 1024;
        if (fileSize > limitSize) {
          util.showToast(`大于${limitSize}MB的图片将不会上传`);
        } else {
          const promise = api.uploadImg(file.path, { imageType: 'information' });
          promiseArray.push(promise);
        }
      }
      try {
        const result = await Promise.all(promiseArray);
        console.log('[result] :', result);
        const _imageUrl = result.map(res => res.data.data.imageUrl);
        console.log(_imageUrl)
        setImageUrl(prev => {
          return [...prev, ..._imageUrl];
        });
        util.showLoading(false);
      } catch (err) {
        console.error('upload err :', err);
        // util.showLoading(false);
      }
    }
  };
  // 企业介绍
  const handleInput = async (e) => {
    setContentStr(e.detail.value)
  }

  // 上传pdf
  const upPdf = async () => {
    const res = await Taro.chooseImage({
      count: 9 - pdfUrl.length, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
    });
    handleWxChoosepdf(res.tempFiles, count);
  }
  const handleWxChoosepdf = async (tempFiles: any[], count: number) => {
    if (!tempFiles.length) return;
    if (tempFiles.length + pdfUrl.length > count) {
      util.showToast(`最多上传${count}张图片`);
      return;
    } else {
      util.showLoading(true, '上传图片中...');
      tempFiles.map(file => {
        Taro.uploadFile({
          url: baseUrl + 'api/v1/nameCard/pdfToImg',
          header: {
            'content-type': 'application/json;charset=UTF-8'
          },
          name: 'file',
          filePath: file.path,
          success: (resp) => {
            util.showLoading(false)
            //图片上传成功，图片上传成功的变量+1
            let resultData = JSON.parse(resp.data)
            if (resultData.code === 20000) {
              let img = resultData.data
              console.log(img)
              setPdfUrl(prev => {
                return [...prev, ...img];
              });
              // pdfUrl.push(img[0])
              // console.log(pdfUrl)
              // setPdfUrl(pdfUrl)
            } else {

            }
          },

        })
      })

    }
  };
  // 保存
  const save = async () => {
    if (imageUrl.length < 1) {
      Taro.showToast({
        title: '请上传图片',
        icon: 'none'
      })
      return
    }
    if (pdfUrl.length < 1) {
      Taro.showToast({
        title: '请将内容填写完整',
        icon: 'none'
      })
      return
    }
    if (!contentStr) {
      Taro.showToast({
        title: '请上传企业介绍pdf',
        icon: 'none'
      })
      return
    }
    let img = ''
    imageUrl.map(val => {
      img += val + '_'
    })
    img = img.slice(0, -1)
    let pdf = ''
    pdfUrl.map(val => {
      pdf += val + '_'
    })
    pdf = pdf.slice(0, -1)
    util.showLoading(true);
    const params = { imgUrl: img, pdfUrl: pdf, contentStr, id: list.id, contentId: '' }
    const res = await upyellowPage(params)
    util.showLoading(false);
    if (res.data.code == 20000) {
      setTimeout(() => {
        Taro.navigateBack()
      }, 1000);
    }
  }

  return (
    <View className='page'>
      {/* <LoadingBox visible={pageLoading} /> */}
      <View className='pics'>
        {imageUrl.map((item: string, index: number) => {
          return (
            <View className='items' key={item}>
              <Image src={IMG_HOST + item} mode='aspectFill' />
              <Text
                className='qcfont qc-icon-guanbi close'
                onClick={() => {
                  setImageUrl(prev => {
                    prev.splice(index, 1);
                    return [...prev];
                  });
                }}
              />
            </View>
          );
        })}
        {imageUrl.length < 9 && (
          <View className='add' onClick={chooseImage}>
            <Text className='qcfont qc-icon-jia' />
            <View>添加图片</View>
          </View>
        )}
      </View>
      <Textarea className='writeText' placeholder='介绍你的企业...' value={contentStr} onInput={(e) => handleInput(e)}></Textarea>
      {pdfUrl.map((item: string, index: number) => {
        return (
          <View className='pdfimg' key={item}>
            <Image src={IMG_HOST + item} mode='aspectFill' />
            <Text
              className='qcfont qc-icon-guanbi close'
              onClick={() => {
                setPdfUrl(prev => {
                  prev.splice(index, 1);
                  return [...prev];
                });
              }}
            />
          </View>
        );
      })}
      {pdfUrl.length < 9 && (
        <View className='uppdf' onClick={upPdf}>
          <Text>+ 上传企业介绍PDF</Text>
        </View>
      )}

      <View className='btn' onClick={save}><Text>保存并发布</Text></View>
      {/* <LogoWrap /> */}
    </View>
  )
}

Index.config = {
  navigationBarTitleText: '企业黄页'
}