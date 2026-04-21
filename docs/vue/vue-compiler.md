# Vue 编译原理

Vue 的模板编译将模板字符串转换为渲染函数，是理解 Vue 运行时的重要环节。

## 模板编译流程

```
模板字符串 → 解析器(Parser) → AST → 优化器(Optimizer) → 代码生成器(CodeGen) → Render 函数
```

## 简化版编译器

```js
function compile(template) {
  // 1. 解析模板生成 AST
  const ast = parse(template);

  // 2. 标记静态节点
  optimize(ast);

  // 3. 生成渲染函数代码
  const code = generate(ast);

  return {
    render: new Function(code.render),
    staticRenderFns: code.staticRenderFns
  };
}
```

## AST 结构

### AST 节点示例

```js
// 模板: <div id="app">{{ message }}</div>
const ast = {
  type: 1, // 元素节点
  tag: 'div',
  attrsList: [{ name: 'id', value: 'app' }],
  attrsMap: { id: 'app' },
  children: [{
    type: 2, // 表达式节点
    expression: '_s(message)',
    text: '{{ message }}'
  }],
  plain: false,
  static: false
};
```

### AST 节点类型

| type 值 | 类型 | 说明 |
|---------|------|------|
| 1 | 元素节点 | HTML 标签 |
| 2 | 表达式节点 | 包含插值表达式 `{{ }}` |
| 3 | 文本节点 | 纯文本 |

## 解析器（Parser）

### HTML 解析

```js
function parse(template) {
  const stack = [];
  let root;
  let currentParent;

  parseHTML(template, {
    start(tag, attrs, unary) {
      const element = {
        type: 1,
        tag,
        attrsList: attrs,
        attrsMap: makeAttrsMap(attrs),
        parent: currentParent,
        children: []
      };

      if (!root) {
        root = element;
      }

      if (currentParent) {
        currentParent.children.push(element);
      }

      if (!unary) {
        currentParent = element;
        stack.push(element);
      }
    },

    end() {
      stack.pop();
      currentParent = stack[stack.length - 1];
    },

    chars(text) {
      if (!text.trim()) return;
      currentParent.children.push({
        type: 3,
        text
      });
    }
  });

  return root;
}
```

## 优化器（Optimizer）

### 标记静态节点

```js
function optimize(root) {
  if (!root) return;
  
  // 标记静态节点
  markStatic(root);
  // 标记静态根节点
  markStaticRoots(root, false);
}

function markStatic(node) {
  node.static = isStatic(node);
  
  if (node.type === 1) {
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      markStatic(child);
      if (!child.static) {
        node.static = false;
      }
    }
  }
}

function isStatic(node) {
  if (node.type === 2) { // 表达式节点
    return false;
  }
  if (node.type === 3) { // 文本节点
    return true;
  }
  // 元素节点：不能有动态绑定
  return !node.attrsList.some(attr => attr.name.startsWith('v-') || attr.name.startsWith(':'));
}
```

## 代码生成器（Code Generator）

### 生成渲染函数

```js
function generate(ast) {
  const code = ast ? genElement(ast) : '_c("div")';
  return {
    render: `with(this){return ${code}}`,
    staticRenderFns: []
  };
}

function genElement(el) {
  if (el.staticRoot && !el.staticProcessed) {
    return genStatic(el);
  }

  const data = genData(el);
  const children = genChildren(el);

  return `_c('${el.tag}'${data ? `,${data}` : ''}${children ? `,${children}` : ''})`;
}

function genData(el) {
  let data = '{';
  
  // 属性
  if (el.attrsMap) {
    data += `attrs:${genProps(el.attrsList)},`;
  }
  
  // 指令
  if (el.directives) {
    data += `directives:[${el.directives.map(genDirective).join(',')}],`;
  }
  
  data = data.replace(/,$/, '') + '}';
  return data === '{}' ? null : data;
}

function genChildren(el) {
  if (!el.children.length) return null;
  
  return `[${el.children.map(genNode).join(',')}]`;
}

function genNode(node) {
  if (node.type === 1) {
    return genElement(node);
  } else if (node.type === 2) {
    return `_s(${node.expression})`;
  } else {
    return `_v(${JSON.stringify(node.text)})`;
  }
}
```

### 编译结果示例

```js
// 模板
<div id="app">
  <p>{{ message }}</p>
  <button @click="handleClick">点击</button>
</div>

// 编译后的渲染函数
with(this) {
  return _c('div', { attrs: { "id": "app" } }, [
    _c('p', [_v(_s(message))]),
    _c('button', {
      on: { "click": handleClick }
    }, [_v("点击")])
  ]);
}
```

## Vue 3 编译优化

### 编译时优化策略

1. **静态提升（Hoist Static）**：将静态节点提升到渲染函数外
2. **PatchFlag**：标记动态部分，减少比较范围
3. **Block Tree**：收集动态子节点，扁平化遍历
4. **事件缓存**：缓存事件处理器，避免不必要的更新

## 高频面试题

### 1. Vue 模板是如何编译的？

**答案**：编译过程分为三个阶段：
1. **解析（Parse）**：将模板字符串解析为 AST
2. **优化（Optimize）**：标记静态节点，跳过不需要 Diff 的部分
3. **生成（Generate）**：将 AST 转换为渲染函数代码

### 2. 为什么需要虚拟 DOM？直接操作真实 DOM 不行吗？

**答案**：
1. **性能**：真实 DOM 操作代价高，虚拟 DOM + Diff 减少实际操作次数
2. **跨平台**：虚拟 DOM 可以映射到不同平台（浏览器、小程序、Native）
3. **开发体验**：声明式编程，不用手动操作 DOM

---

> 📌 **持续更新中**，更多内容敬请期待...
