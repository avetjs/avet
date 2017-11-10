---
category: 特性
title: React 同构渲染
---

![](https://cdn-images-1.medium.com/max/1600/1*Z4YLKQX_K7HUdz1AHtUKhw.jpeg)

## 为什么要使用同构渲染

同构渲染它解决了哪些问题？

1. 服务端渲染首先会在服务端获取到渲染页面的数据，然后拼装需要渲染的 HTML 数据，最后发送到客户端。客户端在拿到这些初始化的页面 HTML 和 所需要的数据后渲染页面。他解决了初始化页面慢的问题，不需要等待 javascript 加载好才能看到页面。

2. 由于数据和标签在首次加载时候都由服务端进行提供了，所以搜索引擎爬虫是可以成功或许到 HTML body 的。即使用户在浏览器禁用了 javascript，我们的页面也能够正常显示。它解决了 SEO 问题。

## 如何使用

那在 Avet 中，我们如何更好的使用这个能力？

在页面组件中，当你需要使用 state 管理页面数据状态、声明周期的 hooks 或者是使用初始化数据的入口。就需要 export 一个 `React.Component` 而不是 `stateless function`：

```javascript
import React from 'react'

export default class extends React.Component {
  static async getInitialProps({ ctx }) {
    const userAgent = ctx ? ctx.get('user-agent') : navigator.userAgent
    return { userAgent }
  }

  render() {
    return (
      <div>
        Hello World {this.props.userAgent}
      </div>
    )
  }
}
```

需要注意下，可以看出 `getInitialProps` 是一个 async 的静态方法

