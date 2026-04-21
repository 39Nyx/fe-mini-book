# 包管理工具

包管理工具用于管理项目依赖，是前端工程化的基础设施。

## npm / yarn / pnpm 对比

| 特性 | npm | yarn | pnpm |
|------|-----|------|------|
| 安装速度 | 一般 | 快 | 最快 |
| 磁盘占用 | 大 | 大 | 小（硬链接） |
| node_modules | 扁平/嵌套 | 扁平 | 非扁平 |
| 锁文件 | package-lock.json | yarn.lock | pnpm-lock.yaml |
| 工作区支持 | 支持 | 支持 | 原生支持 |

## pnpm 常用命令

```bash
# pnpm 常用命令
pnpm install          # 安装依赖
pnpm add <pkg>        # 添加依赖
pnpm add -D <pkg>     # 添加开发依赖
pnpm remove <pkg>     # 移除依赖
pnpm update           # 更新依赖
pnpm run <script>     # 运行脚本
```

## pnpm 的优势

### 1. 磁盘空间高效
- 使用硬链接（hard links）共享依赖
- 相同版本的包只存储一次

### 2. 严格的依赖管理
- 非扁平的 node_modules 结构
- 避免幽灵依赖（Phantom Dependencies）
- 只允许访问 package.json 中声明的依赖

### 3. 工作区支持
- 原生支持 Monorepo
- 高效的依赖安装和链接

### 高频面试题

**Q: pnpm 为什么比 npm/yarn 快？**

**答案**：
1. **硬链接**：相同包只存储一次，减少磁盘 I/O
2. **符号链接**：使用 symlink 创建依赖关系
3. **并行安装**：多线程并行下载和安装

**Q: 什么是幽灵依赖？**

**答案**：
- 在 npm/yarn 的扁平化结构中，可以访问未在 package.json 中声明的依赖
- pnpm 的非扁平结构避免了这个问题，提高依赖安全性
