import fetch from "@/utils/request";

//#region
/**
 * 名片列表
 * @param params
 */
export const getCardList = () => {
  return fetch.get("api/v1/nameCard/getCurrent");
};
// 删除名片
export const deleteCard = (id) => {
  return fetch.post("api/v1/nameCard/delete", { id });
};
// 名片详情
export const getCardDetail = (id) => {
  return fetch.get("api/v1/nameCard/get", { id })
}
// 添加或更新名片
export const addcard = (params) => {
  return fetch.json("api/v1/nameCard/saveOrUpdate", params);
};
// 上传名片海报
export const uploadPoster = (params) => {
  return fetch.post("api/v1/nameCard/savePoster", params);
};

// 获取黄页信息
export const getyellowInfo = (id) => {
  return fetch.get("api/v1/yellowPage/get", { id });
};
// 保存黄页
export const upyellowPage = (params) => {
  return fetch.json("api/v1/yellowPage/saveOrUpdate", params);
};
// 当前名片浏览，关注，粉丝数
export const getNum = (nameCardId) => {
  return fetch.get("api/v1/nameCardFans/getInfoByNameCardId", { nameCardId });
};

// 查询名片
export const getcardpage = (specifyMemberId) => {
  return fetch.get("api/v1/nameCard/getByMemberId", { specifyMemberId });
};
//关注
export const pinkName = (params) => {
  return fetch.post("api/v1/nameCardFans/fans", params);
};
// 取消关注
export const unpinkName = (params) => {
  return fetch.post("api/v1/nameCardFans/remove", params);
};
// 我的关注
export const myPick = (type) => {
  return fetch.get("api/v1/nameCardFans/list", { type });
};
// 名片信息
export const cardSetting = (nameCardId) => {
  return fetch.get("api/v1/nameCardSetting/get", { nameCardId });
};
// 名片设置
export const updataSetting = (params) => {
  return fetch.json("api/v1/nameCardSetting/update", params);
};