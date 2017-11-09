---
order: 0
title: 快速上手
---

## Avet 是什么？

Avet 是一款极具扩展性的同构应用框架，底层基于 Next.js 与 Egg.js 的改造实现。可以理解为把 Egg.js 的设计原则融合进了 Next.js。

我们同样提供微内核 + 插件化的机制来编写项目。

## 特性

- 可扩展的插件机制
- 同构渲染
- 热代码更新
- 自动编译和构建
- 打包自动优化
- 预加载
- CDN

## 支持环境

- 操作系统：支持 macOS、Linux、Windows
- 运行环境：建议选择 [Node LTS 版本](http://nodejs.org/), 版本 >= 8.x

## 入门操作

### 我们使用脚手架来初始化项目

```bash
$ npm install avet-init -g
$ avet-init avet-example --type=simple
$ cd avet-example
$ npm i
```

### 启动项目

```bash
 $ npm run dev
 $ open http://localhost:3000
```
