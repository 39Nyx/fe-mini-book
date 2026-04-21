# Vue 源码解析

深入剖析 Vue 2/3 核心源码，理解其设计思想与实现原理。

## 内容目录

| 模块 | 说明 | 链接 |
|------|------|------|
| **响应式原理** | Vue 2 Object.defineProperty、Vue 3 Proxy、依赖收集 | [查看](/vue/vue-reactivity) |
| **虚拟 DOM 与 Diff** | VNode 结构、双端比较 Diff、静态提升 | [查看](/vue/vue-vdom) |
| **编译原理** | AST 生成、优化器、代码生成器 | [查看](/vue/vue-compiler) |
| **组件化机制** | 组件注册、通信方式、生命周期、插槽 | [查看](/vue/vue-component) |

## 核心知识点速览

### Vue 2 vs Vue 3

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 响应式 | Object.defineProperty | Proxy |
| 性能 | 初始化递归劫持 | 懒代理，性能更好 |
| 组合式 API | 不支持 | 支持 |
| TypeScript | 支持一般 | 原生支持 |
|  tree-shaking | 一般 | 更好 |
| 碎片化 | 不支持 | 支持多根节点 |

### 生命周期对照

| Vue 2 | Vue 3 (Options API) | Vue 3 (Composition API) |
|-------|---------------------|------------------------|
| beforeCreate | beforeCreate | setup() |
| created | created | setup() |
| beforeMount | beforeMount | onBeforeMount |
| mounted | mounted | onMounted |
| beforeUpdate | beforeUpdate | onBeforeUpdate |
| updated | updated | onUpdated |
| beforeDestroy | beforeUnmount | onBeforeUnmount |
| destroyed | unmounted | onUnmounted |

## 高频面试题精选

### 1. Vue 2 和 Vue 3 响应式原理的区别？

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 实现方式 | Object.defineProperty | Proxy |
| 数组监听 | 重写数组方法 | Proxy 原生支持 |
| 新增属性 | 需要 Vue.set | 直接支持 |
| 性能 | 初始化时递归劫持 | 懒代理，性能更好 |
| 兼容性 | IE9+ | IE 不支持 |

### 2. 为什么 Vue 3 使用 Proxy？

1. 可以监听动态新增的属性
2. 可以监听删除的属性
3. 可以监听数组索引和长度的变化
4. 懒代理，性能更好
5. 代码更简洁

### 3. Vue 的 Diff 算法是什么？

Vue 使用**双端比较**的 Diff 算法，通过在新旧虚拟 DOM 的头部和尾部设置指针，进行四次比较，找出可复用的节点，最小化 DOM 操作。

**优化策略**：
- 同层比较，不跨层级
- 使用 key 优化列表渲染
- Vue 3 增加静态提升和 PatchFlag

### 4. computed 和 watch 的区别？

| 特性 | computed | watch |
|------|----------|-------|
| 用途 | 计算属性，缓存结果 | 监听变化，执行副作用 |
| 缓存 | 有缓存，依赖不变不重新计算 | 无缓存 |
| 适用场景 | 根据数据派生新数据 | 数据变化时执行异步或复杂操作 |
| 返回值 | 必须有返回值 | 不需要 |

### 5. Vue 组件间通信方式？

1. **Props / $emit**：父子组件
2. **$parent / $children / $refs**：直接访问实例
3. **Provide / Inject**：跨层级通信
4. **Event Bus**：任意组件（Vue 3 已移除）
5. **Vuex / Pinia**：全局状态管理
6. **$attrs / $listeners**：透传属性和事件

---

> 📌 **持续更新中**，更多内容敬请期待...
