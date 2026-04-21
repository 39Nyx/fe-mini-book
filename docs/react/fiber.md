# Fiber 架构

Fiber 是 React 16 引入的核心架构，实现了可中断渲染和优先级调度。

## 为什么需要 Fiber？

React 15 使用递归遍历虚拟 DOM，存在以下问题：
- 渲染任务无法中断，阻塞主线程
- 动画卡顿，用户交互无响应
- 无法优先级调度

**Fiber 解决方案**：
- 将渲染工作拆分成小单元
- 可中断和恢复
- 支持优先级调度

## Fiber 节点结构

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

## Fiber 遍历算法

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

## Reconciliation（协调）

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

### 高频面试题

**Q: 什么是 Fiber？解决了什么问题？**

**答案**：Fiber 是 React 16 引入的新的协调引擎，主要解决以下问题：

1. **可中断渲染**：将渲染工作拆分成小单元，可暂停和恢复
2. **优先级调度**：高优先级任务（用户输入）可以打断低优先级任务（列表渲染）
3. **更好的错误处理**：引入了错误边界

**Fiber 是一个链表结构**，包含 `child`、`sibling`、`return` 指针，支持深度优先遍历。

**Q: React 的 Diff 算法是什么？**

**答案**：React 使用**单端比较**的 Diff 算法：

1. **同层比较**：只比较同一层级的节点
2. **key 优化**：通过 key 识别哪些元素改变了
3. **三种操作**：UPDATE（更新）、PLACEMENT（插入）、DELETION（删除）

**时间复杂度从 O(n³) 降到 O(n)**。
