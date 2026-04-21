# Hooks 原理

Hooks 是 React 16.8 引入的新特性，让你在不编写 class 的情况下使用 state 和其他 React 特性。

## useState 实现

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

## useEffect 实现

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

## Hooks 使用规则

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

### 高频面试题

**Q: useEffect 和 useLayoutEffect 的区别？**

| 特性 | useEffect | useLayoutEffect |
|------|-----------|-----------------|
| 执行时机 | 渲染完成后异步执行 | 渲染完成后同步执行，在浏览器绘制之前 |
| 阻塞渲染 | 否 | 是 |
| 使用场景 | 大多数副作用 | DOM 测量、同步重绘 |

**Q: 为什么 Hooks 不能在条件语句中调用？**

**答案**：
- Hooks 依赖调用顺序来管理状态（通过链表索引）
- 条件语句会导致调用顺序不一致，引起状态错乱
- React 使用 hookIndex 来追踪每个 Hook，顺序必须保持一致
