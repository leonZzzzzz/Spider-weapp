import fetch from "@/utils/request";

/**
 * 获取购物车
 */
export const pageCart = () => {
  return fetch.get("api/mall/v1/cart/listOrderItem");
};
/**
 * 添加到购物车
 * @param {object} model
 */
export const addCart = (model: any) => {
  return fetch.post(`api/mall/v1/cart/addToCart`, model);
};
/**
 * 获取购物车数量
 */
export const getCartNum = () => {
  return fetch.get("api/mall/v1/cart/get");
};
/**
 * 添加购物车数量
 */
export const addCartNum = (id: string) => {
  return fetch.post("api/mall/v1/cart/add", {
    id
  });
};
/**
 * 减少购物车数量
 */
export const deducteCartNumber = (id: string) => {
  return fetch.post("api/mall/v1/cart/deducte", {
    id
  });
};
/**
 * 删除购物车
 */
export const deleteCart = (id: string) => {
  return fetch.post("api/mall/v1/cart/delete", {
    id
  });
};
