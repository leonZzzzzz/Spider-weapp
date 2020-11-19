// 配置文档https://prettier.io/docs/en/options.html

module.exports = {
  trailingComma: 'none', // 多行时尽可能打印尾随逗号 all| none | es5
  printWidth: 120,
  tabWidth: 2,
  semi: true,
  singleQuote: true, // 单引号
  eslintIntegration: true,
  bracketSpacing: true, // 在对象文字中打印括号之间的空格。
  jsxBracketSameLine: true,
  jsxSingleQuote: true, // jsx 属性单引号
  useTabs: false, //使用制表符
  insertPragma: false, //插入 /**@fromat */
  arrowParens: 'avoid' // 箭头参数是否添加 () <avoid|always>
};
