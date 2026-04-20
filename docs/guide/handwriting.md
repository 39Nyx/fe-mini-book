# 手写代码专题

手写代码是前端面试的必考环节，需要熟练掌握常见功能的实现原理。

## Promise 相关

### Promise 基础实现

```js
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor(executor) {
    this.state = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    
    const resolve = (value) => {
      if (this.state === PENDING) {
        this.state = FULFILLED;
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };
    
    const reject = (reason) => {
      if (this.state === PENDING) {
        this.state = REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };
    
    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }
  
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };
    
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        }, 0);
      } else if (this.state === REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        }, 0);
      } else {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (err) {
              reject(err);
            }
          }, 0);
        });
        
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (err) {
              reject(err);
            }
          }, 0);
        });
      }
    });
    
    return promise2;
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected'));
  }
  
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    let called;
    try {
      const then = x.then;
      if (typeof then === 'function') {
        then.call(x, y => {
          if (called) return;
          called = true;
          resolvePromise(promise2, y, resolve, reject);
        }, r => {
          if (called) return;
          called = true;
          reject(r);
        });
      } else {
        resolve(x);
      }
    } catch (err) {
      if (called) return;
      called = true;
      reject(err);
    }
  } else {
    resolve(x);
  }
}
```

### Promise.all

```js
Promise.myAll = function(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }
    
    const results = [];
    let completedCount = 0;
    
    if (promises.length === 0) {
      return resolve(results);
    }
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        value => {
          results[index] = value;
          completedCount++;
          if (completedCount === promises.length) {
            resolve(results);
          }
        },
        reason => reject(reason)
      );
    });
  });
};
```

### Promise.race

```js
Promise.myRace = function(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }
    
    promises.forEach(promise => {
      Promise.resolve(promise).then(resolve, reject);
    });
  });
};
```

## 函数相关

### call / apply / bind

```js
// Function.prototype.call
Function.prototype.myCall = function(context, ...args) {
  context = context || globalThis;
  const fnSymbol = Symbol('fn');
  context[fnSymbol] = this;
  const result = context[fnSymbol](...args);
  delete context[fnSymbol];
  return result;
};

// Function.prototype.apply
Function.prototype.myApply = function(context, args) {
  context = context || globalThis;
  const fnSymbol = Symbol('fn');
  context[fnSymbol] = this;
  const result = context[fnSymbol](...args);
  delete context[fnSymbol];
  return result;
};

// Function.prototype.bind
Function.prototype.myBind = function(context, ...args1) {
  const fn = this;
  return function(...args2) {
    return fn.apply(context, [...args1, ...args2]);
  };
};
```

### 函数柯里化

```js
// 基础柯里化
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

// 无限柯里化
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

### 防抖与节流

```js
// 防抖 - 延迟执行，只执行最后一次
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

// 节流 - 固定频率执行
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

// 使用时间戳的节流
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
```

## 数组方法

### map

```js
Array.prototype.myMap = function(callback, thisArg) {
  if (this == null) {
    throw new TypeError('this is null or undefined');
  }
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }
  
  const result = [];
  const array = Object(this);
  const len = array.length >>> 0;
  
  for (let i = 0; i < len; i++) {
    if (i in array) {
      result[i] = callback.call(thisArg, array[i], i, array);
    }
  }
  
  return result;
};
```

### filter

```js
Array.prototype.myFilter = function(callback, thisArg) {
  if (this == null) {
    throw new TypeError('this is null or undefined');
  }
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }
  
  const result = [];
  const array = Object(this);
  const len = array.length >>> 0;
  
  for (let i = 0; i < len; i++) {
    if (i in array) {
      if (callback.call(thisArg, array[i], i, array)) {
        result.push(array[i]);
      }
    }
  }
  
  return result;
};
```

### reduce

```js
Array.prototype.myReduce = function(callback, initialValue) {
  if (this == null) {
    throw new TypeError('this is null or undefined');
  }
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }
  
  const array = Object(this);
  const len = array.length >>> 0;
  let accumulator = initialValue;
  let startIndex = 0;
  
  if (arguments.length < 2) {
    if (len === 0) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    accumulator = array[0];
    startIndex = 1;
  }
  
  for (let i = startIndex; i < len; i++) {
    if (i in array) {
      accumulator = callback(accumulator, array[i], i, array);
    }
  }
  
  return accumulator;
};
```

### flat

```js
Array.prototype.myFlat = function(depth = 1) {
  const result = [];
  
  (function flat(arr, d) {
    for (const item of arr) {
      if (Array.isArray(item) && d > 0) {
        flat(item, d - 1);
      } else {
        result.push(item);
      }
    }
  })(this, depth);
  
  return result;
};

// 使用 reduce 实现
Array.prototype.myFlatReduce = function(depth = 1) {
  return depth > 0
    ? this.reduce((acc, val) => 
        acc.concat(Array.isArray(val) ? val.myFlatReduce(depth - 1) : val), [])
    : this.slice();
};
```

## 对象相关

### 深拷贝

```js
// 基础版 - 处理基本类型、对象、数组
function deepClone(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // 处理日期
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  // 处理正则
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }
  
  // 处理循环引用
  if (map.has(obj)) {
    return map.get(obj);
  }
  
  const clone = Array.isArray(obj) ? [] : {};
  map.set(obj, clone);
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], map);
    }
  }
  
  return clone;
}

// 完整版 - 处理更多类型
function deepCloneComplete(obj) {
  const map = new WeakMap();
  
  function clone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof RegExp) return new RegExp(obj);
    if (obj instanceof Map) {
      const result = new Map();
      obj.forEach((value, key) => {
        result.set(clone(key), clone(value));
      });
      return result;
    }
    if (obj instanceof Set) {
      const result = new Set();
      obj.forEach(value => {
        result.add(clone(value));
      });
      return result;
    }
    if (map.has(obj)) return map.get(obj);
    
    const result = Array.isArray(obj) ? [] : {};
    map.set(obj, result);
    
    const keys = [...Object.getOwnPropertyNames(obj), ...Object.getOwnPropertySymbols(obj)];
    keys.forEach(key => {
      result[key] = clone(obj[key]);
    });
    
    return result;
  }
  
  return clone(obj);
}
```

### 继承实现

```js
// 寄生组合继承（推荐）
function inherit(subType, superType) {
  // 创建原型副本
  const prototype = Object.create(superType.prototype);
  // 修正 constructor
  prototype.constructor = subType;
  // 赋值给子类原型
  subType.prototype = prototype;
}

// 使用
function SuperType(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}

SuperType.prototype.sayName = function() {
  console.log(this.name);
};

function SubType(name, age) {
  SuperType.call(this, name); // 继承属性
  this.age = age;
}

inherit(SubType, SuperType); // 继承方法

SubType.prototype.sayAge = function() {
  console.log(this.age);
};
```

## 事件相关

### 事件总线（Event Bus）

```js
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  // 订阅
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return this;
  }
  
  // 订阅一次
  once(event, callback) {
    const onceCallback = (...args) => {
      this.off(event, onceCallback);
      callback.apply(this, args);
    };
    return this.on(event, onceCallback);
  }
  
  // 取消订阅
  off(event, callback) {
    if (!this.events[event]) return this;
    if (!callback) {
      delete this.events[event];
      return this;
    }
    this.events[event] = this.events[event].filter(cb => cb !== callback);
    return this;
  }
  
  // 发布
  emit(event, ...args) {
    if (!this.events[event]) return this;
    this.events[event].forEach(callback => {
      callback.apply(this, args);
    });
    return this;
  }
}

// 使用
const bus = new EventEmitter();
bus.on('message', data => console.log(data));
bus.emit('message', 'Hello World');
```

## 工具函数

### 千分位格式化

```js
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 或使用 Intl
function formatNumberIntl(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

console.log(formatNumber(1234567)); // "1,234,567"
```

### 图片懒加载

```js
function lazyLoadImages() {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });
  
  document.querySelectorAll('img.lazy').forEach(img => {
    imageObserver.observe(img);
  });
}
```

### 简单模板引擎

```js
function template(str, data) {
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
}

const str = 'Hello, {{name}}! You are {{age}} years old.';
const data = { name: 'Tom', age: 20 };
console.log(template(str, data)); // "Hello, Tom! You are 20 years old."
```

---

> 📌 **持续更新中**，更多内容敬请期待...
