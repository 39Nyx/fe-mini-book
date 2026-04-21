# ES6+ 新特性

现代 JavaScript 提供了丰富的语法特性，提升开发效率和代码质量。

## 解构赋值

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

## 模块化

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

## 其他常用特性

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

## 深拷贝和浅拷贝

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

### 高频面试题

**Q: 箭头函数和普通函数的区别？**

**答案**：
1. **this 指向**：箭头函数没有自己的 this，继承外层 this
2. **不能使用 new**：箭头函数不能作为构造函数
3. **没有 arguments**：使用 rest 参数代替
4. **没有 prototype**：箭头函数没有原型属性

**Q: 深拷贝和浅拷贝的区别？**

**答案**：
- **浅拷贝**：只复制一层，引用类型共享地址
- **深拷贝**：完全复制，新旧对象互不影响
- **浅拷贝方法**：Object.assign、展开运算符
- **深拷贝方法**：JSON.parse(JSON.stringify)、structuredClone、递归实现
