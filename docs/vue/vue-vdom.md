# Vue 虚拟 DOM 与 Diff 算法

虚拟 DOM 是 Vue 实现高效更新的核心机制，Diff 算法则负责最小化真实 DOM 操作。

## 虚拟 DOM 结构

### VNode 定义

```js
// VNode 结构
const vnode = {
  tag: 'div',
  data: { id: 'app', class: 'container' },
  children: [
    { tag: 'h1', data: null, children: 'Hello Vue' },
    { tag: 'p', data: null, children: 'This is a paragraph' }
  ],
  text: null,
  elm: undefined // 真实 DOM 引用
};
```

虚拟 DOM 的优点：
1. **跨平台**：可以渲染到浏览器、Weex、小程序等不同平台
2. **性能优化**：通过 Diff 算法减少直接操作 DOM 的次数
3. **开发体验**：声明式编程，不用手动操作 DOM

## Vue 2 Diff 算法

### 核心 patch 函数

```js
function patch(oldVnode, vnode) {
  if (sameVnode(oldVnode, vnode)) {
    patchVnode(oldVnode, vnode);
  } else {
    const oldElm = oldVnode.elm;
    const parentElm = oldElm.parentNode;

    createElm(vnode);
    parentElm.insertBefore(vnode.elm, oldElm);
    parentElm.removeChild(oldElm);
  }
}

// 判断是否为相同节点
function sameVnode(a, b) {
  return (
    a.key === b.key &&
    a.tag === b.tag &&
    a.isComment === b.isComment &&
    isDef(a.data) === isDef(b.data)
  );
}

// 更新节点
function patchVnode(oldVnode, vnode) {
  const elm = vnode.elm = oldVnode.elm;

  if (oldVnode === vnode) return;

  if (vnode.text === undefined) {
    if (oldVnode.children && vnode.children) {
      if (oldVnode.children !== vnode.children) {
        updateChildren(elm, oldVnode.children, vnode.children);
      }
    }
  } else if (oldVnode.text !== vnode.text) {
    elm.textContent = vnode.text;
  }
}
```

### 双端比较 Diff

Vue 2 使用**双端比较**算法，设置四个指针：

```js
function updateChildren(parentElm, oldCh, newCh) {
  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let newEndIdx = newCh.length - 1;
  let oldStartVnode = oldCh[0];
  let oldEndVnode = oldCh[oldEndIdx];
  let newStartVnode = newCh[0];
  let newEndVnode = newCh[newEndIdx];

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // 1. oldStartVnode 和 newStartVnode 比较
    if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    }
    // 2. oldEndVnode 和 newEndVnode 比较
    else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    }
    // 3. oldStartVnode 和 newEndVnode 比较
    else if (sameVnode(oldStartVnode, newEndVnode)) {
      patchVnode(oldStartVnode, newEndVnode);
      parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling);
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    }
    // 4. oldEndVnode 和 newStartVnode 比较
    else if (sameVnode(oldEndVnode, newStartVnode)) {
      patchVnode(oldEndVnode, newStartVnode);
      parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    }
    // 5. 以上都不匹配，暴力查找
    else {
      // 创建 key 到索引的映射
      const oldKeyToIdx = {};
      for (let i = oldStartIdx; i <= oldEndIdx; i++) {
        const key = oldCh[i].key;
        if (key) oldKeyToIdx[key] = i;
      }
      // 在旧节点中查找新节点的位置
      const idxInOld = oldKeyToIdx[newStartVnode.key];
      if (idxInOld === undefined) {
        // 是新节点，插入
        parentElm.insertBefore(createElm(newStartVnode), oldStartVnode.elm);
      } else {
        // 移动旧节点
        const vnodeToMove = oldCh[idxInOld];
        patchVnode(vnodeToMove, newStartVnode);
        parentElm.insertBefore(vnodeToMove.elm, oldStartVnode.elm);
        oldCh[idxInOld] = undefined; // 标记为已处理
      }
      newStartVnode = newCh[++newStartIdx];
    }
  }

  // 处理剩余节点
  if (oldStartIdx > oldEndIdx) {
    // 新节点有剩余，插入
    const refElm = newCh[newEndIdx + 1] ? newCh[newEndIdx + 1].elm : null;
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      parentElm.insertBefore(createElm(newCh[i]), refElm);
    }
  } else if (newStartIdx > newEndIdx) {
    // 旧节点有剩余，删除
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      if (oldCh[i]) {
        parentElm.removeChild(oldCh[i].elm);
      }
    }
  }
}
```

## Vue 3 Diff 优化

### 静态提升

编译时识别静态节点，避免重复创建：

```js
// 编译前
<div>
  <div>Static content</div>
  <div>{{ dynamicText }}</div>
</div>

// 编译后
const _hoisted_1 = /*#__PURE__*/createVNode("div", null, "Static content", -1 /* HOISTED */);

function render(_ctx, _cache) {
  return (openBlock(), createBlock("div", null, [
    _hoisted_1, // 静态节点，直接复用
    createVNode("div", null, _ctx.dynamicText, 1 /* TEXT */)
  ]));
}
```

### PatchFlag 标记

给动态节点打标记，Diff 时只比较标记的部分：

| PatchFlag | 含义 |
|-----------|------|
| 1 (TEXT) | 动态文本内容 |
| 2 (CLASS) | 动态 class |
| 4 (STYLE) | 动态 style |
| 8 (PROPS) | 动态 props |
| 16 (FULL_PROPS) | 具有动态 key 的 props |
| 32 (HYDRATE_EVENTS) | 需要事件监听器 |
| 64 (STABLE_FRAGMENT) | 子节点顺序不变的 Fragment |
| 128 (KEYED_FRAGMENT) | 有 key 的 Fragment |
| 256 (UNKEYED_FRAGMENT) | 无 key 的 Fragment |
| 512 (NEED_PATCH) | 需要强制更新 |

## 高频面试题

### 1. Vue 的 Diff 算法是什么？

Vue 使用**双端比较**的 Diff 算法，通过在新旧虚拟 DOM 的头部和尾部设置指针，进行四次比较，找出可复用的节点，最小化 DOM 操作。

**优化策略**：
- 同层比较，不跨层级
- 使用 key 优化列表渲染
- Vue 3 增加静态提升和 PatchFlag

### 2. 为什么 v-for 需要 key？

**作用**：
1. 帮助 Diff 算法识别节点身份
2. 复用已有节点，减少 DOM 操作
3. 维持组件状态

**注意事项**：
- 避免使用索引作为 key（除非列表不会变化）
- 使用唯一标识作为 key

### 3. Vue 2 和 Vue 3 Diff 的区别？

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 算法 | 双端比较 | 快速 Diff（最长递增子序列） |
| 静态节点 | 不处理 | 静态提升 |
| 动态标记 | 无 | PatchFlag |
| 事件缓存 | 无 | 缓存事件处理器 |

---

> 📌 **持续更新中**，更多内容敬请期待...
