# 事件机制手写实现

事件驱动是前端开发的核心模式，理解事件机制的底层实现非常重要。

## 事件总线（Event Bus）

实现一个轻量级的事件发布订阅系统，常用于组件间通信：

```js
class EventEmitter {
  constructor() {
    this.events = {};
  }

  // 订阅事件
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return this;
  }

  // 订阅一次，触发后自动取消
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

  // 发布事件
  emit(event, ...args) {
    if (!this.events[event]) return this;
    this.events[event].forEach(callback => {
      callback.apply(this, args);
    });
    return this;
  }

  // 获取监听器数量
  listenerCount(event) {
    return this.events[event]?.length || 0;
  }

  // 获取所有事件名
  eventNames() {
    return Object.keys(this.events);
  }
}

// 使用示例
const bus = new EventEmitter();

// 订阅
bus.on('message', data => {
  console.log('收到消息:', data);
});

bus.once('init', () => {
  console.log('初始化完成（只执行一次）');
});

// 发布
bus.emit('message', 'Hello World');
bus.emit('init');
bus.emit('init'); // 不会再次触发
```

## 自定义事件（浏览器环境）

使用原生 CustomEvent 实现：

```js
class CustomEventEmitter {
  constructor() {
    this.target = document.createElement('div');
  }

  on(event, callback) {
    this.target.addEventListener(event, callback);
    return this;
  }

  off(event, callback) {
    this.target.removeEventListener(event, callback);
    return this;
  }

  emit(event, data) {
    const customEvent = new CustomEvent(event, { detail: data });
    this.target.dispatchEvent(customEvent);
    return this;
  }
}

// 使用
const emitter = new CustomEventEmitter();
emitter.on('user-login', (e) => {
  console.log('用户登录:', e.detail);
});
emitter.emit('user-login', { userId: 123, name: 'Tom' });
```

## 事件委托实现

```js
function delegate(parent, eventType, selector, callback) {
  parent.addEventListener(eventType, (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) {
      callback.call(target, e);
    }
  });
}

// 使用
delegate(document.getElementById('list'), 'click', 'li', function(e) {
  console.log('点击了:', this.textContent);
});
```

## 高频面试题

### 1. 观察者模式和发布订阅模式的区别？

| 特性 | 观察者模式 | 发布订阅模式 |
|------|-----------|-------------|
| 耦合度 | _subject 和 observer 直接关联 | 完全解耦，通过事件中心通信 |
| 通信方式 | 直接调用 | 间接通过事件中心 |
| 灵活性 | 较低 | 较高 |
| 典型应用 | Vue 响应式 | Event Bus、Node.js EventEmitter |

### 2. 事件委托的原理和优点？

**原理**：利用事件冒泡机制，将事件监听器绑定到父元素上，通过 `event.target` 判断实际触发元素。

**优点**：
1. 减少内存占用（只需一个监听器）
2. 动态元素也能响应事件
3. 简化代码，易于维护

### 3. 如何实现一个.once 方法？

**思路**：包装原始回调，执行时先移除自身再执行原回调：

```js
once(event, callback) {
  const onceCallback = (...args) => {
    this.off(event, onceCallback); // 先移除
    callback.apply(this, args);     // 再执行
  };
  return this.on(event, onceCallback);
}
```

---

> 📌 **持续更新中**，更多内容敬请期待...
