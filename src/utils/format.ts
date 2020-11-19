/**
 * 金额转换，
 * 注意：大于等于一万就会在后面拼接上字符串“万”，所以不要用这个值去做数学运算
 * @param value 
 * @param cent 
 */
export const toPriceYuan = (value: number, cent: number = 2): string => {
  let price = value / 100;
  // if (price >= 10000) {
  //   price = price / 10000
  //   return price.toFixed(cent)+'万';
  // }
  return price.toFixed(cent);
};
