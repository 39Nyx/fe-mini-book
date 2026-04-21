# JavaScript 数据类型

深入理解 JavaScript 数据类型和类型转换机制。

## 数据类型

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

## 类型转换

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

### 高频面试题

**Q: typeof null 为什么返回 "object"？**

**答案**：
- 这是 JavaScript 的历史遗留 bug
- 在 JavaScript 第一个版本中，值是用 32 位存储的
- 类型标签存储在低位，对象的类型标签是 000
- null 表示空指针（全是 0），所以被误判为对象

**Q: 如何准确判断数组类型？**

**答案**：
```js
// 方法1: Object.prototype.toString
Object.prototype.toString.call([]); // "[object Array]"

// 方法2: Array.isArray
Array.isArray([]); // true

// 方法3: instanceof
[] instanceof Array; // true
```
