# 性能优化

React 性能优化是提升用户体验的关键环节。

## React.memo

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

## useMemo 与 useCallback

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

## 代码分割

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

## 性能优化策略

### 1. 组件级别优化
- **React.memo**：避免函数组件不必要的渲染
- **shouldComponentUpdate**：控制类组件是否更新
- **PureComponent**：自动浅比较 props 和 state

### 2. Hooks 优化
- **useMemo**：缓存计算结果
- **useCallback**：缓存函数引用
- **useRef**：存储不触发渲染的值

### 3. 渲染优化
- **虚拟化列表**：只渲染可视区域的内容
- **代码分割**：按需加载组件
- **懒加载**：延迟加载非关键组件

### 4. 状态管理优化
- **合理拆分状态**：避免全局状态过大
- **选择器优化**：只订阅需要的状态
- **批量更新**：合并多个状态更新

### 高频面试题

**Q: React 性能优化有哪些手段？**

**答案**：
1. **组件优化**：React.memo、PureComponent、shouldComponentUpdate
2. **Hooks 优化**：useMemo、useCallback、useRef
3. **渲染优化**：虚拟列表、代码分割、懒加载
4. **状态优化**：合理拆分状态、选择器优化
5. **其他**：避免内联函数/对象、使用 key 优化列表

**Q: useMemo 和 useCallback 的区别？**

**答案**：
- **useMemo**：缓存计算结果（值）
- **useCallback**：缓存函数引用（函数）
- 两者都依赖依赖数组来决定是否更新缓存
