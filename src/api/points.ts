import fetch from '@/utils/request';

export default {
  // 获取积分规则
  pointsRuleGet: (params?: any) => fetch.get('api/v1/text-material/points-rule/get', params),
  // 总积分实时排行
  pointsRankRealtime: (params?: any) => fetch.get('api/v1/points-rank/realtime', params),
  // 我的总积分实时排名
  pointsRankMe: (params?: any) => fetch.get('api/v1/points-rank/me', params),
  // 积分明细
  pointsPage: (params?: any) => fetch.get('api/v1/points/page', params),
  informationShare: (params?: any) => fetch.post('api/v1/app/information/share', params),

  // 获取小程序名称
  getName: (params?: any) => fetch.get('/api/v1/wxApp/getName', params)
};
