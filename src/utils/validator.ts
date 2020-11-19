type Rule = {
  message: string;
  type: 'phone' | 'email' | 'min' | 'max';
  maxLength?: number;
  minLength?: number;
  value?: string;
};

const strategies = {
  isNonEmpty(value, errorMsg) {
    return value === '' ? errorMsg : undefined;
  },
  minLength(value, length, errorMsg) {
    return value.length < length ? errorMsg : undefined;
  },
  maxLength(value, length, errorMsg) {
    return value.length > length ? errorMsg : undefined;
  },
  isMoblie(value, errorMsg) {
    return !/^1(3|5|7|8|9)[0-9]{9}$/.test(value) ? errorMsg : undefined;
  },
  isEmail(value, errorMsg) {
    return !/^\w+([+-.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value) ? errorMsg : undefined;
  }
};

export default class Validator {
  private cache: Function[] = [];
  constructor() {}
  rule(value, rule) {
    rule.map((item: Rule) => {
      this.cache.push(() => {
        let keys = Object.keys(item);
        if (keys.indexOf('minLength') !== -1) {
          return strategies['minLength'](value, item['minLength'], item.message);
        } else if (keys.indexOf('maxLength') !== -1) {
          return strategies['maxLength'](value, item['maxLength'], item.message);
        } else {
          return strategies[item.type](value, item.message);
        }
      });
    });
  }
  validate() {
    for (let message of this.cache) {
      let msg = message();
      if (msg) {
        return msg;
      }
    }
  }
}
