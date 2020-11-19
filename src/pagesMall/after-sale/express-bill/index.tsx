import Taro, { useState, useRouter } from '@tarojs/taro';
import { View, Image, Button, Input } from '@tarojs/components';
import util from '@/utils/util';
import api from '@/api/mall';
import { uploadImg } from '@/api/common';
import { IMG_HOST } from '@/config';
import './index.scss';
import { ThemeView } from '@/components/common';

export default function ExpressBill() {
  const [uploadBillImages, setUploadBillImages] = useState<any[]>([]); // 上传快递单
  const [count] = useState(1);
  const [limitSize] = useState(5);
  const [model, setModel] = useState<any>({
    // 快递单号
    billNo: '',
    // 快递公司
    expressCompany: ''
  });

  const { afterSaleId } = useRouter().params;
  const onInputChange = (type: string, e: any) => {
    // model[type] = e.detail.value;
    setModel(model => {
      model[type] = e.detail.value;
      return { ...model };
    });
  };

  // 选择图片
  const onChooseImage = () => {
    Taro.chooseImage({ count }).then(res => {
      console.log('choose image res :', res);
      handleWxChooseImage(res.tempFiles);
    });
  };

  // 处理小程序端的选择图片上传
  const handleWxChooseImage = (tempFiles: any[], count: number = 1) => {
    if (!tempFiles.length) return;

    if (tempFiles.length + uploadBillImages.length > count) {
      util.showToast(`最多上传${count}张图片`);
      return;
    } else {
      util.showLoading(true, '上传图片中...');
      let promiseArray: any[] = [];

      // for (let file of tempFiles) {
      for (let i = 0; i < tempFiles.length; i++) {
        const file = tempFiles[i];
        // 判断选择的图片大小
        const fileSize = file.size / 1024 / 1024;
        if (fileSize > limitSize) {
          util.showToast(`大于${limitSize}MB的图片将不会上传`);
        } else {
          let promise = uploadImg(file.path, { imageType: 'afterSale' });
          promiseArray.push(promise);
        }
      }
      Promise.all(promiseArray)
        .then(result => {
          console.log('[result] :', result);
          const _uploadBillImages = result.map(res => res.data.data.imageUrl);
          setUploadBillImages(prevProofImgs => {
            return [...prevProofImgs, ..._uploadBillImages];
          });
          util.showLoading(false);
        })
        .catch(err => {
          console.error('upload err :', err);
          // util.showLoading(false);
        });
    }
  };

  // 删除上传的凭证
  const deleteProofImg = (index: number, e: any) => {
    e.stopPropagation();
    setUploadBillImages(uploadBillImages => {
      uploadBillImages.splice(index, 1);
      return [...uploadBillImages];
    });
  };

  // 提交
  const submit = async () => {
    if (!model.billNo) {
      util.showToast('请填写快递单号');
      return;
    }
    if (!model.expressCompany) {
      util.showToast('请填写快递公司');
      return;
    }
    util.showLoading(true, '提交中');
    const params: any = {
      afterSaleOrderId: afterSaleId,
      expressNumber: model.billNo,
      expressCompany: model.expressCompany,
      expressBillImage: uploadBillImages.join(',')
    };
    console.log('expressBillImage :', params.expressBillImage);
    await api.exchangeGoodsUploadExpressBill(params);
    util.showToast('提交成功', 'success');
    setTimeout(() => {
      Taro.navigateBack();
    }, 2000);
  };

  const onPreviewImage = (index: number) => {
    let current = IMG_HOST + uploadBillImages[index];
    let urls = uploadBillImages.map(item => IMG_HOST + item);
    Taro.previewImage({
      current,
      urls
    });
  };

  return (
    <ThemeView>
      <View className='page-express-bill'>
        <View className='cell-item'>
          <View className='title'>快递单号</View>
          <Input
            type='text'
            className='content'
            placeholder='请输入快递单号'
            maxLength={64}
            value={model.billNo}
            onInput={e => onInputChange('billNo', e)}
          />
        </View>
        <View className='cell-item'>
          <View className='title'>快递公司</View>
          <Input
            type='text'
            className='content'
            placeholder='请输入快递公司'
            maxLength={64}
            value={model.expressCompany}
            onInput={e => onInputChange('expressCompany', e)}
          />
        </View>
        <View className='action-item'>
          <View className='title'>上传快递单</View>
          <View className='img-list'>
            {uploadBillImages.map((item, index) => {
              return (
                <View className='img-list__item' key={item} onClick={() => onPreviewImage(index)}>
                  <Image className='img-item' mode='aspectFit' src={IMG_HOST + item} />
                  <View className='qcfont qc-icon-guanbi' onClick={e => deleteProofImg(index, e)} />
                </View>
              );
            })}
            {uploadBillImages.length < count && (
              <View className='img-list__item' onClick={onChooseImage}>
                <View className='qcfont qc-icon-haibao' />
                <View className='content'>上传图片</View>
              </View>
            )}
          </View>
        </View>
        <View className='btn-wrapper'>
          <Button className='primary-btn' onClick={submit}>
            确定
          </Button>
        </View>
      </View>
    </ThemeView>
  );
}

ExpressBill.config = {
  navigationBarTitleText: '上传快递单'
};
