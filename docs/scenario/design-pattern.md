# 设计模式

设计模式是写出可维护、可扩展代码的基础，也是前端面试的常见考点。

## 单例模式

确保一个类只有一个实例，并提供一个全局访问点：

```js
// ES6 Class 实现
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    this.data = {};
    Singleton.instance = this;
  }

  set(key, value) {
    this.data[key] = value;
  }

  get(key) {
    return this.data[key];
  }
}

// 闭包实现
const SingletonFactory = (function() {
  let instance;

  function createInstance() {
    return {
      data: {},
      set(key, value) {
        this.data[key] = value;
      },
      get(key) {
        return this.data[key];
      }
    };
  }

  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

// 使用
const s1 = new Singleton();
const s2 = new Singleton();
console.log(s1 === s2); // true
```

**应用场景**：全局状态管理（Redux Store、Vuex Store）、数据库连接池、配置管理器。

## 工厂模式

根据条件创建不同类型的对象：

```js
// 简单工厂
class Button {
  render() {
    return '<button>Button</button>';
  }
}

class Input {
  render() {
    return '<input />';
  }
}

class ComponentFactory {
  static create(type) {
    switch (type) {
      case 'button':
        return new Button();
      case 'input':
        return new Input();
      default:
        throw new Error(`Unknown component type: ${type}`);
    }
  }
}

// 抽象工厂
class UIFactory {
  createButton() {}
  createInput() {}
}

class WebFactory extends UIFactory {
  createButton() {
    return new WebButton();
  }
  createInput() {
    return new WebInput();
  }
}

class MobileFactory extends UIFactory {
  createButton() {
    return new MobileButton();
  }
  createInput() {
    return new MobileInput();
  }
}
```

**应用场景**：组件库创建、跨平台 UI 渲染、复杂对象的创建逻辑封装。

## 观察者模式

对象间的一对多依赖关系，当一个对象状态改变时，所有依赖者自动收到通知：

```js
class Subject {
  constructor() {
    this.observers = [];
  }

  // 订阅
  subscribe(observer) {
    this.observers.push(observer);
  }

  // 取消订阅
  unsubscribe(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  // 通知
  notify(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}

class Observer {
  constructor(name) {
    this.name = name;
  }

  update(data) {
    console.log(`${this.name} received:`, data);
  }
}

// 使用
const subject = new Subject();
const observer1 = new Observer('Observer 1');
const observer2 = new Observer('Observer 2');

subject.subscribe(observer1);
subject.subscribe(observer2);

subject.notify('Hello Observers!');
```

## 发布订阅模式

与观察者模式类似，但通过事件中心解耦发布者和订阅者：

```js
class EventBus {
  constructor() {
    this.events = {};
  }

  // 订阅
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  // 发布
  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(...args));
    }
  }

  // 取消订阅
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  // 只订阅一次
  once(event, callback) {
    const onceCallback = (...args) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }
}
```

**观察者模式 vs 发布订阅模式**：

| 特性 | 观察者模式 | 发布订阅模式 |
|------|-----------|-------------|
| 耦合度 | Subject 和 Observer 直接关联 | 完全解耦，通过事件中心通信 |
| 通信方式 | 直接调用 | 间接通过事件中心 |
| 灵活性 | 较低 | 较高 |
| 典型应用 | Vue 响应式 | Event Bus、Node.js EventEmitter |

## 策略模式

定义一系列算法，把它们一个个封装起来，并且使它们可以互相替换：

```js
// 策略对象
const strategies = {
  required(value, errorMsg) {
    if (value === '' || value == null) {
      return errorMsg;
    }
  },
  minLength(value, length, errorMsg) {
    if (value.length < length) {
      return errorMsg;
    }
  },
  isMobile(value, errorMsg) {
    if (!/^1[3-9]\d{9}$/.test(value)) {
      return errorMsg;
    }
  },
  isEmail(value, errorMsg) {
    if (!/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(value)) {
      return errorMsg;
    }
  }
};

// 验证器
class Validator {
  constructor() {
    this.cache = [];
  }

  add(value, rules) {
    for (const rule of rules) {
      const strategyArr = rule.strategy.split(':');
      const strategy = strategyArr.shift();
      strategyArr.unshift(value);
      strategyArr.push(rule.errorMsg);

      this.cache.push(() => {
        return strategies[strategy](...strategyArr);
      });
    }
  }

  start() {
    for (const validatorFunc of this.cache) {
      const errorMsg = validatorFunc();
      if (errorMsg) {
        return errorMsg;
      }
    }
  }
}

// 使用
const validator = new Validator();
validator.add('13800138000', [
  { strategy: 'required', errorMsg: '手机号不能为空' },
  { strategy: 'isMobile', errorMsg: '手机号格式不正确' }
]);
const errorMsg = validator.start();
```

## 装饰器模式

在不改变原对象的基础上，动态地给对象添加额外职责：

```js
// ES7 装饰器语法
function readonly(target, key, descriptor) {
  descriptor.writable = false;
  return descriptor;
}

function log(target, key, descriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args) {
    console.log(`Calling ${key} with`, args);
    const result = originalMethod.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };

  return descriptor;
}

class Math {
  @log
  @readonly
  add(a, b) {
    return a + b;
  }
}

// 函数装饰器（高阶函数）
function timing(fn) {
  return function(...args) {
    console.time('execution');
    const result = fn.apply(this, args);
    console.timeEnd('execution');
    return result;
  };
}

const slowFunction = timing(function(n) {
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += i;
  }
  return sum;
});
```

## 代理模式

为对象提供一个代理，以控制对这个对象的访问：

```js
// 虚拟代理 - 图片预加载
const myImage = (function() {
  const imgNode = document.createElement('img');
  document.body.appendChild(imgNode);

  return {
    setSrc(src) {
      imgNode.src = src;
    }
  };
})();

const proxyImage = (function() {
  const img = new Image();
  img.onload = function() {
    myImage.setSrc(this.src);
  };

  return {
    setSrc(src) {
      myImage.setSrc('loading.gif'); // 占位图
      img.src = src;
    }
  };
})();

proxyImage.setSrc('https://example.com/big-image.jpg');

// ES6 Proxy
const user = {
  name: 'Tom',
  age: 20
};

const proxyUser = new Proxy(user, {
  get(target, key) {
    console.log(`Getting ${key}`);
    return target[key];
  },
  set(target, key, value) {
    console.log(`Setting ${key} to ${value}`);
    target[key] = value;
    return true;
  }
});
```

## 高频面试题

### 1. 单例模式的应用场景？

- 全局状态管理（Redux Store、Vuex Store）
- 数据库连接池
- 缓存管理
- 日志记录器
- 配置管理器

### 2. 如何实现一个前端路由？

```js
// Hash 模式
class HashRouter {
  constructor() {
    this.routes = {};
    window.addEventListener('hashchange', this.render.bind(this));
  }

  route(path, callback) {
    this.routes[path] = callback;
  }

  render() {
    const path = location.hash.slice(1) || '/';
    const callback = this.routes[path];
    callback?.();
  }
}

// History 模式
class HistoryRouter {
  constructor() {
    this.routes = {};
    window.addEventListener('popstate', this.render.bind(this));
  }

  route(path, callback) {
    this.routes[path] = callback;
  }

  push(path) {
    history.pushState({}, '', path);
    this.render();
  }

  render() {
    const path = location.pathname;
    const callback = this.routes[path];
    callback?.();
  }
}
```

### 3. 如何设计一个组件库？

**答案要点**：
1. **目录结构**：清晰分离组件、样式、文档、测试
2. **样式方案**：CSS-in-JS、CSS Modules、BEM
3. **构建输出**：ESM、CJS、UMD 多格式
4. **类型支持**：TypeScript 定义文件
5. **主题系统**：CSS 变量、配置化
6. **文档站点**：Storybook、dumi
7. **测试覆盖**：单元测试、E2E 测试

---

> 📌 **持续更新中**，更多内容敬请期待...
