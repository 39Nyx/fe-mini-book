# React 原理

深入理解 React 核心机制，掌握 Fiber 架构、Hooks 原理与性能优化。

## JSX 与虚拟 DOM

### JSX 编译

```jsx | pure
// JSX 代码
const element = <h1 className="title">Hello, React!</h1>;

// 编译后
const element = React.createElement(
  'h1',
  { className: 'title' },
  'Hello, React!'
);

// 返回的虚拟 DOM
const element = {
  type: 'h1',
  props: {
    className: 'title',
    children: 'Hello, React!'
  },
  key: null,
  ref: null
};
```

### 虚拟 DOM 创建

```js
function createElement(type, config, ...children) {
  const props = {};
  let key = null;
  let ref = null;
  
  if (config != null) {
    key = config.key;
    ref = config.ref;
    
    for (const prop in config) {
      if (prop !== 'key' && prop !== 'ref') {
        props[prop] = config[prop];
      }
    }
  }
  
  props.children = children.map(child => 
    typeof child === 'object' ? child : createTextElement(child)
  );
  
  return { type, props, key, ref };
}
```

## Fiber 架构

### 为什么需要 Fiber？

React 15 使用递归遍历虚拟 DOM，存在以下问题：
- 渲染任务无法中断，阻塞主线程
- 动画卡顿，用户交互无响应
- 无法优先级调度

**Fiber 解决方案**：
- 将渲染工作拆分成小单元
- 可中断和恢复
- 支持优先级调度

### Fiber 节点结构

```js
const fiber = {
  // 类型信息
  type: 'div', // 组件类型或 HTML 标签
  key: null,
  
  // 构建关系
  return: parentFiber,    // 父节点
  child: firstChildFiber, // 第一个子节点
  sibling: nextFiber,     // 下一个兄弟节点
  
  // 状态
  pendingProps: {}, // 新 props
  memoizedProps: {}, // 当前 props
  memoizedState: {}, // 当前 state
  
  // 副作用
  effectTag: 'PLACEMENT', // UPDATE | DELETION | PLACEMENT
  nextEffect: null,       // 下一个副作用节点
  firstEffect: null,      // 第一个副作用子节点
  lastEffect: null,       // 最后一个副作用子节点
  
  // 真实 DOM
  stateNode: domNode // 对应的真实 DOM
};
```

### Fiber 遍历算法

```js
// 深度优先遍历，可中断
function workLoop(deadline) {
  let shouldYield = false;
  
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  
  requestIdleCallback(workLoop);
}

function performUnitOfWork(fiber) {
  // 1. 创建 DOM
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  
  // 2. 创建子 Fiber
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);
  
  // 3. 返回下一个工作单元
  if (fiber.child) {
    return fiber.child;
  }
  
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.return;
  }
}
```

### Reconciliation（协调）

```js
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;
  
  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;
    
    const sameType = oldFiber && element && element.type === oldFiber.type;
    
    if (sameType) {
      // 更新节点
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE'
      };
    }
    
    if (element && !sameType) {
      // 新增节点
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT'
      };
    }
    
    if (oldFiber && !sameType) {
      // 删除节点
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }
    
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    
    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }
    
    prevSibling = newFiber;
    index++;
  }
}
```

## Hooks 原理

### useState 实现

```js
// 简化版 useState 实现
let hookIndex = 0;
const hooks = [];

function useState(initialValue) {
  const state = hooks[hookIndex] || initialValue;
  hooks[hookIndex] = state;
  
  const _index = hookIndex;
  hookIndex++;
  
  const setState = (newValue) => {
    hooks[_index] = newValue;
    // 触发重新渲染
    render();
  };
  
  return [state, setState];
}

// 实际 React 中的链表实现
function mountState(initialState) {
  const hook = mountWorkInProgressHook();
  
  if (typeof initialState === 'function') {
    initialState = initialState();
  }
  
  hook.memoizedState = hook.baseState = initialState;
  hook.queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState
  };
  
  const dispatch = dispatchAction.bind(
    null,
    currentlyRenderingFiber,
    hook.queue
  );
  
  hook.queue.dispatch = dispatch;
  return [hook.memoizedState, dispatch];
}
```

### useEffect 实现

```js
function useEffect(effect, deps) {
  const oldHook = 
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  
  const hasChanged = deps
    ? !deps.every((dep, i) => dep === oldHook.deps[i])
    : true;
  
  const hook = {
    effect: hasChanged ? effect : null,
    cleanup: oldHook ? oldHook.cleanup : null,
    deps
  };
  
  wipFiber.hooks.push(hook);
  hookIndex++;
}

// 执行副作用
function commitEffects() {
  hooks.forEach(hook => {
    if (hook.cleanup) {
      hook.cleanup();
    }
    if (hook.effect) {
      hook.cleanup = hook.effect();
    }
  });
}
```

### Hooks 使用规则

```jsx
function MyComponent() {
  // ✅ 正确：在顶层调用
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // 副作用逻辑
  }, []);
  
  if (condition) {
    // ❌ 错误：不要在条件语句中调用
    // const [state, setState] = useState(0);
  }
  
  for (let i = 0; i < 10; i++) {
    // ❌ 错误：不要在循环中调用
    // const [state, setState] = useState(0);
  }
  
  return <div>{count}</div>;
}
```

## 状态管理

### Context API

```jsx
// 创建 Context
const ThemeContext = React.createContext('light');

// Provider
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// Consumer
function Toolbar() {
  return (
    <ThemeContext.Consumer>
      {theme => <div>Current theme: {theme}</div>}
    </ThemeContext.Consumer>
  );
}

// useContext Hook
function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click me</button>;
}
```

### useReducer

```jsx
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
    </>
  );
}
```

## 性能优化

### React.memo

```jsx | pure
// 函数组件默认每次渲染都执行
function MyComponent({ name }) {
  return <div>{name}</div>;
}

// 使用 React.memo 避免不必要的渲染
const MemoizedComponent = React.memo(MyComponent);

// 自定义比较函数
const MemoizedComponent = React.memo(MyComponent, (prevProps, nextProps) => {
  return prevProps.name === nextProps.name;
});
```

### useMemo 与 useCallback

```jsx | pure
function ExpensiveComponent({ data, onUpdate }) {
  // 缓存计算结果
  const processedData = useMemo(() => {
    return data.map(item => expensiveOperation(item));
  }, [data]);
  
  // 缓存函数引用
  const handleClick = useCallback(() => {
    onUpdate(processedData);
  }, [onUpdate, processedData]);
  
  return <ChildComponent data={processedData} onClick={handleClick} />;
}
```

### 代码分割

```jsx | pure
// React.lazy 动态导入
const OtherComponent = React.lazy(() => import('./OtherComponent'));

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OtherComponent />
    </Suspense>
  );
}
```

## 高频面试题

### 1. 什么是 Fiber？解决了什么问题？

**答案**：Fiber 是 React 16 引入的新的协调引擎，主要解决以下问题：

1. **可中断渲染**：将渲染工作拆分成小单元，可暂停和恢复
2. **优先级调度**：高优先级任务（用户输入）可以打断低优先级任务（列表渲染）
3. **更好的错误处理**：引入了错误边界

**Fiber 是一个链表结构**，包含 `child`、`sibling`、`return` 指针，支持深度优先遍历。

### 2. React 的 Diff 算法是什么？

**答案**：React 使用**单端比较**的 Diff 算法：

1. **同层比较**：只比较同一层级的节点
2. **key 优化**：通过 key 识别哪些元素改变了
3. **三种操作**：UPDATE（更新）、PLACEMENT（插入）、DELETION（删除）

**时间复杂度从 O(n³) 降到 O(n)**。

### 3. setState 是同步还是异步的？

**答案**：**既可能是同步也可能是异步**：

- **异步情况**：React 合成事件、生命周期函数中（批量更新）
- **同步情况**：setTimeout、原生事件、Promise 回调中

```jsx | pure
// 异步
onClick = () => {
  this.setState({ count: this.state.count + 1 });
  console.log(this.state.count); // 旧值
};

// 同步
onClick = () => {
  setTimeout(() => {
    this.setState({ count: this.state.count + 1 });
    console.log(this.state.count); // 新值
  }, 0);
};
```

### 4. useEffect 和 useLayoutEffect 的区别？

| 特性 | useEffect | useLayoutEffect |
|------|-----------|-----------------|
| 执行时机 | 渲染完成后异步执行 | 渲染完成后同步执行，在浏览器绘制之前 |
| 阻塞渲染 | 否 | 是 |
| 使用场景 | 大多数副作用 | DOM 测量、同步重绘 |

### 5. React 18 的并发特性有哪些？

1. **Automatic Batching**：自动批量处理状态更新
2. **Concurrent Rendering**：并发渲染，可中断和恢复
3. **Suspense**：更好的异步处理
4. **Transitions**：区分紧急更新和过渡更新
5. **useId**：生成唯一 ID
6. **useDeferredValue**：延迟更新非紧急部分

```jsx | pure
// useTransition
const [isPending, startTransition] = useTransition();

function handleChange(e) {
  // 紧急更新
  setInputValue(e.target.value);
  
  // 过渡更新
  startTransition(() => {
    setSearchQuery(e.target.value);
  });
}
```

---

> 📌 **持续更新中**，更多内容敬请期待...
