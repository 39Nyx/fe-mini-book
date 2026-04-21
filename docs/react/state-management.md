# 状态管理

React 提供了多种状态管理方案，从组件内状态到全局状态。

## Context API

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

## useReducer

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

## setState 机制

### 高频面试题

**Q: setState 是同步还是异步的？**

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

**Q: Context API 的使用场景？**

**答案**：
- 全局状态管理（主题、用户信息、语言）
- 避免 prop drilling（逐层传递）
- 适合低频更新的数据

**注意事项**：
- Context 会导致所有 Consumer 重新渲染
- 频繁更新的数据不适合使用 Context
- 可以结合 useMemo 优化性能
