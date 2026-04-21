# React 18 并发特性

React 18 引入了并发渲染机制，带来了更好的用户体验和性能。

## 核心特性

### 1. Automatic Batching（自动批量更新）

```jsx | pure
// React 17 - 只批处理 React 事件中的更新
setTimeout(() => {
  setCount(c => c + 1);  // 渲染
  setFlag(f => !f);      // 渲染
}, 0);

// React 18 - 所有更新都自动批处理
setTimeout(() => {
  setCount(c => c + 1);  // 不渲染
  setFlag(f => !f);      // 不渲染
  // React 会在最后批量更新，只渲染一次
}, 0);

// 如果需要同步刷新
import { flushSync } from 'react-dom';

setTimeout(() => {
  flushSync(() => {
    setCount(c => c + 1);  // 立即渲染
  });
  setFlag(f => !f);        // 再渲染一次
}, 0);
```

### 2. Concurrent Rendering（并发渲染）

```jsx | pure
// React 18 使用 createRoot 开启并发模式
import { createRoot } from 'react-dom/client';

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);
```

**并发渲染的优势**：
- 可中断和恢复渲染
- 支持优先级调度
- 提升用户交互响应速度

### 3. useTransition

```jsx | pure
import { useTransition, useState } from 'react';

function SearchPage() {
  const [isPending, startTransition] = useTransition();
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  function handleChange(e) {
    // 紧急更新 - 立即执行
    setInputValue(e.target.value);
    
    // 过渡更新 - 低优先级
    startTransition(() => {
      setSearchQuery(e.target.value);
    });
  }
  
  return (
    <div>
      <input value={inputValue} onChange={handleChange} />
      {isPending && <span>加载中...</span>}
      <SearchResults query={searchQuery} />
    </div>
  );
}
```

### 4. useDeferredValue

```jsx | pure
import { useDeferredValue, useState } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  // 延迟更新 searchQuery
  const deferredQuery = useDeferredValue(query);
  
  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <SearchResults query={deferredQuery} />
    </div>
  );
}
```

**useTransition vs useDeferredValue**：
- **useTransition**：包装状态更新，标记为过渡更新
- **useDeferredValue**：延迟某个值，保持 UI 响应性

### 5. Suspense 改进

```jsx | pure
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Suspense fallback={<LoadingDetails />}>
        <Details />
      </Suspense>
    </Suspense>
  );
}
```

### 6. useId

```jsx | pure
import { useId } from 'react';

function Checkbox() {
  // 生成唯一的 ID，服务端和客户端一致
  const id = useId();
  
  return (
    <>
      <label htmlFor={id}>Accept terms</label>
      <input id={id} type="checkbox" />
    </>
  );
}
```

### 高频面试题

**Q: React 18 的并发特性有哪些？**

**答案**：
1. **Automatic Batching**：自动批量处理状态更新
2. **Concurrent Rendering**：并发渲染，可中断和恢复
3. **Suspense**：更好的异步处理
4. **Transitions**：区分紧急更新和过渡更新
5. **useId**：生成唯一 ID
6. **useDeferredValue**：延迟更新非紧急部分

**Q: useTransition 和 useDeferredValue 的区别？**

**答案**：
- **useTransition**：主动标记某个更新为低优先级
- **useDeferredValue**：被动延迟某个值的更新
- 两者都用于区分紧急和非紧急更新
