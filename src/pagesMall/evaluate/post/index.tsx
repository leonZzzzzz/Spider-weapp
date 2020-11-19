import Taro, { useState, useEffect, useReachBottom, usePullDownRefresh, useDidShow, useRouter } from '@tarojs/taro';
import { View, Text, Image, Button } from '@tarojs/components';
import { AtRate, AtTextarea } from 'taro-ui';

import './index.scss';

import api from '@/api/mall';
import util from '@/utils/util';
import { IMG_HOST } from '@/config';
import { LoadingBox } from '@/components/common';
import { useTheme } from '@/useHooks/useFlywheel';

export default function EvaluatePost() {
  const [btnLoading, setBtnLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const theme =useTheme()
  const { id } = useRouter().params;

  useEffect(() => {
    getListForEvaluation();
  }, []);

  const getListForEvaluation = async () => {
    const res = await api.getListForEvaluation({ orderId: id });
    let orderItems = res.data.data;
    orderItems.forEach((item: any) => {
      item.score = 0;
      item.content = '';
    });
    setOrderItems(orderItems);
    setPageLoading(false);
  };

  const handleRateChange = (index: number, score: any) => {
    setOrderItems(orderItems => {
      orderItems[index].score = score;
      return [...orderItems];
    });
  };

  const onTextAreaInput = (index: number, e: any) => {
    let value = e.target.value;
    // orderItems[index].content = value;
    // setOrderItems(orderItems);
    setOrderItems(orderItems => {
      orderItems[index].content = value;
      return [...orderItems];
    });
  };

  const submit = () => {
    util.showLoading(true, '提交中');
    if (btnLoading) return;
    setBtnLoading(true);
    let length = 0;
    let promiseArray: any = [];
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      if (!item.score || !item.content) {
        length++;
      }
      let params = {
        orderItemId: item.id,
        score: item.score,
        content: item.content,
        imageList: [
          {
            imageUrl: ''
          }
        ]
      };
      let promise = api.insertProductEvaluate(params);
      promiseArray.push(promise);
    }
    if (length === orderItems.length) {
      util.showToast('至少评价一件商品哦！');
      setBtnLoading(false);
      return;
    }
    Promise.all(promiseArray)
      .then(() => {
        util.showToast('评价成功', 'success');
        setBtnLoading(false);
        setTimeout(() => {
          Taro.navigateBack();
        }, 2000);
      })
      .catch(() => {
        setBtnLoading(false);
      });
  };

  return (
    <View className='page-evaluate-post' style={theme}>
      <LoadingBox visible={pageLoading} />

      {orderItems.map((item, index) => {
        return (
          <View className='evaluate-item' key={item.id}>
            <View className='product-info'>
              <Image className='cover' src={IMG_HOST + item.iconUrl} />
              <View className='info'>
                <View className='name'>{item.name}</View>
                <View className='specs'>{item.specs}</View>
              </View>
            </View>
            <View className='rate'>
              <Text className='m-r-2'>商品评价：</Text>
              <AtRate value={item.score} onChange={e => handleRateChange(index, e)} />
            </View>
            <View className='evaluate-textarea'>
              <AtTextarea
                value={item.content}
                placeholder='分享一下你的体验吧(不超过140字)'
                maxLength={140}
                onChange={e => onTextAreaInput(index, e)}
              />
            </View>
          </View>
        );
      })}
      <View className='button-wrapper'>
        <Button className='primary-btn' onClick={submit}>
          发布
        </Button>
      </View>
    </View>
  );
}

EvaluatePost.config = {
  navigationBarTitleText: '商品评价'
};
