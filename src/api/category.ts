import fetch from '@/utils/request'
/**
 * 获取父分类
 */
export function getCategorys(parentId: string = '') {
  return fetch.get('api/v1/category/listByTypeAndParentId', {
    type: 1,
    parentId
  })
}
