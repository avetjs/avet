---
category: 特性
title: CSS in JS
---

我们提供 [styled-jsx](https://github.com/zeit/styled-jsx) 作为 css in js 的方案, 它有着类似 Web Components 的 "shadow CSS" 特性，同时它还能很好的支持 server-rendering，而且有着不错的性能。

它有如下特性：

- 完整支持 CSS
- 运行时大小只有 3kb, (gzipped 之后)
- 完全隔离: 选择器, 动画, 关键帧
- 支持前缀
- 高性能
- Source maps
- 动态样式
- CSS 预处理

## 它如何工作

这是一般例子：

```javascript
export default () =>
  <div>
    <p>only this paragraph will get the style :)</p>

    { /* 这里你可以引入 <Component />，这里的 P 样式不会影响到这个组件内部的样式 */ }

    <style jsx>{`
      p {
        color: red;
      }
    `}</style>
  </div>
```

这个例子最后被编译成下面这样：

```javascript
import { style as _JSXStyle } from 'avet/styledJsx';

export default () =>
  <div className='jsx-123'>
    <p className='jsx-123'>only this paragraph will get the style :)</p>
    <_JSXStyle styleId='123' css={`p.jsx-123 {color: red;}`} />
  </div>
```

### 为什么要这样

唯一的 className 给了我们更好的样式封装，避免大范围的样式污染。而且 `_JSXStyle` 也进行了一系列的优化：

- 渲染时才注入样式
- 样式只会注入一次，即使这个组件被引入多次
- 移除不使用的样式
- 追踪样式在服务端的渲染

### 把 css 放到独立的文件

当然你也可以把样式单独到文件中。通过这种的方式也是比较好维护的，特别是样式比较多的情况下。

```javascript
// styles.js
import { css } from 'avet/styledJsx';

export const button = css`button { color: hotpink; }`;
export default css`div { color: green; }`;
```

然后通过 import 进行引入

```javascript
import styles from './styles'

export default () =>
  <div>
    <button>styled-jsx</button>
    <style jsx>{styles}</style>
    <style jsx>{button}</style>
  </div>
```

### 针对某个节点

上面的例子中声明了 div 的样式。那么在这个组件中，所有的 div 都会受到这个样式的影响，同时被注入了 `jsx-123` 这个样式。

如果只是像影响到某个 div 样式，那可以通过制定 className 的方式：

```javascript
export default () =>
  <div className="root">
    <style jsx>{`
      .root {
        color: green;
      }
    `}</style>
  </div>
```

### 全局样式

一些情况下还是需要声明全局样式的，那可以通过 `global` 属性完成。

```javascript
export default () =>
  <div>
    <style jsx global>{`
      body {
        background: red
      }
    `}</style>
  </div>
```


更多的信息可以参考 [styled jsx](https://github.com/zeit/styled-jsx) 文档和例子