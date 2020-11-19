import '@tarojs/async-await';
import Taro, { Component, Config } from '@tarojs/taro';
import { response, needStoreIdRequest } from './utils/interceptors';
import { authorize } from './api/common';
import checkAppUpdate from './utils/check-app-update';
import Index from './pages/index';
import './app.scss';

import { Provider } from '@tarojs/redux'
import configStore from './store'
const store = configStore()

Taro.addInterceptor(needStoreIdRequest);
Taro.addInterceptor(response);

class App extends Component {
  config: Config = {
      ${pages},
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
          	'membership/open/index'
					]
				},
				{
					root: 'pagesCommon',
					pages: [
						'address/list/index',
						'address/edit/index',
						'channelTransfer/index',
						'authorize/index',
						'authorize-user/index'
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
						'product-detail/index',
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
						'wallet/index'
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
				}
			],
		navigateToMiniProgramAppIdList: [
		  'wx60495fa9e76e85ef'
		],
      ${window},
      ${tabBar}
  }
  
  componentDidMount() {
    Taro.clearStorageSync()
    // Taro.login().then(code => {
    //   authorize({ code: code.code }).then(res => {
    //     const { memberId,  sessionId } = res.data.data;
    //     Taro.setStorageSync('memberId', memberId);
    //     Taro.setStorageSync('sessionId', sessionId);
    //   });
    // });
    checkAppUpdate();
  }
  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  // render() {
  //   return <Index />;
	// }
	render() {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById('app'));

