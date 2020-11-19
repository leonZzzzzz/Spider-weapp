import Taro from '@tarojs/taro';
import { getMenberStatus, checkVisitorStatus, updateMember, getMemberInfo, visitorLogin } from '@/api/common';

enum AuthorizeStatusName {
  // 正式会员
  Success = 'success',
  // 无需审核
  NotAudit = 'notAudit',
  // 需要审核
  NeedAudit = 'needAudit',
  // 等待审核
  AuditWait = 'auditWait',
  // 审核不通过
  AuditNotPass = 'auditNotPass',
  // 认证注册
  NeedAuthentication = 'needAuthentication'
}
// 当前会员的状态
export function authorizeStatus(): AuthorizeStatusName {
  const { openRegister, isNeedAudit, memberStatus } = Taro.getStorageSync('authorize');
  let status: AuthorizeStatusName = AuthorizeStatusName.Success;
  // 0 新建, 2 审核通过, -1 审核不通过, 1 待审核
  if (memberStatus && memberStatus === 2) {
    status = AuthorizeStatusName.Success;
  } else if (openRegister && !isNeedAudit) {
    status = AuthorizeStatusName.NotAudit;
  } else if (openRegister && isNeedAudit) {
    status = AuthorizeStatusName.NeedAudit;
  } else if (memberStatus && memberStatus === 1) {
    status = AuthorizeStatusName.AuditWait;
  } else if (memberStatus && memberStatus === -1) {
    status = AuthorizeStatusName.AuditNotPass;
  } else if (!openRegister && isNeedAudit) {
    status = AuthorizeStatusName.NeedAuthentication;
  }
  return status;
}

type ICheckAuthorize = {
  // 显示取消的按钮
  showCancel?: boolean;
  // 是否需要进行验证操作
  noValidation?: boolean;
  // 进行授权后，直接跳转到该链接
  path?: string;
  // 成功后的回调
  success?: Function;
};

// 检查会员的状态
export function checkAuthorize(options: ICheckAuthorize): void {
  const { showCancel = true, noValidation, path = '', success } = options;
  const authorize = Taro.getStorageSync('authorize') || {};
  getMenberStatus().then(res => {
    const memberStatus = res.data.data;
    authorize.memberStatus = memberStatus;
    Taro.setStorageSync('authorize', authorize);
    if (memberStatus == 2 || noValidation) {
      success && success();
    } else if (memberStatus === -1) {
      Taro.showToast({ title: '你的会员资料未能通过审核，请联系客服进行相关咨询。', icon: 'none', duration: 3000 });
    } else if (memberStatus === 1) {
      Taro.showToast({ title: '你的会员资料正在审核中...', icon: 'none', duration: 3000 });
    } else if (authorize.openRegister && authorize.isNeedAudit) {
      // 需要审核
      Taro.showModal({
        title: '温馨提示',
        content: '该操作需要认证你的用户信息。',
        showCancel: showCancel,
        cancelText: '暂不需要',
        confirmText: '立刻认证'
      }).then(res => {
        if (res.confirm) {
          Taro.navigateTo({ url: '/pagesCoWebs/authorize/index' });
        }
      });
    } else if (!authorize.openRegister && authorize.isNeedAudit) {
      // 需要认证
      Taro.showModal({
        title: '温馨提示',
        content: '该操作需要认证你的用户信息。',
        showCancel: showCancel,
        cancelText: '暂不需要',
        confirmText: '立刻认证'
      }).then(res => {
        if (res.confirm) {
          Taro.navigateTo({ url: `/pagesCoWebs/authorize/index${path ? '?path=' + path : ''}` });
        }
      });
    } else if (authorize.openRegister && !authorize.isNeedAudit) {
      // '开放注册'
      Taro.showModal({
        title: '温馨提示',
        content: '你需要注册才能进行该操作。',
        showCancel: showCancel,
        cancelText: '暂不需要',
        confirmText: '立刻注册'
      }).then(res => {
        if (res.confirm) {
          Taro.navigateTo({ url: `/pagesCommon/authorize/index${path ? '?path=' + path : ''}` });
        }
      });
    }
  });
}

/**
 * 验证是否可以做游客的操作
 */
export async function checkVisitor(e: any): Promise<any> {
  if (e.detail.userInfo) {
    const res = await checkVisitorStatus();
    const { isMember, headImage, appellation } = res.data.data;
    const data = { headImage: e.detail.userInfo.avatarUrl, appellation: e.detail.userInfo.nickName };
    if (isMember) {
      // 会员
      if (!headImage || !appellation) {
        // 更新会员数据
        await updateMember(data);
        const memberInfo = await getMemberInfo();
        Taro.setStorageSync('memberInfo', memberInfo.data.data);
      }
    }
    if (!isMember) {
      if (!headImage || !appellation) {
        // 更新游客数据
        await visitorLogin(data);
      }
    }
    return Promise.resolve();
  } else {
    return Promise.reject();
  }
}
