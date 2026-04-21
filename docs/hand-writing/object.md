# 对象方法手写实现

对象操作是 JavaScript 开发的核心，深拷贝和继承是面试中几乎必考的内容。

## 深拷贝

### 基础版

处理基本类型、对象、数组和循环引用：

```js
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

// 测试循环引用
const obj = { a: 1 };
obj.self = obj;
const cloned = deepClone(obj);
console.log(cloned.self === cloned); // true
```

### 完整版

处理更多数据类型（Map、Set、Symbol 等）：

```js
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

## 继承实现

### 寄生组合继承

最理想的继承方式，避免了组合继承调用两次父类构造函数的问题：

```js
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
  SuperType.call(this, name); // 继承实例属性
  this.age = age;
}

inherit(SubType, SuperType); // 继承原型方法

SubType.prototype.sayAge = function() {
  console.log(this.age);
};

// 测试
const instance = new SubType('Tom', 20);
instance.sayName(); // "Tom"
instance.sayAge();  // 20
console.log(instance instanceof SubType);  // true
console.log(instance instanceof SuperType); // true
```

### ES6 Class 继承（底层原理）

```js
class SuperType {
  constructor(name) {
    this.name = name;
  }
  
  sayName() {
    console.log(this.name);
  }
}

class SubType extends SuperType {
  constructor(name, age) {
    super(name); // 相当于 SuperType.call(this, name)
    this.age = age;
  }
  
  sayAge() {
    console.log(this.age);
  }
}

// Babel 编译后的近似代码
function _inherits(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype, {
    constructor: { value: subClass, writable: true, configurable: true }
  });
  Object.setPrototypeOf(subClass, superClass);
}
```

## 高频面试题

### 1. 深拷贝和浅拷贝的区别？

| 特性 | 浅拷贝 | 深拷贝 |
|------|--------|--------|
| 嵌套对象 | 共享引用 | 独立副本 |
| 修改影响 | 影响原对象 | 不影响原对象 |
| 方法 | Object.assign、展开运算符 | JSON.parse、递归、structuredClone |
| 性能 | 快 | 慢 |

### 2. 为什么不能用 JSON.parse(JSON.stringify()) 做深拷贝？

**局限性**：
1. 丢失函数、`undefined`、`Symbol`
2. 丢失 `Map`、`Set`、`RegExp`、`Date`（转为字符串）
3. 不能处理循环引用（直接报错）
4. 丢失原型链

### 3. JS 继承有哪些方式？优缺点？

| 方式 | 优点 | 缺点 |
|------|------|------|
| 原型链继承 | 简单 | 引用类型共享 |
| 构造函数继承 | 不共享引用 | 方法不能复用 |
| 组合继承 | 属性+方法都继承 | 调用两次父类构造函数 |
| 寄生组合继承 | 完美方案 | 代码稍复杂 |
| Class extends | 语法简洁 | ES6+ |

---

> 📌 **持续更新中**，更多内容敬请期待...
