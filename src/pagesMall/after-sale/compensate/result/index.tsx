import Taro, { useState, useEffect, useRouter } from '@tarojs/taro';
import { View, Image, Button, Input } from '@tarojs/components';
import { Dialog, LoadingBox, ThemeView } from '@/components/common';
import util from '@/utils/util';
import api from '@/api/mall';
import { IMG_HOST } from '@/config';
import './index.scss';

export default function CompensateResult() {
  const [pageLoading, setPageLoading] = useState(true);
  const [compensationList, setCompensationList] = useState<any[]>([]);
  const [flowList, setFlowList] = useState<any[]>([]);
  const [cancelReason, setCancelReason] = useState(''); // 取消原因
  const [visibleStatus, setVisibleStatus] = useState(false);
  const [btnType, setBtnType] = useState('none'); // 底部按钮的类型 cancel none
  const { id, canApply } = useRouter().params;
  useEffect(() => {
    getOrderCompensationReasonType();
  }, []);

  // 查看订单赔付记录
  const getOrderCompensationReasonType = async () => {
    const res = await api.getOrderCompensationList({ orderId: id });
    const data = res.data.data;
    let flowList: any[] = [];
    let btnType = 'none';
    for (let d of data) {
      for (let f of d.flowList) {
        // 赔付状态流显示的内容
        let flowListItem: any = {
          title: f.title,
          createTime: f.createTime,
          image: f.image,
          // 记录显示的内容
          content: '',
          orderNumber: d.orderNumber,
          number: d.number
        };
        // 属于申请赔付
        if (f.statusValue.includes('apply')) {
          flowListItem.content += `订单单号：${d.orderNumber}\r\n`;
          flowListItem.content += `赔付单号：${d.number}\r\n`;
          flowListItem.content += `赔付金额：￥${d.applyAmount / 100}\r\n`;
          flowListItem.content += `赔付类型：${d.reasonType}\r\n`;
          if (d.reason) flowListItem.content += `赔付原因：${d.reason}\r\n`;
          if (f.image) flowListItem.imgList = f.image.split(',');
          flowListItem.statusValue = 'apply';
        } else if (f.statusValue.includes('cancel')) {
          if (f.content) flowListItem.content += `理由：${f.content}\r\n`;
          flowListItem.statusValue = 'cancel';
        } else if (f.statusValue.includes('agree')) {
          if (d.refundAmount) flowListItem.content += `赔付金额：￥${d.refundAmount / 100}\r\n`;
          flowListItem.statusValue = 'agree';
        }
        flowList.push(flowListItem);
      }
    }
    // 第一条的属于申请，则可以取消申请赔付
    if (flowList[0].statusValue === 'apply') {
      btnType = 'cancel';
    }
    setBtnType(btnType);
    setFlowList(flowList);
    setCompensationList(data);
    setPageLoading(false);
  };

  // 取消赔付
  const sumbitCancel = async () => {
    if (!cancelReason) {
      util.showToast('请填写取消原因');
      return;
    }
    const params = {
      id: compensationList[0].id,
      cancelReason
    };
    await api.cancelOrderCompensation(params);
    getOrderCompensationReasonType();
    setVisibleStatus(false);
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

  // 再次申请赔付
  const onRetryApply = () => {
    let url = `/pagesMall/after-sale/compensate/index?id=${id}`;
    util.navigateTo(url);
  };

  // 复制数据
  const onCopyData = (index: number) => {
    let item = flowList[index];
    let data = `订单单号：${item.orderNumber}；赔付单号：${item.number}`;
    Taro.setClipboardData({
      data
    });
  };

  return (
    <ThemeView>
      <View className='page-compensate-result'>
        <LoadingBox visible={pageLoading} />

        <View className='flow-list'>
          {flowList.map((item, index) => {
            return (
              <View
                className={`timeline ${index === 0 ? 'active' : ''} ${index === flowList.length - 1 ? 'last' : ''}`}
                key={item.title + index}>
                <View className='timeline__line' />
                <View className='timeline__dot' />
                <View className='timeline__content'>
                  <View className='status'>
                    <View>{item.title}</View>
                    {item.statusValue === 'apply' && (
                      <View className='copy' onClick={() => onCopyData(index)}>
                        复制单号
                      </View>
                    )}
                  </View>
                  {item.content && <View className='desc'>{item.content}</View>}
                  {item.statusValue === 'apply' && item.image && (
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
                  </View>
                </View>
              </View>
            );
          })}
        </View>
        <View className='btn-wrapper'>
          {btnType === 'cancel' && (
            <Button className='primary-btn no-radius' onClick={() => setVisibleStatus(true)}>
              取消赔付
            </Button>
          )}
          {canApply === 'yes' && btnType !== 'cancel' && (
            <Button className='primary-btn no-radius' onClick={onRetryApply}>
              再次申请赔付
            </Button>
          )}
        </View>
        <Dialog visible={visibleStatus} position='top' onClose={() => setVisibleStatus(false)}>
          <View className='dialog-container'>
            <View className='title'>温馨提示</View>
            <View className='desc'>是否确定取消赔付？</View>
            <View className='input-wrap'>
              <Input
                type='text'
                placeholder='请填写取消原因'
                value={cancelReason}
                maxLength={64}
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
    </ThemeView>
  );
}

CompensateResult.config = {
  navigationBarTitleText: '赔付详情'
};
