# 函数方法手写实现

函数是 JavaScript 的一等公民，掌握函数相关方法的手写实现是面试高频考点。

## call / apply / bind

### call

改变函数执行时的 this 指向，参数逐个传递：

```js
Function.prototype.myCall = function(context, ...args) {
  context = context || globalThis;
  const fnSymbol = Symbol('fn');
  context[fnSymbol] = this;
  const result = context[fnSymbol](...args);
  delete context[fnSymbol];
  return result;
};
```

### apply

与 call 类似，但参数以数组形式传递：

```js
Function.prototype.myApply = function(context, args) {
  context = context || globalThis;
  const fnSymbol = Symbol('fn');
  context[fnSymbol] = this;
  const result = context[fnSymbol](...args);
  delete context[fnSymbol];
  return result;
};
```

### bind

返回一个新函数，永久绑定 this：

```js
Function.prototype.myBind = function(context, ...args1) {
  const fn = this;
  return function(...args2) {
    return fn.apply(context, [...args1, ...args2]);
  };
};

// 支持 new 调用的完整版
Function.prototype.myBindComplete = function(context, ...args1) {
  const fn = this;
  
  function bound(...args2) {
    const isNew = this instanceof bound;
    return fn.apply(isNew ? this : context, [...args1, ...args2]);
  }
  
  bound.prototype = Object.create(fn.prototype);
  return bound;
};
```

## 函数柯里化

### 基础柯里化

将多参数函数转换为单参数函数链：

```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...args2) {
        return curried.apply(this, [...args, ...args2]);
      };
    }
  };
}

// 使用
const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6
console.log(curriedAdd(1)(2, 3)); // 6
```

### 无限柯里化

支持链式调用并以数值方式获取结果：

```js
function addInfinite(...args) {
  const sum = args.reduce((a, b) => a + b, 0);

  function inner(...nextArgs) {
    return addInfinite(sum, ...nextArgs);
  }

  inner.valueOf = () => sum;
  inner.toString = () => sum;

  return inner;
}

console.log(addInfinite(1)(2)(3) + 0); // 6
console.log(addInfinite(1, 2, 3)(4) + 0); // 10
```

## 防抖与节流

### 防抖（debounce）

延迟执行，只执行最后一次。适用于搜索框输入、窗口 resize 等场景：

```js
function debounce(fn, delay, immediate = false) {
  let timer = null;

  return function(...args) {
    const context = this;

    if (timer) clearTimeout(timer);

    if (immediate) {
      const callNow = !timer;
      timer = setTimeout(() => {
        timer = null;
      }, delay);
      if (callNow) fn.apply(context, args);
    } else {
      timer = setTimeout(() => {
        fn.apply(context, args);
      }, delay);
    }
  };
}

// 使用示例
const handleSearch = debounce((keyword) => {
  console.log('搜索:', keyword);
}, 500);

input.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});
```

### 节流（throttle）

固定频率执行。适用于滚动加载、频繁点击等场景：

```js
// 定时器版
function throttle(fn, limit) {
  let inThrottle;

  return function(...args) {
    const context = this;

    if (!inThrottle) {
      fn.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 时间戳版
function throttleTimestamp(fn, limit) {
  let lastTime = 0;

  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= limit) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

// 使用示例
const handleScroll = throttle(() => {
  console.log('滚动位置:', window.scrollY);
}, 200);

window.addEventListener('scroll', handleScroll);
```

## 高频面试题

### 1. call、apply、bind 的区别？

| 特性 | call | apply | bind |
|------|------|-------|------|
| 参数形式 | 逐个传递 | 数组传递 | 逐个传递 |
| 执行时机 | 立即执行 | 立即执行 | 返回新函数，延迟执行 |
| 返回值 | 函数执行结果 | 函数执行结果 | 绑定 this 的新函数 |

### 2. 防抖和节流的区别？

- **防抖**：事件触发后延迟执行，如果在延迟期间再次触发，则重新计时。只执行最后一次。
- **节流**：固定时间间隔内只执行一次，无视中间触发次数。

### 3. 如何实现一个支持 new 的 bind？

**关键点**：
1. 返回的函数被 `new` 调用时，this 应指向实例对象
2. 使用 `Object.create` 保持原型链
3. 通过 `instanceof` 判断是否被 `new` 调用

---

> 📌 **持续更新中**，更多内容敬请期待...
