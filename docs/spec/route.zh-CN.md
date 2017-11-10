---
category: 特性
title: Route 路由
---

## `<Link>`

客户端我们通过 `<Link>` 组件进行页面跳转：

```javascript
// page/index.js
import Link from 'avet/link'

export default () =>
  <div>
    Click <Link href="/about"><a>here</a></Link> to read more.
  </div>
```

```javascript
// page/about.js
export default () => <p>Welcome to About!</p>
```

我们可以使用 `<Link prefetch>` 进行页面的预加载，最大化的提高性能。

客户端路由的行为与浏览器完全相同：

1. 组件被获取
2. 如果声明了 `getInitialProps`, 数据被获取。如果出现异常， `_error.js` 被渲染。
3. 在 1 和 2 完成之后，`pushState` 被调用，一个新的组件完成渲染。

每一个顶层组件会收到一个 url 属性，包含以下对象：

- pathname - `String` 当前 path 除了 query
- query - `Object` 已经通过解析的 query 对象，默认是 `{}`
- asPath - `String` 实际的 path
- push(url, as=url) - 执行 `pushState`
- replace(url, as=url) - 执行 `replaceState`

第二个 as 参数是可选的，如果你在服务端配置自定义路由，这个参数才会有用。


## URL 对象

`<Link>` 组件接受一个 URL 对象，内部会对这个对象进行格式化成 URL 字符串。

```javascript
// page/index.js
import Link from 'avet/link'

export default () =>
  <div>
    Click
    {' '}
    <Link href={{ pathname: '/about', query: { name: 'avet' } }}>
      <a>here</a>
    </Link>
    {' '}
    to read more
  </div>
```

然后生成的 URL 字符串是 `/about?name=avet`, 你可以使用在 [Node.js URL module documentation](https://nodejs.org/api/url.html#url_url_strings_and_url_objects) 中声明的每一个属性。

### 使用 replace

`<Link>` 的默认行为是 `push` 一个新的地址到 stack 中。你可以使用 `replace` 属性来防止创建一条新的记录

```javascript
// page/index.js
import Link from 'avet/link'

export default () =>
  <div>
    Click
    {' '}
    <Link href="/about" replace>
      <a>here</a>
    </Link>
    {' '}
    to read more
  </div>
```

## Router

你也可以使用 `avet/router` 做页面切换

```javascript
import Router from 'avet/router'

export default () =>
  <div>
    Click <span onClick={() => Router.push('/about')}>here</span> to read more.
  </div>
```


