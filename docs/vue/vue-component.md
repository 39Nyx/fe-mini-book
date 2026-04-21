# Vue 组件化机制

组件化是 Vue 的核心特性之一，理解组件的注册、通信和生命周期对开发至关重要。

## 组件注册

### 全局注册

```js
Vue.component('my-component', {
  template: '<div>Global Component</div>'
});

// Vue 3
const app = createApp(App);
app.component('my-component', MyComponent);
```

### 局部注册

```js
const MyComponent = {
  template: '<div>Local Component</div>'
};

new Vue({
  components: {
    'my-component': MyComponent
  }
});

// Vue 3 单文件组件
import MyComponent from './MyComponent.vue';

export default {
  components: { MyComponent }
};
```

## 组件通信

### Props / $emit（父子通信）

```js
// 父组件
<template>
  <child :message="parentMsg" @update="handleUpdate" />
</template>

// 子组件
export default {
  props: {
    message: {
      type: String,
      required: true,
      default: ''
    }
  },
  methods: {
    sendToParent() {
      this.$emit('update', 'new value');
    }
  }
};
```

### $parent / $children（不推荐）

```js
// 直接访问父组件
this.$parent.someMethod();

// 访问子组件
this.$children[0].someMethod();
```

### Provide / Inject（跨层级通信）

```js
// 祖先组件
export default {
  provide() {
    return {
      theme: this.theme,
      getMap: this.getMap
    };
  }
};

// 后代组件
export default {
  inject: ['theme', 'getMap']
};
```

### Event Bus（非父子通信）

```js
// eventBus.js
import Vue from 'vue';
export const EventBus = new Vue();

// 组件 A
EventBus.$emit('event-name', data);

// 组件 B
EventBus.$on('event-name', (data) => {
  console.log(data);
});
```

### Vuex / Pinia（状态管理）

```js
// Vuex
store.commit('mutationName', payload);
store.dispatch('actionName', payload);

// Pinia
const store = useStore();
store.someAction();
```

## 组件生命周期

### Vue 2 生命周期

```
创建阶段: beforeCreate → created
挂载阶段: beforeMount → mounted
更新阶段: beforeUpdate → updated
销毁阶段: beforeDestroy → destroyed
```

### Vue 3 生命周期

```
创建阶段: setup()
挂载阶段: onBeforeMount → onMounted
更新阶段: onBeforeUpdate → onUpdated
卸载阶段: onBeforeUnmount → onUnmounted
```

### 生命周期对比

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

### 生命周期钩子的使用场景

| 钩子 | 使用场景 |
|------|---------|
| created / setup | 数据初始化、调用 API |
| mounted | DOM 操作、第三方库初始化 |
| updated | 数据更新后的 DOM 操作 |
| beforeUnmount | 清理工作（定时器、事件监听） |

## 插槽（Slot）

### 默认插槽

```vue
<!-- 子组件 -->
<template>
  <div class="card">
    <slot>默认内容</slot>
  </div>
</template>

<!-- 父组件 -->
<my-card>自定义内容</my-card>
```

### 具名插槽

```vue
<!-- 子组件 -->
<template>
  <header>
    <slot name="header"></slot>
  </header>
  <main>
    <slot></slot>
  </main>
</template>

<!-- 父组件 -->
<my-card>
  <template #header>
    <h1>标题</h1>
  </template>
  <p>正文内容</p>
</my-card>
```

### 作用域插槽

```vue
<!-- 子组件 -->
<template>
  <slot :user="user"></slot>
</template>

<!-- 父组件 -->
<my-card v-slot="{ user }">
  <p>{{ user.name }}</p>
</my-card>
```

## 高频面试题

### 1. computed 和 watch 的区别？

| 特性 | computed | watch |
|------|----------|-------|
| 用途 | 计算属性，缓存结果 | 监听变化，执行副作用 |
| 缓存 | 有缓存，依赖不变不重新计算 | 无缓存 |
| 适用场景 | 根据数据派生新数据 | 数据变化时执行异步或复杂操作 |
| 返回值 | 必须有返回值 | 不需要 |

### 2. Vue 组件间通信方式有哪些？

1. **Props / $emit**：父子组件
2. **$parent / $children**：直接访问实例（不推荐）
3. **$refs**：直接调用子组件方法
4. **Provide / Inject**：跨层级
5. **Event Bus**：任意组件（Vue 3 已移除 $on/$off）
6. **Vuex / Pinia**：全局状态管理
7. **$attrs / $listeners**：透传属性和事件

### 3. v-show 和 v-if 的区别？

| 特性 | v-if | v-show |
|------|------|--------|
| 渲染方式 | 条件渲染，切换时组件会销毁/重建 | 始终渲染，通过 CSS display 控制 |
| 初始渲染 | 条件为 false 时不渲染 | 始终渲染 |
| 切换开销 | 高（销毁/重建） | 低（CSS 切换） |
| 适用场景 | 条件很少改变 | 频繁切换 |

---

> 📌 **持续更新中**，更多内容敬请期待...
