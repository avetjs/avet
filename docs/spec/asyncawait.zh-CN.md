---
category: 教程
title: Async Await
---

[原文链接](https://zeit.co/blog/async-and-await#how-promise-works)

Javascript, 尤其是 Node.js, 最被人诟病的是 callback hell 了. 这时候如果你需要处理大量的异步 io 操作，你可能会把代码写成这样：

```javascript
export default function getLike() {
  getUsers((err, users) => {
    if (err) return fn(err);
    filterUsersWithFriends((err, usersWithFriends) => {
      if (err) return fn(err);
      getUsersLikes(usersWithFriends, (err, likes) => {
        if (err) return fn (err);
        fn(null, likes);
      });
    });
  });
}
```

我们来看看 callback 都有哪些问题。

## 回调的问题

### 错误处理是重复的

在大多数的情况下，你只需要将错误传递下去。
然而，在上面的例子中，你重复了很多次。当错误发生时，也很容易忘记 `return`。

### 未指定错误处理

当错误发生时，大多数流行的框架都会调用 callback，并且把 `Error` 对象作为参数传进去。如果是成功，则使用 `null` 代替。
不幸的是，事情别不总是这样。你可能获取到的是 `false` 而不是 `null`。有些库甚至忽略它。如果有几个错误出现，你可能会得到多个 callback。

### 调度是不确定的

callback 是立即调用？是不是在不同的 [microtask](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)队列中？不同的 tick？ 有时？ 总是？
谁都不清楚。读自己的代码是没用的，阅读库的文档可能会告诉你，如果你够幸运。
callback 也很容易造成堆栈的丢失，也就是说你看到的异常的堆栈是很难看出问题所在的。使得我们的代码更难进行调试。

这些问题已经在 `Promise` 进行标准化解决了

## Promise 是如何工作的

Promise 提供了一套非常明确的 API
我们来看下  `setTimeout` 如何和 `Promise` 进行配合：

```javascript
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

sleep(100)
  .then(() => console.log('100ms elapsed'))
  .catch(() => console.error('error!'));
```

Promises 有两种状态：resolved 和 rejected。看上面这个例子，你可以设置一对回调，分别获取到 resolved 的值和 rejected 的值。

我们对第一个例子进行 Promise 改造：

```javascript
export default function getLikes() {
  return getUsers()
    .then(users => filterUsersWithFriends)
    .then(userWithFriends => getUsersLikes);
}
```

很明显，这样的代码比较好。如果我们的逻辑需要改动，也是比较容易重构的。
但是有些情况下，Promise 的这种写法也不能很好的解决问题。我们想象下，如果需要特别的 `filterUsersWithFriends` 的错误。那我们应该如何写？

```javascript
export default function getLikes () {
  return new Promise((resolve, reject) => {
    getUsers()
      .then(users => {
        filterUsersWithFriends(users)
          .then(resolve)
          .catch((err) => {
            resolve(trySomethingElse(users));
          });
      }, reject)
  });
}
```

结果看起来也不是特别好。联调长的时候感觉就是另类的 callback 了

我们来看下解决方案！

## 未来：async 和 await

在 C# 和 F# 已经实现了这两个关键字，我们先来看看这两个关键字是如何解决我们的问题的：

```javascript
export default async function getLikes () {
  const users = await getUsers();
  const filtered = await filterUsersWithFriends(users);
  return getUsersLikes(filtered);
}
```

可以看出来，我们现在的代码非常容易阅读，因为它看起来像是同步代码。而且错误处理的逻辑和传统同步代码处理的逻辑是一致的。
当我们 `await` 的 function 出现错误，是会直接抛出的。我们调用 getLikes 的时候，就会得到这个错误。如果你想现在出现这个错误，可以通过 try/catch 对这个 await 进行包裹起来。

```javascript
try {
  await getLikes()
} catch (err) {
  errorHanler(err);
}
```

这会提高你的生产力和准确性，因为你不需要在到处写 `if (err) return cb(err)` 这样的代码。也不怕漏掉。
最新的 Node 8 已经完整的实施了 `Promise` 和 `async/await` 所以现在就可以放心的使用了。
浏览器这块在一些低版本浏览器我们可以通过 Babel 进行代码转换，所以也可以放心编写。
