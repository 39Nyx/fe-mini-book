# 作用域与闭包

作用域和闭包是 JavaScript 的核心概念，也是面试必考点。

## 作用域链

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

## 闭包

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

## 闭包的应用场景

- **数据私有化**：通过闭包实现私有变量
- **函数柯里化**：预先填充部分参数
- **防抖节流实现**：保存定时器引用
- **模块化模式**：实现模块的私有状态

## let、const、var 的区别

| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 有（初始化为 undefined） | 有（暂时性死区） | 有（暂时性死区） |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许 |
| 必须初始化 | 否 | 否 | 是 |

### 高频面试题

**Q: 说说你对闭包的理解？**

**答案**：闭包是指有权访问另一个函数作用域中变量的函数。创建闭包的常见方式是在一个函数内部创建另一个函数。

**应用场景**：
- 数据私有化/封装
- 函数柯里化
- 防抖节流
- 缓存计算结果

**注意事项**：闭包会导致内存泄漏风险，因为被引用的变量不会被垃圾回收。

**Q: 什么是暂时性死区（TDZ）？**

**答案**：
- 使用 let/const 声明的变量，在声明前访问会抛出 ReferenceError
- 从块级作用域开始到变量声明前，这个区域称为暂时性死区
- 这是为了防止在变量初始化前使用变量
