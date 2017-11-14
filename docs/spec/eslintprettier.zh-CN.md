---
category: 教程
title: Eslint Prettier
---

![](https://raw.githubusercontent.com/prettier/prettier-logo/master/images/prettier-banner-dark.png)

在团队协作中，代码风格统一是非常重要的。
首先，从视觉上来说，在阅读的时候就会比较轻松，因为模式是一样的。
再者，从团队上来说，这样的代码会更安全，一些简单的 Bug 也不会写出来。

[eslint](https://eslint.org/) 作为当下最流行的 js 代码风格检测工具，他可以根据配置的规则，在 IDE 中实时地检测代码错误，也可以扫描项目整体的代码报错情况。

[prettier](https://github.com/prettier/prettier) 作为代码格式化工具，它本身可以很好的和 [eslint](https://eslint.org/) 配合在一起。它会强制根据你配置的规则对你的代码进行格式化处理。当你在编辑器或者 IDE 中保存代码，工具同时会对你的代码进行处理，而不需要自己手动调整代码来符合 [eslint] 的格式要求。

### Input

```javascript
foo(reallyLongArg(), omgSoManyParameters(), IShouldRefactorThis(), isThereSeriouslyAnotherOne());
```

### Outpout
```javascript
foo(
  reallyLongArg(),
  omgSoManyParameters(),
  IShouldRefactorThis(),
  isThereSeriouslyAnotherOne()
);
```

## 安装配置

1. 首先需要引入 eslint、eslint-config-avet、babel-eslint

```bash
$ npm i eslint eslint-config-avet babel-eslint --save-dev
```

2. 设置 `.eslintrc`

在项目根目录下创建 .eslintrc 文件，然后设置:
```javascript
{
  "extends": "eslint-config-avet"
}
```

3. VSCode 安装 Prettier 插件

```bash
ext install prettier-vscode
```
或者在插件页面搜索 `Prettier - JavaScript formatter` 进行安装并重启编辑器

4. 在 VSCode 配置 `editor.formatOnSave` 为 `true`

经过这些步骤之后，我们就可以在编辑器中愉快的使用 [eslint](https://eslint.org/) 和 [prettier](https://github.com/prettier/prettier) 了。

## 规则

目前使用的规则是 [eslint-config-avet](https://github.com/avetjs/eslint-config-avet)，它继承自 [airbnb](https://www.npmjs.com/package/eslint-config-airbnb) 并做了些小修改。
