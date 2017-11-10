---
category: 特性
title: Route 路由
---

## Link 组件

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


### URL 对象

`<Link>` 组件接受一个 URL 对象，内部会对这个对象进行格式化成 URL 字符串。

```javascript
// page/index.js
import Link from 'avet/link';

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
import Link from 'avet/link';

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

## Router 对象

你也可以使用 `avet/router` 做页面切换

```javascript
import Router from 'avet/router'

export default () =>
  <div>
    Click <span onClick={() => Router.push('/about')}>here</span> to read more.
  </div>
```

Router 对象提供了如下 API:

- route - `String` 当前路由
- pathname - `String` 当前 path 除了 query
- query - `Object` 已经通过解析的 query 对象，默认是 `{}`
- asPath - `String` 实际的 path
- push(url, as=url) - 执行 `pushState`
- replace(url, as=url) - 执行 `replaceState`

需要注意的是，在组件中，为了改变路由而不触发跳转、组件获取，我们可以使用 `props.url.push` 和 `props.url.replace`。

### URL 对象

和 `<Link>` 组件一样，`push` 和 `replace` 也可以通过传入一个 URL 对象。

```javascript
import Router from 'avet/router';

const handler = () =>
  Router.push({
    pathname: '/about',
    query: { name: 'avet' },
  });

export default () =>
  <div>
    Click <span onClick={handler}>here</span> to read more.
  </div>
```

可以看到，和 `<Link>` 几乎是一致的

### Router 事件

你也可以通过监听 Router 提供的一些事件来做一些特别的操作：

- routeChangeStart(url) - 在路由开始变化时触发
- routeChangeComplete(url) - 在路由完成时触发
- routeChangeError(err, url) - 在路由失败时触发
- beforeHistoryChange(url) - 在改变浏览器历史记录前触发
- appUpdated(nextRoute) - 当切换到新页面时触发

这里我们写个例子说明如何使用 `routeChangeStart` 事件:

```javascript
Router.onRouteChangeStart = url => {
  console.log('App is changing to: ', url);
}
```

如果你不想再监听这个事件，你可以简单的这么设置:

```javascript
Router.onRouteChangeStart = null;
```

如果路由加载被取消了 (比如说连续快速点击两个链接)， `routeChangeError` 是会触发的。`err` 对象会包含一个设置为 `true` 的 `cancelled` 对象。

```javascript
Router.onRouteChangeError = (err, url) => {
  if (err.cancelled) {
    console.log(`Route to ${url} was cancelled!`);
  }
}
```

最后你也通过 `appUpdated` 来主动触发跳转：

```javascript
Router.onAppUpdated = nextUrl => {
  // persist the local state
  location.href = nextUrl;
}
```

## Shallow 路由

一般来说，当你调用 Router.push 之后改变了 URL 会调用 `getInitialProps` 的，这就意味着整个组件的状态都会丢失。
你可以在调用 `Router.push` 和 `Router.replace` 时传入 `shallow: true`，来更新 `pathname` 和 `query` 又不会造成状态的丢失。

```javascript
// Current URL is "/"
const href = '/?counter=10'
const as = href
Router.push(href, as, { shallow: true })
```

这时，组件中 `this.props.url` 的值已经发生了改变，你可以通过 `componentWillReceiveProps` 来监听 URL 的改变。

```javascript
componentWillReceiveProps(nextProps) {
  const { pathname, query } = nextProps.url
  // fetch data based on the new query
}
```

## Higher Order Component

你可以通过使用 Higher-Order Component 来访问 `router` 对象

```javascript
import { withRouter } from 'avet/router'

const ActiveLink = ({ children, router, href }) => {
  const style = {
    marginRight: 10,
    color: router.pathname === href? 'red' : 'black'
  }

  const handleClick = (e) => {
    e.preventDefault()
    router.push(href)
  }

  return (
    <a href={href} onClick={handleClick} style={style}>
      {children}
    </a>
  )
}

export default withRouter(ActiveLink);
```