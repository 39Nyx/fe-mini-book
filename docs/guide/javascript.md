# JavaScript 核心

深入理解 JavaScript 核心概念，掌握高频面试考点。

## 基础概念

### 数据类型

JavaScript 共有 8 种数据类型：

- **基本类型**：`string`、`number`、`boolean`、`null`、`undefined`、`symbol`、`bigint`
- **引用类型**：`object`（包括 Object、Array、Function、Date、RegExp 等）

```js
// 判断数据类型的方法
typeof 'hello';        // "string"
typeof 123;            // "number"
typeof true;           // "boolean"
typeof undefined;      // "undefined"
typeof Symbol();       // "symbol"
typeof 123n;           // "bigint"
typeof null;           // "object" (历史遗留 bug)
typeof {};             // "object"
typeof [];             // "object"
typeof function(){};   // "function"

// 更准确的判断
Object.prototype.toString.call([]);     // "[object Array]"
Object.prototype.toString.call(null);   // "[object Null]"
```

### 类型转换

```js
// 隐式转换规则
1 + '2';        // "12" (数字转字符串)
1 - '2';        // -1 (字符串转数字)
'2' * '3';      // 6 (字符串转数字)
!!'hello';      // true (非空字符串转 true)
!!'';           // false (空字符串转 false)

// 经典面试题
[] == ![];      // true
{} + [];        // 0
[] + {};        // "[object Object]"
```

## 作用域与闭包

### 作用域链

```js
var a = 1;
function foo() {
  var b = 2;
  function bar() {
    var c = 3;
    console.log(a, b, c); // 可以访问外层作用域
  }
  bar();
}
foo();
```

### 闭包

```js
// 闭包：函数 + 函数内部能访问到的外部变量
function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getCount());  // 2
```

**闭包的应用场景**：
- 数据私有化
- 函数柯里化
- 防抖节流实现
- 模块化模式

## 原型与继承

### 原型链

```js
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`);
};

const person = new Person('Tom');

// 原型链查找
person.__proto__ === Person.prototype;           // true
Person.prototype.__proto__ === Object.prototype; // true
Object.prototype.__proto__ === null;             // true
```

### 继承方式

```js
// ES6 Class 继承
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    console.log(`${this.name} makes a sound`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }
  
  speak() {
    console.log(`${this.name} barks`);
  }
}
```

## 异步编程

### Event Loop

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

### Promise

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

### async/await

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

## ES6+ 新特性

### 解构赋值

```js
// 对象解构
const { a, b = 10, ...rest } = { a: 1, c: 3, d: 4 };
// a = 1, b = 10, rest = { c: 3, d: 4 }

// 数组解构
const [first, second, ...others] = [1, 2, 3, 4, 5];
// first = 1, second = 2, others = [3, 4, 5]

// 嵌套解构
const { user: { name, age } } = { user: { name: 'Tom', age: 20 } };
```

### 模块化

```js
// 导出 (export.js)
export const PI = 3.14159;
export function add(a, b) {
  return a + b;
}
export default class Calculator {
  // ...
}

// 导入 (import.js)
import Calculator, { PI, add } from './export.js';
import * as math from './export.js';
```

### 其他常用特性

```js
// 模板字符串
const name = 'World';
const message = `Hello, ${name}!`;

// 箭头函数
const add = (a, b) => a + b;

// 展开运算符
const arr1 = [1, 2];
const arr2 = [...arr1, 3, 4]; // [1, 2, 3, 4]
const obj1 = { a: 1 };
const obj2 = { ...obj1, b: 2 }; // { a: 1, b: 2 }

// 可选链操作符
const user = { profile: { name: 'Tom' } };
const age = user?.profile?.age; // undefined (不报错)

// 空值合并运算符
const value = null ?? 'default'; // 'default'
const zero = 0 ?? 'default';     // 0 (不是 null/undefined)
```

## 高频面试题

### 1. 说说你对闭包的理解？

**答案**：闭包是指有权访问另一个函数作用域中变量的函数。创建闭包的常见方式是在一个函数内部创建另一个函数。

**应用场景**：
- 数据私有化/封装
- 函数柯里化
- 防抖节流
- 缓存计算结果

**注意事项**：闭包会导致内存泄漏风险，因为被引用的变量不会被垃圾回收。

### 2. 原型链是什么？如何实现继承？

**答案**：每个对象都有一个 `__proto__` 属性指向其构造函数的原型对象，原型对象也有 `__proto__`，形成链式结构，直到 `Object.prototype.__proto__` 为 `null`。

**继承方式**：
- 原型链继承
- 构造函数继承
- 组合继承
- 寄生组合继承
- ES6 Class extends

### 3. 宏任务和微任务的区别？

**答案**：
- **宏任务**：script、setTimeout、setInterval、I/O、UI rendering
- **微任务**：Promise.then、MutationObserver、queueMicrotask

**执行顺序**：同步代码 → 微任务队列清空 → 宏任务（取一个）→ 微任务队列清空 → 循环

### 4. let、const、var 的区别？

| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 有（初始化为 undefined） | 有（暂时性死区） | 有（暂时性死区） |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许 |
| 必须初始化 | 否 | 否 | 是 |

### 5. 深拷贝和浅拷贝的区别？

**浅拷贝**：只复制一层，对象内部引用类型共享内存地址
```js
// 浅拷贝方法
Object.assign({}, obj);
{ ...obj };
arr.slice();
arr.concat();
```

**深拷贝**：完全复制，新旧对象互不影响
```js
// 深拷贝方法
JSON.parse(JSON.stringify(obj)); // 有局限性
structuredClone(obj); // 现代浏览器支持
// 或手写递归实现
```

---

> 📌 **持续更新中**，更多内容敬请期待...
