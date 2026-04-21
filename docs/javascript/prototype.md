# 原型与继承

原型链是 JavaScript 实现继承的核心机制。

## 原型链

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

## 继承方式

### ES6 Class 继承

```js
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

### 传统继承方式

1. **原型链继承**：子类原型指向父类实例
2. **构造函数继承**：在子类构造函数中调用父类构造函数
3. **组合继承**：原型链 + 构造函数（最常用）
4. **寄生组合继承**：优化组合继承
5. **ES6 Class extends**：语法糖，本质是寄生组合继承

### 高频面试题

**Q: 原型链是什么？如何实现继承？**

**答案**：每个对象都有一个 `__proto__` 属性指向其构造函数的原型对象，原型对象也有 `__proto__`，形成链式结构，直到 `Object.prototype.__proto__` 为 `null`。

**继承方式**：
- 原型链继承
- 构造函数继承
- 组合继承
- 寄生组合继承
- ES6 Class extends

**Q: prototype 和 __proto__ 的区别？**

**答案**：
- **prototype**：函数特有的属性，指向原型对象
- **__proto__**：对象特有的属性，指向构造函数的 prototype
- 只有函数有 prototype，所有对象都有 __proto__
