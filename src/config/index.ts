import Taro from '@tarojs/taro';

const { config }: any = Taro.getExtConfigSync();

export const baseUrl: string = config.baseUrl;
export const IMG_HOST: string = config.IMG_HOST;
export const HOME_PATH: string = config.HOME_PATH;
// export const baseUrl: string = 'http://x.wego168.com/cowebs/';
// export const IMG_HOST: string = 'https://athena-1255600302.cosgz.myqcloud.com';
// export const HOME_PATH: string = 'pages/custom/tabbar1';
// "extAppid": "wx61388975ab1695f9",

export const APPID: string = 'wx60495fa9e76e85ef';
// export const APPID: string = 'wx8aef531b02f5176e'; // 老还童
// export const APPID: string = 'wxaacb305cb7c84593';
// export const APPID: string = 'wx60495fa9e76e85ef wx6f2807283cb98129' wx1cedac508a614e38 wx36e1295541a69032
export const filterApiUrl: any[] = [
  {
    url: 'v1/share/insert'
  },
  {
    url: 'v1/sharer/get'
  }
  // {
  //   url: 'api/v1/contacts/get',
  // },
];
