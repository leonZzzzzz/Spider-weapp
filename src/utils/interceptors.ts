import Taro, { Chain } from '@tarojs/taro';
import { authorize, getMemberInfo } from '@/api/common';
import { pageStore } from '@/api/store';
import { baseUrl, filterApiUrl } from '@/config';
import api from '@/api/cowebs';

let retries: any = [];
const maxRetry = 5;

let isContactsGetApi = false;
let isAuthorize = false;
let isConfig = false;

const getConfigData = async () => {
  try {
    // 获取注册或者认证配置
    // if (!Taro.getStorageSync('verifyType')) {
    //   const res: any = await api.getCowebCheck();
    //   Taro.setStorageSync('verifyType', Number(res.data.data.value));
    // }

    // 获取分享配置
    if (!Taro.getStorageSync('shareConfig')) {
      const res: any = await api.wechatShareConfig({ code: 'coweb' });
      Taro.setStorageSync('shareConfig', res.data.data ? res.data.data : {});
    }

    // 跳转cowebs 1：跳转
    if (!Taro.getStorageSync('releaseValue')) {
      const res: any = await api.RELEASE_BY_COWEBS();
      Taro.setStorageSync('releaseValue', Number(res.data.data ? res.data.data.value : 0));
    }

    // 是否需注册审核 1：审核
    if (!Taro.getStorageSync('registerAudit')) {
      const res: any = await api.REGISTER_AUDIT();
      const value = Number(res.data.data ? res.data.data.value : 0);
      Taro.setStorageSync('registerAudit', value);
      if (value === 1) {
        const resAuditBg: any = await api.AUDIT_BG();
        const data = resAuditBg.data.data;
        if (data && data.value) {
          Taro.setStorageSync('auditBg', data.value);
        }
      }
    }
  } catch (err) {
    isConfig = false;
  }
};

// 获取个人资料
const contactsGet = async () => {
  try {
    const res: any = await api.contactsGet();
    const data = res.data.data;
    // data.status = 3
    // data.isFrozen = true
    Taro.setStorageSync('memberInfo', data);
    if (!data) {
      const resGUIDE = await api.GUIDE();
      Taro.setStorageSync('guide', resGUIDE.data.data ? resGUIDE.data.data.value : '');
    }
  } catch (err) {
    Taro.setStorageSync('memberInfo', {});
    console.error('interceptors 获取个人资料', err);
    const resGUIDE = await api.GUIDE();
    Taro.setStorageSync('guide', resGUIDE.data.data ? resGUIDE.data.data.value : '');
  }
};

// 是否需要 storeId
export const needStoreIdRequest = async function (chain: Chain) {
  const data = chain.requestParams.data;
  if (data && 'storeId' in data) {
    let storeId = Taro.getStorageSync('storeId');
    if (storeId) {
      data.storeId = storeId;
      return chain.proceed(chain.requestParams).then((res: any) => {
        return res;
      });
    } else {
      const result = await pageStore();
      storeId = result.data.data[0].id;
      data.storeId = storeId;
      Taro.setStorageSync('storeId', storeId);
      return chain.proceed(chain.requestParams).then((res: any) => {
        return res;
      });
    }
  } else {
    return chain.proceed(chain.requestParams).then((res: any) => {
      return res;
    });
  }
};

const awaitAuthorize = () => {
  // console.log('awaitAuthorize')
  return new Promise(async function body(resolve, reject) {
    if (!Taro.getStorageSync('authorize').sessionId) {
      setTimeout(() => {
        body(resolve, reject);
      }, 100);
    } else {
      isAuthorize = false;
      resolve(true);
    }
  });
};

// 处理会话过期后，自动请求上次的数据
const authorizeAndRequest = async () => {
  isAuthorize = true;
  if (Taro.getStorageSync('authorize').sessionId) return;
  //重新授权
  const resCode = await Taro.login();
  const res = await authorize({ code: resCode.code, serviceType: 3 });
  const data = res.data.data;
  Taro.setStorageSync('openId', data.openId || '');
  const { sessionId, memberId, openRegister, isNeedAudit, memberStatus } = res.data.data;
  Taro.setStorageSync('authorize', { sessionId, memberId, openRegister, isNeedAudit, memberStatus });
  if (memberId) {
    const user = (await getMemberInfo()) as any;
    Taro.setStorageSync('memberInfo', user.data.data);
  } else {
    Taro.removeStorageSync('memberInfo');
  }
  isAuthorize = false;
};

// 响应拦截
export const response = async function (chain: any) {
  const { url, method, data, header } = chain.requestParams;
  // console.log('提交数据', url.replace(baseUrl, ''), data);
  if (/member\/authorize/.test(url)) {
    return chain.proceed(chain.requestParams).then((res: any) => {
      console.log('proceed', res.data);
      if (res.data.code === 20000) {
        return Promise.resolve(res);
      } else {
        // 显示报错的信息
        Taro.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 2000
        });
        return Promise.reject(res);
      }
    });
  }
  const { sessionId } = Taro.getStorageSync('authorize');
  if (sessionId) {
    chain.requestParams.header.WPGSESSID = sessionId;
  } else {
    if (isAuthorize) {
      await awaitAuthorize();
    } else {
      await authorizeAndRequest();
    }
    chain.requestParams.header.WPGSESSID = Taro.getStorageSync('authorize').sessionId;
  }

  // if (!isContactsGetApi) {
  //   isContactsGetApi = true;
  //   contactsGet();
  // }

  if (!isConfig) {
    isConfig = true;
    getConfigData();
  }

  return chain
    .proceed(chain.requestParams)
    .then((res: any) => {
      // Taro.hideLoading();
      let apiUrl = url.replace(baseUrl, '');
      console.log(apiUrl, data || {}, res.data);
      if (!retries || retries === undefined) retries = [];
      if (apiUrl === 'api/v1/member/login') {
        if (res.data.code === 20000) {
          // 链接是登录，更新一下授权的状态
          const { isNeedAudit, memberId, memberStatus, openRegister } = res.data.data;
          let obj: any = { isNeedAudit, memberId, memberStatus, openRegister };
          obj.sessionId = sessionId;
          Taro.setStorageSync('authorize', obj);
          return Promise.resolve(res);
        } else {
          // 显示报错的信息
          Taro.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          });
          return Promise.reject(res);
        }
      } else if (res.data.code === 20000) {
        if (retries[apiUrl]) {
          retries[apiUrl] = 0;
        }
        return Promise.resolve(res);
      } else {
        if (/distributer\/scan\-bind/.test(apiUrl)) {
          console.log('distributer/scan-bind：' + res.data.message);
          return Promise.reject(res);
        }
        if (/api\/v1\/contacts\/get/.test(apiUrl) && res.data.code === 40001) {
          Taro.removeStorageSync('memberId');
        }
        let flag = false;
        if (filterApiUrl && filterApiUrl.length) {
          for (let i = 0; i < filterApiUrl.length; i++) {
            let urlReg = new RegExp(filterApiUrl[i].url);
            if (urlReg.test(apiUrl)) {
              flag = true;
            }
          }
        }
        if (flag) {
          console.log('过滤');
          if (retries[apiUrl]) {
            retries[apiUrl] = 0;
          }
          return Promise.resolve(res);
        } else if (res.data.code === 63020) {
          // 会话过期
          Taro.removeStorageSync('authorize');
          if (!retries[apiUrl]) {
            retries[apiUrl] = 1;
          }
          if (retries[apiUrl] < maxRetry) {
            console.log('retries', retries[apiUrl]);
            retries[apiUrl]++;
            return Taro.request({ url, data, method, header });
          } else {
            // 显示报错的信息
            Taro.showToast({ title: res.data.message, icon: 'none', duration: 2000 });
            return Promise.reject(res);
          }
        } else if (res.data.code === 63021 || res.data.code === 10000) {
          console.warn('用户未注册');
          if (!Taro.getStorageSync('isAuthorizePage')) {
            Taro.navigateTo({ url: '/pagesCommon/authorize/index' });
            Taro.setStorageSync('isAuthorizePage', true);
          }
          return Promise.reject(res);
        } else if (res.data.code === 63025) {
          console.warn('用户未认证');
          Taro.navigateTo({ url: '/pagesCoWebs/authorize/index' });
          return Promise.reject(res);
        } else if (res.data.code === 63026) {
          console.warn('用户待审核');
          return Promise.reject(res);
        } else if (res.data.code === 63027) {
          console.warn('用户审核未通过');
          return Promise.reject(res);
        } else {
          Taro.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          });
          return Promise.reject(res);
        }
      }
    })
    .catch((err: any) => {
      console.error('chain.proceed', err);
      return Promise.reject(err);
    });
};
