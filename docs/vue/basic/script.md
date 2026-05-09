---
title: 环境与脚本
order: 1

group:
  title: 基础
  order: 1
---

## 依赖安装

直接执行`pnpm install`的时候，由于安装`puppeteer`依赖的时候会比较久，因为会下载`Chrome for Testing`，这个时候可以使用下面命令跳过下载

```shell
PUPPETEER_SKIP_DOWNLOAD=true pnpm install
```

如果之前由于安装的是`Ctrl + C`中断了安装，可能由于`puppeteer`本地浏览器缓存不完整问题，导致无法安装，可以使用下面命令删除缓存,然后跳过下载安装

```shell
# 删除缓存
rm -rf ~/.cache/puppeteer
# 安装
PUPPETEER_SKIP_DOWNLOAD=true pnpm install
```

## dev脚本

执行`pnpm run dve`命令，启动 `Vue` 源码的开发构建监听任务，并不是启动一个网页服务，核心流程如下

- 执行 `node scripts/dev.js`

- `node scripts/dev.js`的默认参数如下

```javascript
const {
  values: { format: rawFormat, prod, inline: inlineDeps },
  positionals,
} = parseArgs({
  allowPositionals: true,
  options: {
    format: {
      type: 'string',
      short: 'f',
      default: 'global',
    },
    prod: {
      type: 'boolean',
      short: 'p',
      default: false,
    },
    inline: {
      type: 'boolean',
      short: 'i',
      default: false,
    },
  },
})

const format = rawFormat || 'global'  // global
const targets = positionals.length ? positionals : ['vue']  // ['vue']
```

由于`pnpm run dev`没有传任何参数，所以`format`为`global`， `targets`为`['vue']`

### parseArgs说明

`parseArgs`方法是内置的用于解析命令参数的方法，运行接受类似下面的参数

```shell
node scripts/dev.js vue -f global -p -i
```

解析大致结果是

```html
{
  values: {
    format: 'global',
    prod: true,
    inline: true
  },
  positionals: ['vue']
}
```

这段代码又通过解构赋值，把结果取出来

```html
values: { format: rawFormat, prod, inline: inlineDeps }
```

含义是:

- `format` 参数取出来后，重命名为 `rawFormat`
- `prod` 参数保持叫 `prod`
- `inline` 参数取出来后，重命名为 `inlineDeps`
- `positionals` 位置参数单独取出来

三个可选参数分别是:

| 参数       | 简写 | 类型 | 默认值 | 作用 |
|----------| --- | --- | --- | --- |
| --format | -f  | string | global | 构建格式 |
| --prod   | -p  | boolean | false | 是否生产环境 |
| --inline | -i  | boolean | false | 是否把依赖一起打进包里 |


`allowPositionals: true` 表示允许“非选项参数”，比如：

```shell
node scripts/dev.js vue
```

这里的 `vue` 不是 `--xxx` 这种选项，而是位置参数，会进入 `positionals` 数组

### 读取文件

由于`target`是`['vue']`，所以脚本会读取`packages/vue/package.json`

```javascript
const pkgBase = privatePackages.includes(target)
  ? `packages-private`
  : `packages`
const pkgBasePath = `../${pkgBase}/${target}` // ../packages/vue
const pkg = require(`${pkgBasePath}/package.json`) // packages/vue/package.json
```

这里会读取`packages/vue/package.json`下的内容，其中会用到以下部分

```json
{
  "buildOptions": {
    "name": "Vue",
    "formats": [
      "esm-bundler",
      "esm-bundler-runtime",
      "cjs",
      "global",
      "global-runtime",
      "esm-browser",
      "esm-browser-runtime"
    ]
  }
}
```

### 构建产物

```javascript
const outfile = resolve(
  __dirname,
  `${pkgBasePath}/dist/${
    target === 'vue-compat' ? `vue` : target
  }.${postfix}.${prod ? `prod.` : ``}js`,
)
const relativeOutfile = relative(process.cwd(), outfile)
```

#### resolve(__dirname, ...)

`resolve` 是 `node:path` 的 `path.resolve`，作用是把多个路径片段拼成一个绝对路径。

`__dirname`：当前脚本所在的目录，即 /Users/<username>/nodeProject/core/scripts

第二个参数：要拼接的相对路径（一个模板字符串）

```javascript
`${pkgBasePath}/dist/${target === 'vue-compat' ? 'vue' : target}.${postfix}.${prod ? 'prod.' : ''}js`
// ../packages/vue/dist/vue.global.js
```

最终`outfile`为 `/Users/<username>/nodeProject/core/packages/vue/dist/vue.global.js`

#### relative(process.cwd(), outfile)

`relative` 也来自 `node:path`，作用是计算从“第一个路径”走到“第二个路径”的相对路径。

`process.cwd()`：当前进程启动时所在的目录，对你来说一般就是 /Users/<username>/nodeProject/core

`outfile`：绝对路径 `/Users/<username>/nodeProject/core/packages/vue/dist/vue.global.js`

计算之后`relativeOutfile`为`packages/vue/dist/vue.global.js`


### 构建

```javascript
esbuild
  .context({
    entryPoints: [resolve(__dirname, `${pkgBasePath}/src/index.ts`)],
    outfile,
    bundle: true,
    external,
    sourcemap: true,
    format: outputFormat,
    globalName: pkg.buildOptions?.name,
    platform: format === 'cjs' ? 'node' : 'browser',
    plugins,
    define: {
      __COMMIT__: `"dev"`,
      __VERSION__: `"${pkg.version}"`,
      __DEV__: prod ? `false` : `true`,
      __TEST__: `false`,
      __BROWSER__: String(
        format !== 'cjs' && !pkg.buildOptions?.enableNonBrowserBranches,
      ),
      __GLOBAL__: String(format === 'global'),
      __ESM_BUNDLER__: String(format.includes('esm-bundler')),
      __ESM_BROWSER__: String(format.includes('esm-browser')),
      __CJS__: String(format === 'cjs'),
      __SSR__: String(format !== 'global'),
      __COMPAT__: String(target === 'vue-compat'),
      __FEATURE_SUSPENSE__: `true`,
      __FEATURE_OPTIONS_API__: `true`,
      __FEATURE_PROD_DEVTOOLS__: `false`,
      __FEATURE_PROD_HYDRATION_MISMATCH_DETAILS__: `true`,
    },
  })
  .then(ctx => ctx.watch())
```

- 从 `packages/vue/src/index.ts` 作为入口开始打包
- 把相关源码 `bundle` 成一个浏览器可直接使用的全局包 
- 输出到 `packages/vue/dist/vue.global.js`
- 同时生成 `sourcemap`
- 设置一批编译时常量，比如 `__DEV__ = true`、`__GLOBAL__ = true`、`__VERSION__ = "3.5.34"`
- 保持进程不退出，持续监听源码变化； 
- 你修改 Vue 源码后，它会自动重新构建并再次打印 `built: ...`

简单来说：`pnpm run dev` 是 Vue core 仓库里的“开发构建命令”，用于监听并快速生成并 `packages/vue/dist/vue.global.js`，方便你在本地 `HTML` 示例里直接引入这个文件测试源码改动

例如:

```html
<!--文件位于 core/packages/vue/examples/reactivity/ref.html-->
<script src="../../dist/vue.global.js"></script>

<div id="demo">
  <h1>{{ hello }}</h1>
</div>

<script>
  const { ref } = Vue
  Vue.createApp({
    setup() {
      const hello = ref('Hello World!')
      return { hello }
    },
    mounted() {
      setTimeout(() => {
        this.hello = 'Hello Vue!'
      }, 2000)
    }
  }).mount('#demo')
</script>

<style>
</style>
```
