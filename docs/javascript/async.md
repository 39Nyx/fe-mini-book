# 异步编程

JavaScript 是单线程语言，通过异步机制实现非阻塞操作。

## Event Loop

```js
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

Promise.resolve().then(() => {
  console.log('3');
});

console.log('4');

// 输出顺序: 1 → 4 → 3 → 2
```

**执行顺序**：
1. 同步代码（调用栈）
2. 微任务（Promise、MutationObserver）
3. 宏任务（setTimeout、setInterval、I/O）

## Promise

```js
// Promise 基本用法
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success');
  }, 1000);
});

promise
  .then(value => console.log(value))
  .catch(err => console.error(err));

// Promise.all - 所有成功才成功
Promise.all([p1, p2, p3]).then(values => {
  console.log(values); // [v1, v2, v3]
});

// Promise.race - 返回最快的
Promise.race([p1, p2, p3]).then(value => {
  console.log(value);
});

// Promise.allSettled - 等待所有完成
Promise.allSettled([p1, p2, p3]).then(results => {
  console.log(results);
  // [{status: 'fulfilled', value: ...}, {status: 'rejected', reason: ...}]
});
```

## async/await

```js
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// async 函数返回 Promise
fetchData().then(data => console.log(data));
```

### 高频面试题

**Q: 宏任务和微任务的区别？**

**答案**：
- **宏任务**：script、setTimeout、setInterval、I/O、UI rendering
- **微任务**：Promise.then、MutationObserver、queueMicrotask

**执行顺序**：同步代码 → 微任务队列清空 → 宏任务（取一个）→ 微任务队列清空 → 循环

**Q: async/await 的本质是什么？**

**答案**：
- async/await 是 Generator 的语法糖
- async 函数返回 Promise
- await 等待 Promise 解决，阻塞后续代码执行
- 底层基于 Promise 实现
