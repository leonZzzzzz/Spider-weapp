import fetch from '@/utils/request';

/**
 * 获取渠道码
 */
export const getChannelQrcode = (params: any) => {
  return fetch.get('api/v1/channel-qrcode/get', params);
};
// 获取渠道码绑定页面
export const getprogramQrcode = (params: any) => {
  return fetch.get('api/v1/mini-program-page/get', params);
};
