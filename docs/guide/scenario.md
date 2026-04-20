# 场景题与设计模式

场景题考察综合能力，设计模式是写出可维护代码的基础。

## 常见场景题

### 1. 实现一个 Modal 对话框组件

```jsx | pure
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Modal 组件
function Modal({ visible, title, children, onOk, onCancel, footer }) {
  const [isClosing, setIsClosing] = useState(false);
  
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onCancel?.();
    }, 300);
  };
  
  if (!visible && !isClosing) return null;
  
  const modalContent = (
    <div 
      className={`modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleClose}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer !== null && (
          <div className="modal-footer">
            {footer || (
              <>
                <button onClick={handleClose}>取消</button>
                <button onClick={onOk}>确定</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
  
  return createPortal(modalContent, document.body);
}

// 使用 Hook 封装
function useModal() {
  const [visible, setVisible] = useState(false);
  
  return {
    visible,
    open: () => setVisible(true),
    close: () => setVisible(false),
    Modal: (props) => <Modal {...props} visible={visible} onCancel={() => setVisible(false)} />
  };
}
```

### 2. 实现一个虚拟列表

```jsx | pure
import React, { useState, useRef, useCallback, useEffect } from 'react';

function VirtualList({ items, itemHeight, height, renderItem }) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  
  // 可视区域能显示的条目数
  const visibleCount = Math.ceil(height / itemHeight);
  // 总高度
  const totalHeight = items.length * itemHeight;
  // 起始索引
  const startIndex = Math.floor(scrollTop / itemHeight);
  // 结束索引
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length);
  // 偏移量
  const offsetY = startIndex * itemHeight;
  
  const visibleItems = items.slice(startIndex, endIndex);
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);
  
  return (
    <div 
      ref={containerRef}
      style={{ height, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 使用
function App() {
  const items = Array.from({ length: 10000 }, (_, i) => `Item ${i}`);
  
  return (
    <VirtualList
      items={items}
      itemHeight={50}
      height={400}
      renderItem={(item) => <div>{item}</div>}
    />
  );
}
```

### 3. 实现一个拖拽排序列表

```jsx | pure
import React, { useState, useRef } from 'react';

function DraggableList({ items: initialItems, onChange }) {
  const [items, setItems] = useState(initialItems);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragItem = useRef(null);
  
  const handleDragStart = (index) => {
    dragItem.current = index;
    setDraggingIndex(index);
  };
  
  const handleDragEnter = (index) => {
    if (dragItem.current === index) return;
    setDragOverIndex(index);
  };
  
  const handleDragEnd = () => {
    if (dragOverIndex !== null && dragItem.current !== null) {
      const newItems = [...items];
      const [removed] = newItems.splice(dragItem.current, 1);
      newItems.splice(dragOverIndex, 0, removed);
      setItems(newItems);
      onChange?.(newItems);
    }
    setDraggingIndex(null);
    setDragOverIndex(null);
    dragItem.current = null;
  };
  
  return (
    <ul className="draggable-list">
      {items.map((item, index) => (
        <li
          key={item.id}
          draggable
          className={`
            ${draggingIndex === index ? 'dragging' : ''}
            ${dragOverIndex === index ? 'drag-over' : ''}
          `}
          onDragStart={() => handleDragStart(index)}
          onDragEnter={() => handleDragEnter(index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()}
        >
          {item.content}
        </li>
      ))}
    </ul>
  );
}
```

### 4. 实现一个无限滚动列表

```jsx | pure
import React, { useState, useEffect, useRef, useCallback } from 'react';

function InfiniteScroll({ fetchData, renderItem, hasMore }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const observerRef = useRef(null);
  const lastItemRef = useRef(null);
  
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const newItems = await fetchData(page);
      setItems(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchData]);
  
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    return () => observerRef.current?.disconnect();
  }, [loadMore]);
  
  useEffect(() => {
    if (lastItemRef.current) {
      observerRef.current?.observe(lastItemRef.current);
    }
  }, [items]);
  
  return (
    <div className="infinite-scroll">
      {items.map((item, index) => (
        <div 
          key={item.id} 
          ref={index === items.length - 1 ? lastItemRef : null}
        >
          {renderItem(item)}
        </div>
      ))}
      {loading && <div className="loading">加载中...</div>}
      {!hasMore && <div className="no-more">没有更多了</div>}
    </div>
  );
}
```

### 5. 实现一个文件上传组件

```jsx | pure
import React, { useState, useRef } from 'react';

function FileUploader({ 
  accept, 
  multiple = false, 
  maxSize = 5 * 1024 * 1024,
  onUpload 
}) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  
  const validateFile = (file) => {
    if (file.size > maxSize) {
      return `文件 ${file.name} 超过大小限制`;
    }
    if (accept && !accept.split(',').some(type => file.type.match(type.trim()))) {
      return `文件 ${file.name} 格式不支持`;
    }
    return null;
  };
  
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const errors = [];
    const validFiles = [];
    
    selectedFiles.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push({
          file,
          id: Math.random().toString(36).substr(2, 9),
          progress: 0,
          status: 'pending'
        });
      }
    });
    
    if (errors.length) {
      alert(errors.join('\n'));
    }
    
    setFiles(prev => multiple ? [...prev, ...validFiles] : validFiles);
  };
  
  const uploadFile = async (fileItem) => {
    const formData = new FormData();
    formData.append('file', fileItem.file);
    
    try {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'uploading' } : f
      ));
      
      await onUpload?.(formData, (progress) => {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, progress } : f
        ));
      });
      
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'done', progress: 100 } : f
      ));
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'error' } : f
      ));
    }
  };
  
  const handleUpload = async () => {
    setUploading(true);
    const pendingFiles = files.filter(f => f.status === 'pending');
    await Promise.all(pendingFiles.map(uploadFile));
    setUploading(false);
  };
  
  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };
  
  return (
    <div className="file-uploader">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <div 
        className="upload-area"
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileChange({ target: { files: e.dataTransfer.files } });
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <p>点击或拖拽文件到此处上传</p>
        <p className="hint">支持 {accept} 格式，单个文件不超过 {maxSize / 1024 / 1024}MB</p>
      </div>
      
      {files.length > 0 && (
        <div className="file-list">
          {files.map(file => (
            <div key={file.id} className={`file-item ${file.status}`}>
              <span className="file-name">{file.file.name}</span>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${file.progress}%` }} />
              </div>
              <span className="file-status">{file.status}</span>
              <button onClick={() => removeFile(file.id)}>删除</button>
            </div>
          ))}
        </div>
      )}
      
      <button 
        onClick={handleUpload} 
        disabled={uploading || files.length === 0}
      >
        {uploading ? '上传中...' : '开始上传'}
      </button>
    </div>
  );
}
```

## 设计模式

### 单例模式

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

### 工厂模式

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

### 观察者模式

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

### 发布订阅模式

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

### 策略模式

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

### 装饰器模式

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

### 代理模式

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

### 1. 观察者模式和发布订阅模式的区别？

**答案**：
- **观察者模式**：Subject 和 Observer 直接通信，耦合度较高
- **发布订阅模式**：通过事件中心通信，发布者和订阅者完全解耦

### 2. 单例模式的应用场景？

**答案**：
- 全局状态管理（Redux Store、Vuex Store）
- 数据库连接池
- 缓存管理
- 日志记录器
- 配置管理器

### 3. 如何实现一个前端路由？

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

### 4. 如何设计一个组件库？

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
