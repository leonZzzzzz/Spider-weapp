import fetch from "@/utils/request";

//#region
/**
 * 门店列表接口
 * @param params
 */
export const pageStore = () => {
  return fetch.get("api/mall/v1/store/list");
};
//#endregion
