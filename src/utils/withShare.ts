import Taro from '@tarojs/taro';
import { HOME_PATH, IMG_HOST } from '@/config';
import api from '@/api/index';

function withShare(opts: any = {}) {
  console.log(99999999)
  const activityshare = Taro.getStorageSync('activityshare');
  if (activityshare.type == 'activity') {
    getSharePoint(activityshare.id)
  }
  const openId = Taro.getStorageSync('openId');
  const memberInfo = Taro.getStorageSync('memberInfo');
  console.log('withShare memberInfo', memberInfo);
  const shareConfig = Taro.getStorageSync('shareConfig');
  let shareTitle = '';
  if (shareConfig && shareConfig.title) {
    shareTitle = shareConfig.title.replace('%s', memberInfo.name || '');
  }
  const defaultTitle = shareTitle || `${memberInfo.name || ''}正在邀请您加入社群小程序，马上体验吧~`;
  const defaultPath = HOME_PATH;
  const defaultImageUrl = IMG_HOST + shareConfig.image || '';

  let { title, imageUrl, path = null } = opts;

  if (!path) {
    path = defaultPath;
  }
  const sharePath = new UrlParams(path)
    .append('shareMemberId', memberInfo.id)
    .append('shareOpenId', openId)
    .getUrl();

  // let sharePath = `${path}${memberInfo ? `${/\?/.test(path) ? '&' : '?'}shareMemberId=${memberInfo.id}` : ''}${
  //   openId ? `${/\?/.test(path) ? '&' : '?'}shareOpenId=${openId}` : ''
  // }`;

  const params = {
    title: title || defaultTitle,
    path: sharePath,
    imageUrl: imageUrl || defaultImageUrl
  };
  console.log('share params', params);
  return params;
}
// 分享获取积分
const getSharePoint = async (id) => {
  var params = { id }
  const res = await api.getSharePoint(params)
  if (res.data.code == 20000) {
    if (res.data.data >= 0) {
      if (res.data.data > 0) {
        Taro.showToast({
          title: `+${res.data.data}积分`,
          icon: 'none'
        })
      }
    } else {
      Taro.showToast({
        title: res.data.message,
        icon: 'none'
      })
    }
  }
};
class UrlParams {
  public urls: string;
  constructor(urls) {
    this.urls = urls;
  }
  append(key, value) {
    const mark = /\?/.test(this.urls) ? '&' : '?';
    this.urls += `${mark}${key}=${value || ''}`;
    return this;
  }
  getUrl() {
    return this.urls;
  }
}

// function UrlParams(url) {
//   if (this instanceof UrlParams) {
//     this.url = url;
//   } else {
//     return new UrlParams(url);
//   }
// }
// UrlParams.prototype.append = function(key, value) {
//   if (/\?/.test(this.url)) {
//     this.url += `&${key}=${value || ''}`;
//   } else {
//     this.url += `?${key}=${value || ''}`;
//   }
//   return this;
// };
// UrlParams.prototype.getUrl = function(): string {
//   return this.url;
// };

export default withShare;
