# 搜索与图算法

搜索算法是解决图问题和遍历问题的核心工具。

## 深度优先搜索（DFS）

```js
function dfs(graph, start, visited = new Set()) {
  visited.add(start);
  console.log(start);

  for (const neighbor of graph[start]) {
    if (!visited.has(neighbor)) {
      dfs(graph, neighbor, visited);
    }
  }
}
```

## 广度优先搜索（BFS）

```js
function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];

  while (queue.length) {
    const node = queue.shift();
    console.log(node);

    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}
```

## 岛屿数量（DFS 应用）

```js
function numIslands(grid) {
  if (!grid.length) return 0;

  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === '0') {
      return;
    }
    grid[r][c] = '0'; // 标记为已访问
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === '1') {
        count++;
        dfs(i, j);
      }
    }
  }

  return count;
}
```

## DFS vs BFS 对比

| 特性 | DFS | BFS |
|------|-----|-----|
| 数据结构 | 栈（递归） | 队列 |
| 空间复杂度 | O(h) 树高 | O(w) 最大宽度 |
| 最短路径 | 不适用 | 适用（无权图） |
| 适用场景 | 连通性检测、拓扑排序 | 最短路径、层序遍历 |

## 高频面试题

### 1. 深度优先和广度优先的区别？

**答案**：
- **DFS**：深度优先，优先探索一个分支到底，用栈实现，适合连通性检测
- **BFS**：广度优先，逐层探索，用队列实现，适合找最短路径

### 2. 二叉树遍历有哪些方式？

1. **前序遍历**：根-左-右
2. **中序遍历**：左-根-右（二叉搜索树的中序遍历是有序的）
3. **后序遍历**：左-右-根
4. **层序遍历**：从上到下，从左到右（使用 BFS）

---

> 📌 **持续更新中**，更多内容敬请期待...
