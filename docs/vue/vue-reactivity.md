# Vue 响应式原理

Vue 的响应式系统是其最核心的特性，Vue 2 和 Vue 3 采用了不同的实现方案。

## Vue 2 响应式原理

### Object.defineProperty

Vue 2 使用 `Object.defineProperty` 实现数据劫持：

```js
function defineReactive(obj, key, val) {
  // 递归处理嵌套对象
  observe(val);

  const dep = new Dep();

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      // 依赖收集
      if (Dep.target) {
        dep.depend();
      }
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      val = newVal;
      // 派发更新
      dep.notify();
    }
  });
}
```

### 依赖收集与派发更新

```js
// Dep 类：管理依赖
class Dep {
  constructor() {
    this.subs = []; // 存储 Watcher
  }

  addSub(sub) {
    this.subs.push(sub);
  }

  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }

  notify() {
    // 通知所有 Watcher 更新
    this.subs.forEach(sub => sub.update());
  }
}

// Watcher 类：观察者
class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm;
    this.getter = expOrFn;
    this.cb = cb;
    this.value = this.get();
  }

  get() {
    Dep.target = this;
    const value = this.getter.call(this.vm);
    Dep.target = null;
    return value;
  }

  update() {
    const oldValue = this.value;
    this.value = this.get();
    this.cb.call(this.vm, this.value, oldValue);
  }
}
```

### 数组响应式处理

```js
// 重写数组方法
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);

['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(method => {
  const original = arrayProto[method];
  Object.defineProperty(arrayMethods, method, {
    value: function mutator(...args) {
      const result = original.apply(this, args);
      const ob = this.__ob__;
      // 派发更新
      ob.dep.notify();
      return result;
    },
    enumerable: false,
    writable: true,
    configurable: true
  });
});
```

## Vue 3 响应式原理

### Proxy 代理

Vue 3 使用 `Proxy` 替代 `Object.defineProperty`：

```js
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      // 依赖收集
      track(target, key);
      // 递归代理
      if (isObject(result)) {
        return reactive(result);
      }
      return result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      // 触发更新
      if (oldValue !== value) {
        trigger(target, key);
      }
      return result;
    },
    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(target, key);
      trigger(target, key);
      return result;
    }
  });
}
```

### effect 与依赖追踪

```js
// 全局变量
let activeEffect = null;
const targetMap = new WeakMap();

// effect 函数
function effect(fn, options = {}) {
  const effectFn = () => {
    try {
      activeEffect = effectFn;
      return fn();
    } finally {
      activeEffect = null;
    }
  };

  if (!options.lazy) {
    effectFn();
  }

  return effectFn;
}

// 依赖收集
function track(target, key) {
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  dep.add(activeEffect);
}

// 触发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effectFn => effectFn());
  }
}
```

### ref 实现

```js
function ref(value) {
  return {
    __v_isRef: true,
    _value: value,
    get value() {
      track(this, 'value');
      return this._value;
    },
    set value(newVal) {
      if (newVal !== this._value) {
        this._value = newVal;
        trigger(this, 'value');
      }
    }
  };
}

// 使用
const count = ref(0);
console.log(count.value); // 0
count.value++;            // 触发更新
```

## Vue 2 vs Vue 3 响应式对比

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 实现方式 | Object.defineProperty | Proxy |
| 数组监听 | 重写数组方法 | Proxy 原生支持 |
| 新增属性 | 需要 Vue.set | 直接支持 |
| 删除属性 | 需要 Vue.delete | 直接支持 |
| 性能 | 初始化时递归劫持 | 懒代理，性能更好 |
| 兼容性 | IE9+ | IE 不支持 |

## 高频面试题

### 1. 为什么 Vue 3 使用 Proxy？

1. 可以监听动态新增的属性
2. 可以监听删除的属性
3. 可以监听数组索引和长度的变化
4. 懒代理，性能更好
5. 代码更简洁

### 2. nextTick 的原理？

```js
let callbacks = [];
let pending = false;

function nextTick(cb) {
  callbacks.push(cb);

  if (!pending) {
    pending = true;
    // 优先使用微任务
    Promise.resolve().then(flushCallbacks);
  }
}

function flushCallbacks() {
  pending = false;
  const copies = callbacks.slice(0);
  callbacks.length = 0;
  copies.forEach(cb => cb());
}
```

---

> 📌 **持续更新中**，更多内容敬请期待...
