import fetch from '@/utils/request';

export const getProjectPage = (params?: any) => {
  return fetch.get('api/v1.0/layout-app-component/get', params);
};

export const getVideoDetail = (params?: any) => {
  return fetch.get('api/v1/vod/file/get', params);
};
