import fetch from '@/utils/request';

export default {
  // 获取分享的配置
  wechatShareConfig: (params?: any) => fetch.get('api/v1/wechat_share_config/get', params),
  // 获取模板id
  getWechatSubscribeId: (params?: any) => fetch.get('api/v1/wxMsgTemplate/getWechatSubscribeId', params),
  // 会员验证背景图
  AUTHENTICATE_BG: (params?: any) => fetch.get('api/v1/config/AUTHENTICATE_BG', params),
  // 会员审核背景图
  AUDIT_BG: (params?: any) => fetch.get('api/v1/config/AUDIT_BG', params),
  // 会员注册引导语
  GUIDE: (params?: any) => fetch.get('api/v1/config/GUIDE', params),
  // 是否需注册审核
  REGISTER_AUDIT: (params?: any) => fetch.get('api/v1/config/REGISTER_AUDIT', params),

  RELEASE_BY_COWEBS: (params?: any) => fetch.get('api/v1/config/RELEASE_BY_COWEBS', params),

  getAppCustomer: (params?: any) => fetch.get('api/v1/myConfig/getAppCustomer', params),
  // 查看
  getQchdAbout: (params?: any) => fetch.get('api/v1/qchdAbout/get', params),
  // 获取注册或者认证配置
  getCowebCheck: (params?: any) => fetch.get('api/coweb/v1/app/contatsSetting/getCowebCheck', params),
  // 校验字段
  validateField: (params?: any) => fetch.json('api/coweb/v1/app/contatsSetting/validateField', params),
  // 获取需要填写的字段
  validateFieldGet: (params?: any) => fetch.get('api/coweb/v1/app/contatsSetting/get', params),
  // 认证
  appLoginV2: (params?: any) => fetch.json('api/coweb/v2/app/login', params),
  // 注册
  register: (params?: any) => fetch.json('api/coweb/v2/app/register', params),
  // 问卷详情
  surveyGet: (params?: any) => fetch.get('api/v1/survey/get', params),
  // 问卷列表
  surveyPage: (params?: any) => fetch.get('api/v1/survey/page', params),
  // 提交问卷
  memberSurveySubmit: (params?: any) => fetch.json('api/v1/memberSurvey/submit', params),
  // 问卷结果
  surveyGetResult: (params?: any) => fetch.get('api/v1/survey/getResult', params),

  // 关于我们
  getAboutUs: (params?: any) => fetch.get('api/v1/myConfig/getAboutUs', params),
  // 我的订单
  myPayPage: (params?: any) => fetch.get('api/v1/myPay/page', params),
  // 我的页面菜单
  myMenu: (params?: any) => fetch.get('api/v1/miniProgram/myMenu/get', params),

  getMemberIdAndAppId: (params?: any) => fetch.get('api/v1/app/information/getMemberIdAndAppId', params),

  POSTER_TIPS1: (params?: any) => fetch.get('api/v1/config/POSTER_TIPS1', params),
  POSTER_TIPS2: (params?: any) => fetch.get('api/v1/config/POSTER_TIPS2', params),
  // 获取海报背景
  getBgUrl: (params?: any) => fetch.get('api/v1/poster/getBgUrl', params),
  // 获取小程序码
  getQRCode: (params?: any) => fetch.get('api/v1/poster/getQRCode', params),
  // 获取资讯小程序码
  getInformationQRCode: (params?: any) => fetch.get('/api/v1/app/information/getQRCode', params),
  // 资讯标题
  informationPageTitle: (params?: any) => fetch.get('api/v1/myConfig/informationPageTitle', params),
  // 分享帖子获得积分
  postSharePoint: (params?: any) => fetch.post('api/v1/app/information/share', params),
  // 分享课程获得积分
  postSharecourse: (id?: any) => fetch.post('api/v1/course/share', { id }),

  // 获取个人资料
  contactsGet: (params?: any) => fetch.get('api/v1/contacts/get', params),
  // 查看个人信息
  getMemberInfo: (params?: any) => fetch.get('api/v1/wechatMember/memberInfo', params),

  // 首页模块
  homeResponse: (params?: any) => fetch.get('api/v1/homeResponse/page', params),
  // 首页搜索
  homeResponseSearch: (params?: any) => fetch.get('api/v1/homeResponse/search', params),
  // 首页logo
  cowebLogo: (params?: any) => fetch.get('api/v1/config/coweb_m_logo', params),
  // 报名成功页图片
  activitySignSuccess: (params?: any) => fetch.get('api/v1/config/activity_sign_success', params),
  // 报名成功二维码凭证
  getSignQRcode: (params?: any) => fetch.get('api/v1/activitySign/getSignQRcode', params),

  // 获取验证方式配置
  verifyTypeGet: (params?: any) => fetch.get('api/v1/verifyType/get', params),
  // 获取专业
  // professionGet: (params?: any) => fetch.get('api/v1/profession/get', params),
  // 查询教学项目
  professionList: (params?: any) => fetch.get('api/v1/profession/list', params),
  // 验证校友
  beforeLogin: (params?: any) => fetch.get('api/v1/app/beforeLogin', params),
  // 解密手机号
  decryptPhone: (params?: any) => fetch.post('api/v1/app/decryptPhone', params),
  // 登录
  appLogin: (params?: any) => fetch.post('api/v1/app/login', params),
  memberLogin: (params?: any) => fetch.post('api/v1/member/login', params),

  // 活动
  activityPage: (params?: any) => fetch.get('api/v1/activity/page', params),
  activityPageByIds: (params?: any) => fetch.get('api/v1/activity/getIds', params),
  // 活动详情
  activityGet: (params?: any) => fetch.get('api/v1/activity/get', params),
  getSharePoint: (params?: any) => fetch.post('api/v1/activity/share', params),
  // 活动报名
  activitySignOld: (params?: any) => fetch.json('api/v1/activitySign/sign', params),
  activitySign: (params?: any) => fetch.json('api/v1/activitySign/sign', params),
  // 取消报名
  activitySignCancel: (params?: any) => fetch.post('api/v1/activitySign/cancel', params),

  // 报名列表
  activitySignMembers: (params?: any) => fetch.get('api/v1/activitySign/signMembers', params),
  // 接龙报名列表
  myActivitySign: (params?: any) => fetch.get('api/v1/myActivitySign/signMembers', params),

  // 我报名的活动个数
  activityNum: (params?: any) => fetch.get('api/v1/my/activityNum', params),
  // 我报名的活动列表
  signActivityPage: (params?: any) => fetch.get('api/v1/activity/signActivityPage', params),
  // 报名支付订单
  activityPay: (params?: any) => fetch.post('api/v1/pay', params),
  // 发起支付
  requestPayment: (params?: any) => fetch.requestPayment(params),
  // 积分支付
  pointstatuspay: (signId) => fetch.post('api/v1/activity-sign/point-pay', { signId }),
  /**
   * 获取签到信息
   * 接口文档：
   * @param {object} params
   */
  checkInfoGet: (params: any) => fetch.get('api/v1/activityCheckin/getCheckData', params),

  /**
   * 保存签到信息
   * 接口文档：
   */
  checkSave: (params: any) => fetch.post('api/v1/activityCheckin/checkin', params),

  // 获取通讯录
  getContactsList: (params?: any) => fetch.get('api/v1/contacts/list', params),

  // 新闻
  singleContentPage: (params?: any) => fetch.get('api/v1/singleContent/page', params),
  // 新闻
  singleContentPageByIds: (params?: any) => fetch.get('api/v1/singleContent/ids', params),
  // 新闻详情
  singleContentGet: (params?: any) => fetch.get('api/coweb/v1/singleContent/get', params),
  // 课程
  coursePage: (params?: any) => fetch.get('api/v1/course/page', params),
  // 课程详情
  courseGet: (params?: any) => fetch.get('api/v1/course/get', params),
  // 课程报名
  courseSignTemp: (params?: any) => fetch.json('api/v1/courseSign/sign', params),
  // 课程报名列表
  courseMemberBySign: (params?: any) => fetch.get('api/v1/courseSign/signMembers', params),
  // 我的课程
  signCoursePage: (params?: any) => fetch.get('api/v1/course/signCoursePage', params),

  // 获取分类
  categoryListByType: (params?: any) => fetch.get('api/v1/category/listByType', params),
  listByTypeAndAppId: (params?: any) => fetch.get('api/v1/category/listByTypeAndAppId', params),

  // 获取资讯发布类型
  informationTypeGet: (params?: any) => fetch.get('api/v1/informationType/get', params),
  // 资讯
  informationPage: (params?: any) => fetch.get('api/v1/app/information/page', params),
  informationPages: (params?: any) => fetch.get('api/v1/app/information/pages', params),
  // 资讯详情
  informationGet: (params?: any) => fetch.get('api/v1/app/information/get', params),
  // 发布资讯
  informationSave: (params?: any) => fetch.post('api/v1/app/information/save', params),
  // 更新资讯
  informationUpdate: (params?: any) => fetch.post('api/v1/app/information/update', params),
  // 删除资讯
  informationDelete: (params?: any) => fetch.post('api/v1/app/information/delete', params),
  // 参与资讯
  informationJoined: (params?: any) => fetch.get('api/v1/app/information/joined', params),

  // 商品分页列表
  productPage: (params?: any) => fetch.get('api/mall/v1/uniteProduct/page', params),

  // 上传图片
  uploadImg: (tempFilePath: any, params: any) =>
    fetch.uploadFile('api/v1/attachments/images/tencent_cloud', tempFilePath, params),
  // 上传文件
  uploadFile: (tempFilePath: any, params: any) =>
    fetch.uploadFile('api/v1/attachments/images/tencent_cloud', tempFilePath, params),

  // 获取行业
  getConfigTrade: (params?: any) => fetch.get('api/v1/config/trade', params),

  // 获取会话sessionId
  getSessionByProgram: (params?: any) => fetch.post('api/v1/member/getSessionByProgram', params),
  // 直接登录
  directLogin: (params?: any) => fetch.post('api/v1/app/isDirectLogin', params),
  // 老用户登录
  relogin: (params?: any) => fetch.post('api/v1/app/relogin', params),
  // 游客登录
  visitorsLogin: (params?: any) => fetch.post('api/v1/app/visitorsLogin', params),

  // 更新个人资料
  contactsUpdate: (params?: any) => fetch.post('api/v1/contacts/update', params),

  // 通讯录统计
  contactsStatistics: (params?: any) => fetch.get('api/v1/contacts/statistics', params),
  // 获取行业和班级
  getConfigList: (params?: any) => fetch.get('api/v1/memberConfig/getConfigList', params),
  // 获取班级信息
  getClassInfo: (params?: any) => fetch.get('api/v1/class/info', params),
  // 获取通讯录排行
  classRank: (params?: any) => fetch.get('api/v1/class/rank', params),
  // 获取热门城市
  hotCityGet: (params?: any) => fetch.get('api/v1/hotCity/get', params),

  // 校友优惠
  welfarePage: (params?: any) => fetch.get('api/v1/welfare/page', params),
  // 优惠详情
  welfareGet: (params?: any) => fetch.get('api/v1/welfare/get', params),

  // 轮播图
  attachmentList: (params?: any) => fetch.get('api/v1/attachment/list', params),

  // 举报选项
  getReportOptions: (params?: any) => fetch.get('api/v1/informationReport/getReportOptions', params),
  // 举报
  informationReportSave: (params?: any) => fetch.post('api/v1/informationReport/save', params),

  // 验证码
  validateCode: (params?: any) => fetch.post('api/v1/app/validateCode', params),
  // 查询学号
  contactsGetStuId: (params?: any) => fetch.get('api/v1/contacts/getStuId', params),

  // 留言列表
  commentPage: (params?: any) => fetch.get('api/coweb/v1/app/comment/page', params),

  // 留言
  commentInsert: (params?: any) => fetch.post('api/coweb/v1/app/comment/insert', params),
  // 删除留言
  commentDelete: (params?: any) => fetch.post('api/coweb/v1/app/comment/delete', params),
  // 点赞
  praiseInsert: (params?: any) => fetch.post('api/coweb/v1/app/praise/insert', params),
  // 取消点赞
  praiseDelete: (params?: any) => fetch.post('api/coweb/v1/app/praise/delete', params),
  // 记录分享
  shareInsert: (params?: any) => fetch.post('api/coweb/v1/share/insert', params),
  // 小程序码
  qrcodeGet: (params?: any) => fetch.get('api/v1/app/qrcode/get', params),

  // 发布接龙
  myActivityInsert: (params?: any) => fetch.json('api/v1/myActivity/insert', params),

  // 根据资讯id获取点赞数等
  sourceDataGet: (params?: any) => fetch.get('api/v1/app/information/getSourceData', params),
  // 会费记录
  membershipRecordGet: (params?: any) => fetch.get('api/v1/membershipRecord/get', params),
  // 获取tips
  privilegeStrGet: (params?: any) => fetch.get('api/v1/privilegeStr/get', params),

  // 协议
  agreementPage: (params?: any) => fetch.get('api/v1/agreement/register', params),
  // 协议详情
  agreementGet: (params?: any) => fetch.get('api/v1/agreement/get', params),

  registerExplainPage: (params?: any) => fetch.get('api/v1/agreement/registerExplain', params),

  // 实名认证
  checkRealName: (params?: any) => fetch.post('api/v1/app/checkRealName', params),
  // 更新校友手机号
  changeMobile: (params?: any) => fetch.get('api/v1/app/changeMobile', params),

  // 开通年费
  membershipOrder: (params?: any) => fetch.post('api/v1/membershipOrder/pay', params),
  // 个性标签 系统标签列表
  pagePersonalityTag: (params?: any) => fetch.get('api/v1/personality-label-template/page', params),
  // 个性标签 已有签列表
  myPersonalityTag: (params?: any) => fetch.get('api/v1/personality-label/page', params),
  // 个性标签 添加标签
  addPersonalityTag: (params?: any) => fetch.post('api/v1/personality-label/insert-by-template', params),
  // 个性标签 删除标签
  delPersonalityTag: (params?: any) => fetch.post('api/v1/personality-label/delete', params),

  // 获取分享码
  getWxQRCode: (params?: any) => fetch.get('api/v1/wxQRCode/get', params),
  // 查询分享码参数
  sceneWxQRCode: (params?: any) => fetch.get('api/v1/wxQRCode/scene', params),
  // 图文触底调用
  readPoint: (id) => fetch.post('api/v1/single-content/read', { id }),
  // 积分实时排行
  pointRank: (quantity, includeMyRank) => fetch.get('api/v1.1/total-point-rank', { quantity, includeMyRank }),
  // 我的积分
  myPointRank: () => fetch.get('api/v1/points-rank/me'),
  // 积分规则
  pointRules: () => fetch.get('api/v1/text-material/points-rule/get'),
  // 我的积分列表
  myPointRules: (params) => fetch.get('api/v1/points/pageFlow', params),
  // 我的总积分
  pointTotal: () => fetch.get('api/v1/points/get'),
  // 查询今日打卡状态
  punchStatus: () => fetch.get('api/v1/daily-sign-in/status'),
  // 打卡
  punchClock: () => fetch.post('api/v1/daily-sign-in/insert'),
  // 积分排行
  pointAmong: (params) => fetch.get('api/v1.1/increment-point-rank', params),
  // 获取个人资料必填项
  personalProfile: () => fetch.get('api/v1/contacts-setting/profile')
};

