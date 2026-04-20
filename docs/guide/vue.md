# Vue 源码解析

深入剖析 Vue 2/3 核心源码，理解其设计思想与实现原理。

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

## 虚拟 DOM 与 Diff 算法

### 虚拟 DOM 结构

```js
// VNode 结构
const vnode = {
  tag: 'div',
  data: { id: 'app', class: 'container' },
  children: [
    { tag: 'h1', data: null, children: 'Hello Vue' },
    { tag: 'p', data: null, children: 'This is a paragraph' }
  ],
  text: null,
  elm: undefined // 真实 DOM 引用
};
```

### Vue 2 Diff 算法

```js
// 核心 diff 函数
function patch(oldVnode, vnode) {
  if (sameVnode(oldVnode, vnode)) {
    patchVnode(oldVnode, vnode);
  } else {
    const oldElm = oldVnode.elm;
    const parentElm = oldElm.parentNode;
    
    createElm(vnode);
    parentElm.insertBefore(vnode.elm, oldElm);
    parentElm.removeChild(oldElm);
  }
}

// 判断是否为相同节点
function sameVnode(a, b) {
  return (
    a.key === b.key &&
    a.tag === b.tag &&
    a.isComment === b.isComment &&
    isDef(a.data) === isDef(b.data)
  );
}

// 更新节点
function patchVnode(oldVnode, vnode) {
  const elm = vnode.elm = oldVnode.elm;
  
  if (oldVnode === vnode) return;
  
  if (vnode.text === undefined) {
    if (oldVnode.children && vnode.children) {
      if (oldVnode.children !== vnode.children) {
        updateChildren(elm, oldVnode.children, vnode.children);
      }
    }
  } else if (oldVnode.text !== vnode.text) {
    elm.textContent = vnode.text;
  }
}

// 双端比较更新子节点
function updateChildren(parentElm, oldCh, newCh) {
  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let newEndIdx = newCh.length - 1;
  
  // ... 双端比较逻辑
}
```

### Vue 3 Diff 优化

```js
// 静态提升 - 编译时优化
const _hoisted_1 = /*#__PURE__*/createVNode("div", null, "Static content", -1 /* HOISTED */);

// PatchFlag 标记动态节点
const _hoisted_2 = { class: "title" };

function render(_ctx, _cache) {
  return (openBlock(), createBlock("div", null, [
    _hoisted_1, // 静态节点，直接复用
    createVNode("div", _hoisted_2, _ctx.dynamicText, 1 /* TEXT */) // 只比对 text
  ]));
}
```

## 编译原理

### 模板编译流程

```
模板字符串 → 解析器(Parser) → AST → 优化器(Optimizer) → 代码生成器(CodeGen) → Render 函数
```

```js
// 简化版编译器
function compile(template) {
  // 1. 解析模板生成 AST
  const ast = parse(template);
  
  // 2. 标记静态节点
  optimize(ast);
  
  // 3. 生成渲染函数代码
  const code = generate(ast);
  
  return {
    render: new Function(code.render),
    staticRenderFns: code.staticRenderFns
  };
}
```

### AST 结构示例

```js
// 模板: <div id="app">{{ message }}</div>
const ast = {
  type: 1, // 元素节点
  tag: 'div',
  attrsList: [{ name: 'id', value: 'app' }],
  attrsMap: { id: 'app' },
  children: [{
    type: 2, // 表达式节点
    expression: '_s(message)',
    text: '{{ message }}'
  }],
  plain: false,
  static: false
};
```

## 组件化机制

### 组件注册

```js
// 全局注册
Vue.component('my-component', {
  template: '<div>Global Component</div>'
});

// 局部注册
const MyComponent = {
  template: '<div>Local Component</div>'
};

new Vue({
  components: {
    'my-component': MyComponent
  }
});
```

### 组件生命周期

```
Vue 2 生命周期:

创建阶段: beforeCreate → created
挂载阶段: beforeMount → mounted
更新阶段: beforeUpdate → updated
销毁阶段: beforeDestroy → destroyed

Vue 3 生命周期变化:
beforeDestroy → beforeUnmount
destroyed → unmounted
新增: renderTracked, renderTriggered (调试)
```

## 高频面试题

### 1. Vue 2 和 Vue 3 响应式原理的区别？

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 实现方式 | Object.defineProperty | Proxy |
| 数组监听 | 重写数组方法 | Proxy 原生支持 |
| 新增属性 | 需要 Vue.set | 直接支持 |
| 性能 | 初始化时递归劫持 | 懒代理，性能更好 |
| 兼容性 | IE9+ | IE 不支持 |

### 2. 为什么 Vue 3 使用 Proxy？

**优点**：
1. 可以监听动态新增的属性
2. 可以监听删除的属性
3. 可以监听数组索引和长度的变化
4. 懒代理，性能更好
5. 代码更简洁

### 3. Vue 的 Diff 算法是什么？

**答案**：Vue 使用**双端比较**的 Diff 算法，通过在新旧虚拟 DOM 的头部和尾部设置指针，进行四次比较，找出可复用的节点，最小化 DOM 操作。

**优化策略**：
- 同层比较，不跨层级
- 使用 key 优化列表渲染
- Vue 3 增加静态提升和 PatchFlag

### 4. nextTick 的原理？

```js
// nextTick 实现原理
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

### 5. computed 和 watch 的区别？

| 特性 | computed | watch |
|------|----------|-------|
| 用途 | 计算属性，缓存结果 | 监听变化，执行副作用 |
| 缓存 | 有缓存，依赖不变不重新计算 | 无缓存 |
| 适用场景 | 根据数据派生新数据 | 数据变化时执行异步或复杂操作 |
| 返回值 | 必须有返回值 | 不需要 |

---

> 📌 **持续更新中**，更多内容敬请期待...
