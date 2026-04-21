# JSX 与虚拟 DOM

JSX 是 React 的核心语法，虚拟 DOM 是 React 性能优化的基础。

## JSX 编译

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

## 虚拟 DOM 创建

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

## 虚拟 DOM 的优势

1. **性能优化**：通过 Diff 算法减少真实 DOM 操作
2. **跨平台**：虚拟 DOM 可以渲染到不同平台（Web、Native、SSR）
3. **开发体验**：JSX 提供了更好的代码可读性

### 高频面试题

**Q: 什么是虚拟 DOM？有什么优势？**

**答案**：
- **虚拟 DOM**：用 JavaScript 对象描述真实 DOM 结构的轻量级表示
- **优势**：
  - 减少真实的 DOM 操作，提高性能
  - 支持跨平台渲染
  - 提供声明式的编程方式
