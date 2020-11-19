import Taro, { useState, useEffect, useDidShow, useRouter } from '@tarojs/taro';
import { View, Text, Image, Button, Input } from '@tarojs/components';

import './index.scss';
import util from '@/utils/util';
import api from '@/api/mall';

import { LoadingBox, Dialog } from '@/components/common';

import { IMG_HOST } from '@/config';

const SuccessImg = IMG_HOST + '/attachments/images/success.png';
const PendingImg = IMG_HOST + '/attachments/images/pending.png';
const FailImg = IMG_HOST + '/attachments/images/fail.png';

export default function AfterSaleDetail() {
  const [pageLoading, setPageLoading] = useState(true);
  const [isMount, setIsMount] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const [itemList, setItemList] = useState<any[]>([]); // 售后的商品列表
  const [flowList, setFlowList] = useState<any[]>([]); // 售后流列表
  const [statusObject] = useState<any>({
    '-1': { name: '审核不通过', img: FailImg },
    '1': { name: '等待商家处理', img: PendingImg },
    '2': { name: '商家已确认', img: SuccessImg },
    '3': { name: '等待商家收货', img: PendingImg },
    '4': { name: '商家已收货', img: SuccessImg },
    '5': { name: '商家已发货', img: SuccessImg },
    '6': { name: '已收货', img: SuccessImg },
    '0': { name: '已完成', img: SuccessImg }
  });
  const [type, setType] = useState(null); // 售后方式
  const [visibleStatus, setVisibleStatus] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const { id } = useRouter().params;

  useEffect(() => {
    afterSaleGet();
  }, []);

  useDidShow(() => {
    if (!isMount) return;
    afterSaleGet();
  });

  const afterSaleGet = async () => {
    try {
      const res = await api.afterSaleGet({ afterSaleOrderId: id });
      let data = res.data.data;
      for (let item of data.flowList) {
        if (item.imgUrl) {
          item.imgList = item.imgUrl.split(',');
        }
      }
      setDetail(data);
      setItemList(data.items);
      setFlowList(data.flowList);
      setType(data.serviceTypeValue);
      setIsMount(true);
      setPageLoading(false);
    } catch (err) {
      setIsMount(true);
      setPageLoading(false);
    }
  };

  // 换货确认收货
  const confirmReceiptTip = (id: string) => {
    Taro.showModal({
      title: '收货提示',
      content: '是否确认收货'
    }).then(res => {
      if (res.confirm) confirmReceipt(id);
    });
  };

  const confirmReceipt = async (id: string) => {
    await api.confirmReceipt({ id });
    afterSaleGet();
  };

  // 提交取消售后操作
  const sumbitCancel = async () => {
    if (!cancelReason) {
      util.showToast('请填写取消原因');
      return;
    }
    let params = {
      afterSaleOrderId: id,
      cancelReason
    };
    util.showLoading(true, '提交中');
    try {
      // type === 1 退货        type === 2 换货        退款
      const apiStr = type === 1 ? 'returnGoodsCancel' : type === 2 ? 'exchangeGoodsCancel' : 'refundCancel';
      await api[apiStr](params);

      // 更新售后信息显示
      afterSaleGet();
      setVisibleStatus(false);
      util.showLoading(false);
    } catch (error) {
      console.error('sumbitCancel error :', error);
    }
  };

  // 复制
  const onClipboardData = (type: string) => {
    Taro.setClipboardData({
      data: detail[type]
    });
  };

  // 预览大图
  const onPreviewImage = (index: number, imgIndex: number) => {
    let current = IMG_HOST + flowList[index].imgList[imgIndex];
    let urls = flowList[index].imgList.map((item: string) => IMG_HOST + item);
    Taro.previewImage({
      current,
      urls
    });
  };

  return (
    <View className='page-after-sale-detail'>
      <LoadingBox visible={pageLoading} />

      {detail.status && (
        <View className='status-wrapper'>
          <View className='status'>
            <Image className='status-img' src={statusObject[detail.statusValue].img} />
            <View className='status-text'>{detail.status}</View>
            {/* <View className="status-text">{flowList[0].title}</View> */}
          </View>
          {!(detail.statusValue === -1 || detail.statusValue === 0 || detail.statusValue === 5) && (
            <View className='action-btn' onClick={() => setVisibleStatus(true)}>
              取消售后
            </View>
          )}
        </View>
      )}
      <View className='progress-wrapper'>
        <View className='title'>{detail.serviceType}进度</View>
        <View className='progress-list'>
          {flowList.map((item, index) => {
            return (
              <View
                className={`timeline ${index === 0 ? 'active' : ''} ${index === flowList.length - 1 ? 'last' : ''}`}
                key={item.title + index}>
                <View className='timeline__line' />
                <View className='timeline__dot' />
                <View className='timeline__content'>
                  <View className='status'>{item.title}</View>
                  {item.content && <View className='desc'>{item.content}</View>}
                  {item.imgUrl && (
                    <View className='img-list'>
                      {item.imgList.map((imgItem: string, imgIndex: number) => {
                        return (
                          <View
                            className='img-list__item'
                            key={imgItem}
                            onClick={() => onPreviewImage(index, imgIndex)}>
                            <Image className='img-item' mode='aspectFit' src={IMG_HOST + imgItem} />
                          </View>
                        );
                      })}
                    </View>
                  )}
                  <View className='date-wrap'>
                    <View className='date'>{item.createTime}</View>
                    {/* 换货状态、是流程的第一行、需要买家上传快递单信息 */}
                    {type !== 3 && index === 0 && detail.statusValue === 2 && (
                      <View className='btn-wrapper'>
                        <View
                          className='btn primary'
                          onClick={() =>
                            util.navigateTo(`/pagesMall/after-sale/express-bill/index?afterSaleId=${detail.id}`)
                          }>
                          上传快递单
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
      {(type === 1 || type == 3) && (
        <View className='refund-amount'>
          <View className='title'>退款金额</View>
          {detail.refundAmount ? (
            <View className='content'>
              <Text>￥{util.filterPrice(detail.refundAmount)}</Text>
            </View>
          ) : (
            <View className='content desc'>
              <Text>暂无，等待商家处理</Text>
            </View>
          )}
        </View>
      )}
      <View className='product-list'>
        {itemList.map(item => {
          return (
            <View className='product-list__item' key={item.id}>
              <View
                className='cover'
                onClick={() => util.navigateTo(`/pagesMall/product-detail/index?id=${item.productId}`)}>
                <Image className='img' mode='aspectFill' src={IMG_HOST + item.icon} />
              </View>
              <View className='info'>
                <View className='name'>{item.name}</View>
                <View className='specs'>{item.spec}</View>
                <View className='price-qty'>
                  <View className='price'>￥{util.filterPrice(item.price)}</View>
                  <View className='qty'>x{item.quantity}</View>
                </View>
              </View>
            </View>
          );
        })}
      </View>
      <View className='order-info'>
        <View className='title'>售后信息</View>
        <View className='list-item'>
          <View>订单编号</View>
          <View>
            <Text className='m-r-1'>{detail.orderNumber}</Text>
            {process.env.TARO_ENV === 'weapp'
              ? detail.orderNumber && (
                  <Text className='copy-btn' onClick={() => onClipboardData('orderNumber')}>
                    复制
                  </Text>
                )
              : detail.orderNumber && (
                  <Text className='copy-btn' data-clipboard-text={detail.orderNumber}>
                    复制
                  </Text>
                )}
          </View>
        </View>
        <View className='list-item'>
          <View>售后单号</View>
          <View>
            <Text className='m-r-1'>{detail.number}</Text>
            {process.env.TARO_ENV === 'weapp'
              ? detail.number && (
                  <Text className='copy-btn' onClick={() => onClipboardData('number')}>
                    复制
                  </Text>
                )
              : detail.number && (
                  <Text className='copy-btn' data-clipboard-text={detail.number}>
                    复制
                  </Text>
                )}
          </View>
        </View>
        <View className='list-item'>
          <View>售后类型</View>
          <View>{detail.serviceType}</View>
        </View>
        <View className='list-item'>
          <View>原因</View>
          <View>{detail.reasonType}</View>
        </View>
      </View>
      {type === 2 && detail.status === 5 && (
        <View className='button-wrapper'>
          <Button className='primary-btn no-radius' onClick={() => confirmReceiptTip(detail.id)}>
            确认收货
          </Button>
        </View>
      )}
      <Dialog visible={visibleStatus} position='top' onClose={() => setVisibleStatus(false)}>
        <View className='dialog-container'>
          <View className='title'>温馨提示</View>
          <View className='desc'>当前售后未完成，是否确定取消？</View>
          <View className='input-wrap'>
            <Input
              type='text'
              placeholder='请填写取消原因'
              maxLength={64}
              value={cancelReason}
              onInput={e => setCancelReason(e.detail.value)}
            />
          </View>
          <View className='btn-wrap'>
            <View className='btn' onClick={() => setVisibleStatus(false)}>
              不了
            </View>
            <View className='btn confirm' onClick={sumbitCancel}>
              确定
            </View>
          </View>
        </View>
      </Dialog>
    </View>
  );
}

AfterSaleDetail.config = {
  navigationBarTitleText: '售后详情'
};
