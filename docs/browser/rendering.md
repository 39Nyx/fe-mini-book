# 浏览器渲染原理

深入理解浏览器渲染原理是前端性能优化的基础。

## 渲染流程

```
URL → DNS解析 → TCP连接 → HTTP请求 → 服务器响应 → 解析HTML → 构建DOM树
                                                                    ↓
渲染页面 ← 绘制(Paint) ← 布局(Layout) ← 构建渲染树(Render Tree) ← 构建CSSOM树
```

### 关键渲染路径

```js
// 1. 构建 DOM 树
// 将 HTML 解析为 DOM 节点

// 2. 构建 CSSOM 树
// 将 CSS 解析为样式规则

// 3. 构建渲染树
// 合并 DOM 和 CSSOM，计算样式

// 4. 布局（Layout/Reflow）
// 计算元素的几何信息（位置和大小）

// 5. 绘制（Paint）
// 将渲染树绘制到屏幕

// 6. 合成（Composite）
// 将多个图层合成为最终页面
```

## 重排（Reflow）与重绘（Repaint）

```js
// 触发重排的操作（性能开销大）
element.style.width = '100px';      // 改变尺寸
element.style.display = 'none';     // 改变显示
element.className = 'new-class';    // 改变类名
window.addEventListener('resize', handler); // 窗口大小变化

// 触发重绘的操作（性能开销较小）
element.style.color = 'red';        // 改变颜色
element.style.backgroundColor = '#fff'; // 改变背景色
element.style.visibility = 'hidden'; // 改变可见性

// 优化：批量修改样式
// 不好的做法
const element = document.getElementById('box');
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';

// 好的做法：使用 cssText 或 class
element.style.cssText = 'width: 100px; height: 100px; margin: 10px;';
// 或
element.className = 'box-optimized';

// 优化：离线操作 DOM
// 使用 DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  fragment.appendChild(li);
}
document.getElementById('list').appendChild(fragment);
```

### 高频面试题

**Q: 重排和重绘的区别？如何优化？**

**答案**：
- **重排（Reflow）**：元素尺寸、位置变化，需要重新计算布局
- **重绘（Repaint）**：外观变化（颜色、背景），不影响布局

**优化**：
- 批量修改样式（使用 class 或 cssText）
- 离线操作 DOM（DocumentFragment）
- 使用 transform 和 opacity（触发 GPU 加速）
- 避免频繁读取布局属性（offsetHeight、scrollTop 等）
