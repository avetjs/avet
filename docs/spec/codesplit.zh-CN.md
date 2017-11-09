---
category: 特性
title: 代码自动切分
---

Bundle 是根据 `/page` 目录下每个页面进行切分的。也就意味着页面不会加载多余的代码。
比如说:

这是 `page/index.js` 下的代码
```javascript
import Button from 'antd/lib/button'

export default () =>
  <div>
    <h1>This is index page.</h1>
    <Button>say hello!</Button>
  </div>
```

这是 `page/about.js` 下的代码
```javascript
export default () => {
  <div>
    <h1>This is about page.</h1>
  </div>
}
```

这样我们程序在
