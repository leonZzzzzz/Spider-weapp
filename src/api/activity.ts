import fetch from "@/utils/request";

//#region
/**
 * 活动分类接口
 * @param params
 */
export const categoryListByType = () => {
  return fetch.get("api/v1/category/listByType");
};
/**
 * 活动列表接口
 * @param params
 */
export const pageActivity = () => {
  return fetch.get("api/mall/v1/store/list");
};
/**
 * 活动详情接口
 * @param params
 */
export const getActivity = () => {
  return fetch.get("api/v1/activity/get");
};
// 活动详情
//  activityGet: params => fetch.get('/api/v1/activity/get', params, true),
//#endregion
