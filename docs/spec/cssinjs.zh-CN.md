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

它如何工作？：

```javascript
export default () =>
  <div>
    Hello World
    <p>scoped!</p>
    <style jsx>
    {`
      p {
        color: blue;
      }
      div {
        background: red;
      }
      @media (max-width: 600px) {
        div {
          background: blue;
        }
      }
    `}
    </style>
    <style jsx global>
      body {
        background: black;
      }
    </style>
  </div>
```

