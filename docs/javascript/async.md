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

## 高频面试题

### Q1: 宏任务和微任务的区别？

**答案**：
- **宏任务（MacroTask）**：script（整体代码）、setTimeout、setInterval、setImmediate（Node）、I/O、UI rendering、MessageChannel
- **微任务（MicroTask）**：Promise.then/catch/finally、MutationObserver、queueMicrotask、process.nextTick（Node，优先级最高）

**执行顺序**：同步代码执行完 → 清空微任务队列 → 取一个宏任务执行 → 再清空微任务队列 → 循环往复。

**关键点**：每执行完一个宏任务，都会把微任务队列「一次性清空」，而不是只取一个。

---

### Q2: async/await 的本质是什么？

**答案**：
- async/await 是 **Generator + 自动执行器** 的语法糖
- `async` 函数永远返回 Promise，函数内 `return` 的值会被 `Promise.resolve()` 包装
- `await` 会暂停函数执行，等待右侧 Promise 敲定（settle），再将结果作为表达式值返回
- `await` 后的代码相当于放到 `.then` 的回调中，因此会作为**微任务**执行
- 若 await 的 Promise reject，需用 try/catch 捕获，否则会抛出 unhandledRejection

---

### Q3: Promise.all、Promise.race、Promise.allSettled、Promise.any 的区别？

**答案**：

| 方法 | 成功条件 | 失败条件 | 返回值 |
|------|---------|---------|--------|
| `Promise.all` | 全部 fulfilled | 任一 rejected 立即失败 | 结果数组（顺序与入参一致） |
| `Promise.race` | 任一最先 settled（成功或失败） | 最先 rejected | 最快那个的值/原因 |
| `Promise.allSettled` | 全部 settled（ES2020） | 不会失败 | `[{status, value/reason}]` |
| `Promise.any` | 任一 fulfilled（ES2021） | 全部 rejected | 最快成功的值；失败时抛 `AggregateError` |

**记忆口诀**：all 全成功、race 看最快、allSettled 等全部、any 求一成。

---

### Q4: 以下代码的输出顺序是什么？

```js
console.log('1');
setTimeout(() => console.log('2'), 0);
new Promise((resolve) => {
  console.log('3');
  resolve();
}).then(() => console.log('4'));
console.log('5');
```

**答案**：`1 → 3 → 5 → 4 → 2`

**解析**：
1. 同步执行：`1`、`3`（Promise 构造函数是同步的）、`5`
2. 清空微任务：`4`（Promise.then）
3. 取下一个宏任务：`2`（setTimeout）

---

### Q5: async/await 与 Promise.then 的执行顺序差异？

```js
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}
async function async2() {
  console.log('async2');
}
console.log('script start');
async1();
new Promise((resolve) => {
  console.log('promise1');
  resolve();
}).then(() => console.log('promise2'));
console.log('script end');
```

**答案**：
```
script start
async1 start
async2
promise1
script end
async1 end
promise2
```

**要点**：`await` 后续代码等价于 `.then` 回调，会进入微任务队列，让出同步执行权。

---

### Q6: 如何实现 Promise.all？

```js
Promise.myAll = function (promises) {
  return new Promise((resolve, reject) => {
    const result = [];
    let count = 0;
    if (promises.length === 0) return resolve(result);
    promises.forEach((p, i) => {
      Promise.resolve(p).then(
        (value) => {
          result[i] = value;
          if (++count === promises.length) resolve(result);
        },
        reject, // 任一失败则整体 reject
      );
    });
  });
};
```

**要点**：结果需按**索引**赋值（而非 push）以保证顺序；用计数器判断是否全部完成；用 `Promise.resolve` 兼容非 Promise 值。

---

### Q7: Promise 的三种状态及特点？

**答案**：
- `pending`（进行中）、`fulfilled`（已成功）、`rejected`（已失败）
- 状态**只能从 pending 变为 fulfilled 或 rejected**，且一旦改变就不可再变（**不可逆**）
- `.then / .catch / .finally` 返回**新的 Promise**，因此可链式调用
- `.finally` 回调不接收参数，其返回值不影响链的结果（但抛错会传递）

---

### Q8: async 函数中的错误如何处理？

**答案**：
1. **try/catch 包裹 await**：最常用方式
2. **await Promise 上挂 .catch**：`const data = await fetch(url).catch(handleErr)`
3. **在调用处 .catch**：`async1().catch(err => ...)`
4. **封装统一错误处理**：
```js
const to = (promise) => promise.then(data => [null, data]).catch(err => [err, null]);
const [err, data] = await to(fetch('/api'));
```

**陷阱**：`forEach` 中的 `await` 不会被外层 async 等待，应改用 `for...of` 或 `Promise.all(arr.map(...))`。

---

### Q9: 如何控制并发请求数量（请求池）？

```js
async function asyncPool(limit, tasks) {
  const results = [];
  const executing = new Set();
  for (const task of tasks) {
    const p = Promise.resolve().then(() => task());
    results.push(p);
    executing.add(p);
    p.finally(() => executing.delete(p));
    if (executing.size >= limit) await Promise.race(executing);
  }
  return Promise.all(results);
}
```

**思路**：维护一个「正在执行」集合，达到上限时用 `Promise.race` 等待最快完成的那个再继续入池。

---

### Q10: 宏任务、微任务与浏览器渲染的关系？

**答案**：
- 每轮事件循环的**一个宏任务**执行完毕，会清空微任务队列
- **渲染时机**：浏览器会在微任务清空后、下一个宏任务执行前，判断是否需要渲染（并非每轮都渲染，通常 16.6ms/帧）
- `requestAnimationFrame` 回调在**渲染之前**执行，适合动画
- `requestIdleCallback` 在**渲染之后**的空闲时间执行，适合低优先级任务
- 长时间同步任务或持续的微任务（如递归 Promise.then）会**阻塞渲染**，导致掉帧
