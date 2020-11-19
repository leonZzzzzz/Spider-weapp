import Taro from '@tarojs/taro';
import { baseUrl } from '@/config';
console.log('服务器', baseUrl)
function request(url: string, data: any, method: string, contentType: string) {
  const options: any = {
    url: baseUrl + url,
    data,
    method,
    header: {
      'content-type': contentType
    }
  };
  return Taro.request(options);
}

export default {
  get(url: string, params?: any) {
    return request(url, params, 'GET', 'application/json');
  },
  post(url: string, params?: any) {
    return request(url, params, 'POST', 'application/x-www-form-urlencoded');
  },
  json(url: string, params?: any) {
    return request(url, params, 'POST', 'application/json');
  },

  uploadFile(url: string, temFilePath: string, formData: any, name: string = 'file') {
    return new Promise((resolve, reject) => {
      Taro.uploadFile({
        url: baseUrl + url,
        filePath: temFilePath,
        name,
        formData: formData
      })
        .then((res: any) => {
          if (typeof res.data === 'string') res.data = JSON.parse(res.data);
          if (res.data.code === 20000) {
            resolve(res);
          } else {
            this.showToast(res.data.message);
            reject(res);
          }
        })
        .catch(err => {
          console.log('uploadFile err ', err.data);
          reject(err);
        });
    });
  },

  // 支付
  requestPayment(params: any) {
    return new Promise((resolve, reject) => {
      Taro.requestPayment(params)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
};
