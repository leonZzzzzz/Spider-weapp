import '@tarojs/async-await';
import Taro, { Component, Config } from '@tarojs/taro';
import { response, needStoreIdRequest } from './utils/interceptors';
import checkAppUpdate from './utils/check-app-update';
import { Provider } from '@tarojs/redux';
import configStore from './store';
import Index from './pages/index';
const store = configStore();
import './app.scss';

Taro.addInterceptor(needStoreIdRequest);
Taro.addInterceptor(response);

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5') {
//   require('nerv-devtools')
// }
class App extends Component {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    pages: [
      'pages/custom/tabbar1',
      'pages/custom/tabbar2',
      'pages/activity/index',
      'pages/contacts/index',
      'pages/my/index',
      'pages/information/index',
      'pages/news/index',
      'pages/course/index',
      'pages/category/index',
      'pages/cart/index',
      'pages/group-product/index'
    ],
    subPackages: [
      {
        root: 'pagesCoWebs',
        pages: [
          'authorize/index',
          'activity/index/index',
          'activity/detail/index',
          'activity/detail-commission/index',
          'activity/join/index',
          'activity/sign/index',
          'activity/success/index',
          'activity/check/code/index',
          'activity/check/mobile/index',
          'activity/check/airborne/index',
          'course/index/index',
          'course/detail/index',
          'course/join/index',
          'course/success/index',
          'course/sign/index',
          'news/index/index',
          'news/detail/index',
          'my/card/index',
          'my/card-edit/index',
          'my/callCard-edit/index',
          'my/cardList/index',
          'my/self-poster/index',
          'my/myfocus/index',
          'my/setting/index',
          'my/yellow-page/index',
          'my/yellow-edit/index',
          'my/tag-edit/index',
          'my/company-pages/index',
          'my/my-activity/index',
          'my/my-course/index',
          'my/my-information/index',
          'my/coupon/index',
          'my/coupon/detail/index',
          'my/notice/index',
          'my/invite-poster/index',
          'my/follows/index',
          'my/order/index',
          'my/about/index',
          'my/point/index',
          'my/point-detail/index',
          'my/sign-in/index',
          'advanced-search/index',
          'information/index/index',
          'information/category/index',
          'information/relay/index',
          'information/relay-detail/index',
          'information/relay-sign/index',
          'information/release/index',
          'information/detail/index',
          'information/report/index',
          'contacts/index/index',
          'contacts/detail/index',
          'contacts/card-list/index',
          'contacts/search/index',
          'contacts/search-list/index',
          'contacts/class/index',
          'contacts/circle/index',
          'contacts/circle-detail/index',
          'survey/index/index',
          'survey/detail/index',
          'survey/result/index',
          'service/index',
          'membership/index/index',
          'membership/open/index',
          'integral/index/index',
          'integral/detailed/index',
          'donate/category/index',
          'donate/detail/index',
          'donate/result/index',
          'donate/roster/index',
          'donate/my-record/index',
          'donate/agreement/index',
        ]
      },
      {
        root: 'pagesCommon',
        pages: [
          'address/list/index',
          'address/edit/index',
          'channelTransfer/index',
          'authorize/index',
          'authorize-user/index',
          'test/index'
        ]
      },
      {
        root: 'pagesMall',
        pages: [
          'product/detail/index',
          'firend-help/detail/index',
          'firend-help/index/index',
          'group-product/index/index',
          'group-product/detail/index',
          'confirm-order/index',
          'join-group/index',
          'group-product-order/index',
          'help-order/index',
          'product-confirm/index',
          'order/list/index',
          'order/detail/index',
          'order/flow/index',
          'product-collection/index',
          'after-sales-order/index',
          'after-sale/detail/index',
          'after-sale/action/index',
          'after-sale/apply/index',
          'after-sale/express-bill/index',
          'after-sale/compensate/index',
          'after-sale/compensate/result/index',
          'evaluate/list/index',
          'evaluate/post/index',
          'wallet/index',
          'coupons/list/index',
          'coupons/my/index'
        ]
      },
      {
        root: 'pagesPromotion',
        pages: [
          'transfer/index',
          'distributer/index/index',
          'distributer/recruit/index',
          'distributer/rule/index',
          'distributer/account/index',
          'distributer/account-details/index',
          'distributer/customer/index',
          'distributer/team/index',
          'distributer/order/index',
          'distributer/invite-poster/index',
          'distributer/sales-poster/index',
          'sharer/index/index',
          'sharer/recruit/index',
          'sharer/rule/index',
          'sharer/account/index',
          'sharer/account-details/index',
          'sharer/customer/index',
          'sharer/team/index',
          'sharer/order/index',
          'sharer/invite-poster/index',
          'sharer/sales-poster/index',
          'sharer/accept-invite/index',
          'sharer/withdrawal-status/index'
        ]
      },
      {
        root: 'pagesXiaoetech',
        pages: [
          'course-vip/index/index',
          'course-vip/detail/index',
          'course-vip/success/index',
          'course-vip/save-poster/index',
          'resource/index'],
      }
    ],
    window: {
      backgroundColor: '#f3f3f3',
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#294A7B',
      navigationBarTitleText: '社群',
      navigationBarTextStyle: 'white'
    },
    tabBar: {
      selectedColor: '#294A7B',
      color: '#000',
      list: [
        {
          text: '首页',
          pagePath: 'pages/custom/tabbar1',
          iconPath: './images/tabbar/s1.png',
          selectedIconPath: './images/tabbar/s1s.png'
        },
        {
          text: '活动',
          pagePath: 'pages/activity/index',
          iconPath: './images/tabbar/s2.png',
          selectedIconPath: './images/tabbar/s2s.png'
        },
        // {
        //   text: '课程',
        //   pagePath: 'pages/course/index',
        //   iconPath: './images/tabbar/s3.png',
        //   selectedIconPath: './images/tabbar/s3s.png'
        // },
        {
          text: '新闻',
          pagePath: 'pages/news/index',
          iconPath: './images/tabbar/s3.png',
          selectedIconPath: './images/tabbar/s3s.png'
        },
        // {
        //   text: '论坛',
        //   pagePath: 'pages/information/index',
        //   iconPath: './images/tabbar/s2.png',
        //   selectedIconPath: './images/tabbar/s2s.png'
        // },
        {
          text: '通讯录',
          pagePath: 'pages/contacts/index',
          iconPath: './images/tabbar/s3.png',
          selectedIconPath: './images/tabbar/s3s.png'
        },
        // {
        //   text: '分类',
        //   pagePath: 'pages/category/index',
        //   iconPath: './images/tabbar/s1.png',
        //   selectedIconPath: './images/tabbar/s1s.png'
        // },
        // {
        //   text: '拼团',
        //   pagePath: 'pages/group-product/index',
        //   iconPath: './images/tabbar/s1.png',
        //   selectedIconPath: './images/tabbar/s1s.png'
        // },
        // {
        //   text: '购物车',
        //   pagePath: 'pages/cart/index',
        //   iconPath: './images/tabbar/s2.png',
        //   selectedIconPath: './images/tabbar/s2s.png'
        // },
        {
          text: '我的',
          pagePath: 'pages/my/index',
          iconPath: './images/tabbar/s4.png',
          selectedIconPath: './images/tabbar/s4s.png'
        }
      ]
    },
    navigateToMiniProgramAppIdList: ['wx60495fa9e76e85ef']
  };

  componentDidMount() {
    Taro.clearStorageSync();
    checkAppUpdate();
  }
  // 在 App 类中的 render() 函数没有实际作用
  render() {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    );
  }
}

Taro.render(<App />, document.getElementById('app'));
