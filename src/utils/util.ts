/* 工具类函数 */
import Taro from '@tarojs/taro';
import api from '@/api/cowebs';
import dayjs from 'dayjs';

let Utils = {
  // 获取模板id
  async getWechatSubscribeId(type: string) {
    try {
      const res = await api.getWechatSubscribeId({ type });
      const data = res.data.data;
      return data.wxTemplateId || '';
    } catch (err) {
      console.error('getWechatSubscribeId error -------', err);
      return '';
    }
  },

  // 订阅消息
  async requestSubscribeMessage(type: string) {
    const wxTemplateId = await this.getWechatSubscribeId(type);
    console.log('wxTemplateId---', wxTemplateId);
    try {
      const res = await Taro.requestSubscribeMessage({
        tmplIds: [wxTemplateId || '']
      });
      console.log('订阅成功-------', res);
      if (res[wxTemplateId] === 'accept') {
        Taro.showToast({
          title: '订阅成功'
        });
        return Promise.resolve(res);
      } else if (res[wxTemplateId] === 'reject') {
        console.error('取消订阅-------', res);
        const resModel = await Taro.showModal({
          title: '提示',
          content: '您取消了订阅或永久关闭订阅，可在设置-订阅消息里重新打开。',
          confirmText: '去设置'
        });
        if (resModel.confirm) {
          Taro.openSetting();
        }
        return Promise.reject(res);
      }
    } catch (err) {
      console.error('订阅失败 error ------', err);
      // if (/switched off/.test(err.errMsg)) {
      const resModel = await Taro.showModal({
        title: '提示',
        content: '您关闭了接收订阅消息，可在设置-订阅消息里重新打开。',
        confirmText: '去设置'
      });
      if (resModel.confirm) {
        Taro.openSetting();
      }
      return Promise.reject(err);
      // }
    }
  },

  // 跳转
  navigateTo(url: string) {
    console.log(url)
    if (!url) {
      Taro.showToast({
        title: '页面地址不存在',
        icon: 'none'
      })
      return
    }
    Taro.navigateTo({ url }).catch(() => {
      Taro.switchTab({ url }).catch(() => {
        const [appId, path] = url.split(',');
        Taro.navigateToMiniProgram({ appId, path }).catch(err => {
          if (!/cancel/.test(err.errMsg)) {
            Taro.showToast({
              title: '页面地址错误',
              icon: 'none'
            });
          }
        });
      });
    });
  },

  // 验证账号
  checkAuthorize() {
    const memberId = Taro.getStorageSync('memberId');
    if (!memberId) {
      return true;
    }
    const memberInfo = Taro.getStorageSync('memberInfo');
    const _registerAudit = Taro.getStorageSync('registerAudit');
    if ((memberInfo.status === 2 || memberInfo.status === 3) && _registerAudit === 1) {
      return true;
    }
    if (memberInfo.isFrozen) {
      return true;
    }
    return false;
  },

  // 相册授权验证
  async checkAuthorizeWritePhotosAlbum() {
    try {
      const res = await Taro.getSetting();
      console.log('getSetting', res);
      if (!res.authSetting['scope.writePhotosAlbum']) {
        const modalRes = await Taro.showModal({
          title: '需要相册授权',
          content: '在设置中打开相册授权，才能保存图片到相册中',
          showCancel: true,
          cancelText: '取消',
          confirmText: '确定',
          confirmColor: '#294A7B'
        });
        if (modalRes.confirm) {
          Taro.openSetting();
        }
      } else {
        Taro.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        });
      }
    } catch (err) {
      console.error('getSetting error', err);
    }
  },

  toQueryPair(key: string, value: any) {
    if (typeof value == 'undefined') {
      return key;
    }
    return key + '=' + encodeURIComponent(value === null ? '' : String(value));
  },
  /**
   * 时间转换格式
   * @param time 接收参数 年月日 时分秒
   * @param unit 显示单位 目前支持 day 和 minute 默认是 day
   *  */ 
  formatDateStr(time: string, unit = 'day' ) {
    let timeStr = '';
    if (unit == 'day') {
      const now = dayjs().format('YYYY-MM-DD');
      const date1 = dayjs(now);
      const date2 = dayjs(time.substring(0, time.length - 9));
      const diffDay = date1.diff(date2, unit);
      if (diffDay === 0) {
        timeStr = '今天';
      } else if (diffDay === 1) {
        timeStr = '昨天';
      } else if (diffDay === 2) {
        timeStr = '前天';
      } else if (diffDay >= 3 && diffDay < 7) {
        timeStr = `${diffDay}天前`;
      } else if (diffDay >= 7 && diffDay <= 14) {
        timeStr = `1周前`;
      } else if (diffDay > 14) {
        const year1 = dayjs(date1).year();
        const year2 = dayjs(date2).year();
        if (year1 > year2) timeStr = dayjs(date2).format('YYYY-MM-DD');
        else timeStr = dayjs(date2).format('M月D日');
      }
    } else if (unit == 'minute') {
      const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const date1 = dayjs(now);
      const date2 = dayjs(time);
      const diffDay = date1.diff(date2, unit);
      if (diffDay <= 0) {
        timeStr = '刚刚';
      } else if (diffDay < 60) {
        timeStr =  `${diffDay}分钟前`;
      } else if (diffDay >= 60) {
        let hour = date1.diff(date2, 'hour');
        if (hour < 24) {
          timeStr =  `${hour}小时前`;
        } else {
          const year1 = dayjs(date1).year();
          const year2 = dayjs(date2).year();
          if (year1 > year2) timeStr = dayjs(date2).format('YYYY-MM-DD HH:mm');
          else timeStr = dayjs(date2).format('M月D日 HH:mm');
        }
      }
    }
    
    return timeStr;
  },
  // 对象转换为URL查询参数
  toQueryString(obj: any) {
    let ret: any[] = [];

    for (let key in obj) {
      key = encodeURIComponent(key);
      let values: any[] = obj[key];
      if (values && values.constructor == Array) {
        //数组
        let queryValues: any[] = [];
        for (let i = 0, len = values.length, value = ''; i < len; i++) {
          value = values[i];
          queryValues.push(this.toQueryPair(key, value));
        }
        ret = ret.concat(queryValues);
      } else {
        //字符串
        ret.push(this.toQueryPair(key, values));
      }
    }
    return ret.join('&');
  },

  /**
   * 格式化时间 yyyy-mm-dd hh:mm:ss
   */
  formatDate(date: any = new Date()): string {
    if (typeof date == 'string') {
      date = new Date(date);
    }
    return `${date.getFullYear()}-${date.getMonth() <= 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}-${
      date.getDate() <= 9 ? '0' + date.getDate() : date.getDate()
    }`;
  },
  getNowFormatDate() {
    var date = new Date();
    var seperator1 = '-';
    var seperator2 = ':';
    var month: number | string = date.getMonth() + 1;
    var strDate: number | string = date.getDate();
    var hour: number | string = date.getHours();
    var minutes: number | string = date.getMinutes();
    var seconds: number | string = date.getSeconds();
    if (month >= 1 && month <= 9) {
      month = '0' + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = '0' + strDate;
    }
    if (hour >= 0 && hour <= 9) {
      hour = '0' + hour;
    }
    if (minutes >= 0 && minutes <= 9) {
      minutes = '0' + minutes;
    }
    if (seconds >= 0 && seconds <= 9) {
      seconds = '0' + seconds;
    }

    var currentdate =
      date.getFullYear() +
      seperator1 +
      month +
      seperator1 +
      strDate +
      ' ' +
      hour +
      seperator2 +
      minutes +
      seperator2 +
      seconds;
    return currentdate;
  },

  /**
   * 生成id
   */
  getNewId(): string {
    let id = '';
    for (var i = 0; i < 8; i++) {
      id += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return id;
  },

  /** 数字金额大写转换(可以处理整数,小数,负数) */
  smalltoBIG(n: number) {
    var fraction = ['角', '分'];
    var digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    var unit = [
      ['元', '万', '亿'],
      ['', '拾', '佰', '仟']
    ];
    var head = n < 0 ? '欠' : '';
    n = Math.abs(n);

    var s = '';

    for (var i = 0; i < fraction.length; i++) {
      s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '');
    }
    s = s || '整';
    n = Math.floor(n);

    for (var i = 0; i < unit[0].length && n > 0; i++) {
      var p = '';
      for (var j = 0; j < unit[1].length && n > 0; j++) {
        p = digit[n % 10] + unit[1][j] + p;
        n = Math.floor(n / 10);
      }
      s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
    }
    return (
      head +
      s
        .replace(/(零.)*零元/, '元')
        .replace(/(零.)+/g, '零')
        .replace(/^整$/, '零元整')
    );
  },

  /**
   * 加
   */
  add(val1: number, val2: number) {
    let a = !isNaN(val1) ? val1 : 0;
    let b = !isNaN(val2) ? val2 : 0;
    return parseFloat((a + b).toPrecision(12));
  },
  /**
   * 减
   */
  subtr(val1: number, val2: number) {
    let a = !isNaN(val1) ? val1 : 0;
    let b = !isNaN(val2) ? val2 : 0;
    return parseFloat((a - b).toPrecision(12));
  },
  /**
   * 乘
   */
  mul(val1: number, val2: number) {
    let a = !isNaN(val1) ? val1 : 0;
    let b = !isNaN(val2) ? val2 : 0;
    return parseFloat((a * b).toPrecision(12));
  },
  /**
   * 除
   */
  chu(val1: number, val2: number) {
    let a = !isNaN(val1) ? val1 : 0;
    let b = !isNaN(val2) ? val2 : 0;
    return parseFloat((a / b).toPrecision(12));
  },
  /**
   * 金额分转元
   */
  filterPrice(val: any, i = 2) {
    if (val === '' || val === undefined || val === null || val === 0) return '0.00';
    let num = this.chu(val, 100).toFixed(i);
    // let num = (val / 100).toFixed(2)
    // 　num = parseFloat(num)
    // 　num = num.toLocaleString()
    return num;
  },

  formatCurrency(val: string | number, chu = true) {
    // if (val === '' || val === undefined || val === null || val === 0) return '0.00'
    if (val === '' || val === undefined || val === null || val === 0) return 0;
    // let reg: RegExp = /(\d)(?=(\d{3})+\.)/g
    let num = chu ? this.chu(val, 100) : val;
    // num = num.toFixed(2).replace(reg, '$&,')
    return num.toLocaleString();
  },
  getSum(values: any[], currency: boolean) {
    let total = values.reduce((prev, curr) => {
      return this.add(prev, curr);
    }, 0);
    if (currency) return this.formatCurrency(total);
    else return total;
  },
  toMoney(num: number | string) {
    if (num === '' || num === undefined || num === null || num === 0) return 0;
    num = Number(num).toFixed(2);
    num = parseFloat(num);
    num = num.toLocaleString();
    return num;
  },
  /**
   * 去重
   */
  uniq(array: any[], key: string): any[] {
    var temp: any[] = [];
    for (var i = 0; i < array.length; i++) {
      var flag = true;
      for (var j = 0; j < temp.length; j++) {
        if (array[i][key] == temp[j][key]) {
          flag = false;
        }
      }
      if (flag) temp.push(array[i]);
    }
    return temp;
  },

  /**
   * 正则验证手机号
   */
  checkPhone(phone: string) {
    const reg = /^1[3456789]\d{9}$/;
    return reg.test(phone);
  },
  /**
   * 正则验证身份证号
   */
  checkIDCard(idCard: string) {
    const reg = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/;
    return reg.test(idCard);
  },
  /**
   * 正则验证银行卡号
   */
  checkBankCardNumber(cardNumber: string) {
    const reg = /^([1-9]{1})(\d{15}|\d{18})$/;
    return reg.test(cardNumber);
  },

  // //是否具有下一页数据
  isHasNextPage(data: any, length?: number) {
    if (length) {
      const { pageSize, pageNum } = data;
      return pageSize * pageNum === length;
    } else {
      const { total, pageSize, pageNum } = data;
      const allSize = Math.ceil(total / pageSize);
      return pageNum < allSize;
    }
  },

  showToast(
    title: string,
    icon: 'success' | 'loading' | 'none' | undefined = 'none',
    duration: number = 2000,
    mask: boolean = false
  ) {
    Taro.showToast({
      title,
      icon,
      duration,
      mask
    });
  },

  showLoading(state: boolean, title: string = '正在加载中', mask: boolean = true) {
    if (state) {
      Taro.showLoading({
        title: title,
        mask: mask
      });
    } else {
      Taro.hideLoading();
    }
  },

  pageScrollTo(scrollTop: number = 0, duration: number = 0) {
    Taro.pageScrollTo({
      scrollTop,
      duration
    });
  },

  setNavigationBarTitle(title: string) {
    Taro.setNavigationBarTitle({
      title
    });
  }
};

export default Utils;
