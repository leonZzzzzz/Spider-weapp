import Taro, { useState, useEffect, useRouter } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './index.scss';

import { LoadingBox, LogoWrap } from '@/components/common';
import api from '@/api';
import util from '@/utils/util';

const statusObj = {
  ongoing: '处理中',
  fail: '失败',
  finish: '提现完成'
};

export default function Index() {
  const [pageLoading, setPageLoading] = useState(true);
  const [detail, setDetail] = useState<any>({});
  const { id } = useRouter().params;

  useEffect(() => {
    withdrawGet(id);
  }, []);

  const withdrawGet = async (id: string) => {
    const res = await api.withdrawGet({ id });
    setDetail(res.data.data);
    setPageLoading(false);
  };

  return (
    <View className='withdrawal-status'>
      <LoadingBox visible={pageLoading} />

      <View className='top-tip'>
        <Text className='qcfont qc-icon-zhuyi' />
        <Text>金额将提现至您的银行卡账号上，请注意查收</Text>
      </View>
      <View className='box'>
        <View className='success-status'>
          <View className='qcfont qc-icon-checked'></View>
          <View className='status-title'>提现成功</View>
          {/* <View className="status-info">提现金额将在**小时之后到账，感谢您的耐心等等~</View> */}
        </View>
        <View className='list'>
          <View className='cell'>
            <View className='label'>当前状态：</View>
            <View className={`${detail.status}`}>{statusObj[detail.status]}</View>
          </View>
          <View className='cell'>
            <View className='label'>提现金额：</View>
            <View className='price'>￥{util.filterPrice(detail.amount)}</View>
          </View>
          <View className='cell'>
            <View className='label'>收款账号：</View>
            <View>{detail.account}</View>
          </View>
          <View className='cell'>
            <View className='label'>收款姓名：</View>
            <View>{detail.name}</View>
          </View>
          <View className='cell'>
            <View className='label'>申请时间：</View>
            <View>{detail.createTime}</View>
          </View>
          <View className='cell'>
            <View className='label'>提现单号：</View>
            <View>{detail.number}</View>
          </View>
          {detail.poundage && (
            <View className='cell'>
              <View className='label'>手续费：</View>
              <View>{util.filterPrice(detail.poundage)}</View>
            </View>
          )}
          {detail.status === 'fail' && (
            <View className='cell'>
              <View className='label'>提现失败信息：</View>
              <View>{detail.transferFailMessage}</View>
            </View>
          )}
        </View>
      </View>
      <LogoWrap />
    </View>
  );
}

Index.config = {
  navigationBarTitleText: '提现成功'
};
