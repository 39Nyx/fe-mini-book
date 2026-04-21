# React 原理

深入理解 React 核心机制，掌握 Fiber 架构、Hooks 原理与性能优化。

## 目录

| 模块 | 说明 | 链接 |
|------|------|------|
| **JSX 与虚拟 DOM** | JSX 编译、虚拟 DOM 创建与优势 | [查看](/react/jsx-vdom) |
| **Fiber 架构** | Fiber 节点结构、遍历算法、Diff 协调 | [查看](/react/fiber) |
| **Hooks 原理** | useState、useEffect 实现与使用规则 | [查看](/react/hooks) |
| **状态管理** | Context API、useReducer、setState 机制 | [查看](/react/state-management) |
| **性能优化** | React.memo、useMemo、代码分割 | [查看](/react/performance) |
| **React 18 并发特性** | 自动批量更新、并发渲染、Transitions | [查看](/react/concurrent) |

## 知识地图

```
React 原理
├── JSX 与虚拟 DOM
│   ├── JSX 编译
│   ├── 虚拟 DOM 创建
│   └── 虚拟 DOM 优势
├── Fiber 架构
│   ├── Fiber 节点结构
│   ├── 遍历算法
│   └── Reconciliation
├── Hooks 原理
│   ├── useState 实现
│   ├── useEffect 实现
│   └── 使用规则
├── 状态管理
│   ├── Context API
│   ├── useReducer
│   └── setState 机制
├── 性能优化
│   ├── React.memo
│   ├── useMemo/useCallback
│   └── 代码分割
└── React 18 并发特性
    ├── Automatic Batching
    ├── Concurrent Rendering
    ├── useTransition
    └── useDeferredValue
```

## 学习建议

1. **理解虚拟 DOM**：掌握 JSX 编译和虚拟 DOM 的工作机制
2. **深入 Fiber 架构**：理解可中断渲染和优先级调度
3. **掌握 Hooks 原理**：了解 useState 和 useEffect 的实现机制
4. **学会性能优化**：熟练使用 memo、useMemo、useCallback
5. **了解 React 18**：掌握并发特性和新的 API

## 高频面试题精选

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
