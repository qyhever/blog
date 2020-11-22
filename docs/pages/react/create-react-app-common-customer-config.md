Create React App 是一个官方支持的创建 React 单页应用程序的方法。它提供了一个零配置的现代构建设置。
虽然开箱即用，但是开发中我们还是少不了做一些修改，下面总结了一些常用的配置。

#### yarn安装依赖包报错

在项目目录下运行`yarn，`报错如下

```
yarn install v1.7.0
[1/4] Resolving packages...
[2/4] Fetching packages...
info There appears to be trouble with your network connection. Retrying...
error An unexpected error occurred: "https://registry.yarnpkg.com/@babel/highlight/-/highlight-7.0.0.tgz: connect ETIMEDOUT 104.16.21.35:443".
info If you think this is a bug, please open a bug report with the information provided in "F:\\await\\react-rabc\\yarn-error.log".
info Visit https://yarnpkg.com/en/docs/cli/install for documentation about this command.
```



提示很明显，网络连接超时，我们更换一下源地址就行了

npm 设置为 淘宝源

```shell
npm config set registry https://registry.npm.taobao.org
npm config set disturl https://npm.taobao.org/dist
```

yarn 设置为 淘宝源

```shell
yarn config set registry https://registry.npm.taobao.org --global
yarn config set disturl https://npm.taobao.org/dist --global
```

项目中如果用的是 sass，需要下载 node-sass，这个依赖包下载是相当的慢，可以单独设置源地址

```shell
yarn config set sass-binary-site http://npm.taobao.org/mirrors/node-sass
npm config set sass-binary-site http://npm.taobao.org/mirrors/node-sass
```

最后删除 `node_modules`，重新下载就行了

#### IE10下报错, Map 未定义

```shell
yarn add react-app-polyfill
```

入口文件第一行引入

```js
// This must be the first line in src/index.js
import 'react-app-polyfill/ie9'
```

[react-app-polyfill](https://github.com/facebook/create-react-app/blob/master/packages/react-app-polyfill/README.md)

#### webpack添加 alias

`config/modules.js`文件中的`webpackAliases`的`alias`是解析项目根目录下的`tsconfig.json`或者`jsconfig.json`来返回的，有点复杂

可以直接在`webpack.config.js`的`resolve.alias`字段中的末尾新增字段

```js
resolve: {
  // ...
  alias: {
    // ...
    '@': path.resolve(__dirname, '../src')
  }
}
```

#### 解决跨域，反向代理配置
1、安装依赖
```
yarn add http-proxy-middleware
```
2、在`src`目录下新建`setupProxy.js`文件
```javascript
const { createProxyMiddleware } = require('http-proxy-middleware')
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:6000', // 请求接口地址
      changeOrigin: true,
      pathRewrite: {
        '^/api': ''
      }
    })
  )
}

```

#### 项目主要文件路径配置

包括项目入口文件、静态目录、项目构建输出目录、配置`proxy`文件...

在`config/paths.js`文件配置，挑出几个最常用的

```js
module.exports = {
  dotenv: resolveApp('.env'), // 项目环境变量文件
  appBuild: resolveApp('dist'), // 项目构建输出目录，默认 build
  appPublic: resolveApp('public'), // 静态目录
  appHtml: resolveApp('public/index.html'), // index.html
  appIndexJs: resolveModule(resolveApp, 'src/index'), // 项目入口文件
  proxySetup: resolveApp('src/setupProxy.js') // 配置 proxy 文件
}
```

#### 关闭自动开启浏览器配置
在`scripts/start.js`文件，注释掉`openBrowser(urls.localUrlForBrowser)`即可，
或者使用环境变量`BROWSER`

```json
{
  "script": {
    "start": "cross-env BROWSER=none node scripts/start.js"
  }
}
```

#### 修改 webpack `output.publicPath`

如果项目不是部署在静态服务器根目录下会用到，直接在`package.json`中配置`homepage`字段

```json
{
  "homepage": "/e-admin/"
}
```

或者使用环境变量`PUBLIC_URL`

```json
{
  "script": {
    "build": "cross-env PUBLIC_URL=/e-admin/ node scripts/build.js"
  }
}
```
修改 `publicPath` 之后，如果路由使用 `history` 模式，还需要做其他配置
- `react-router-dom` 的 `Router` 组件 `basename` 属性
  ```jsx
  <BrowserRouter
    basename="/e-admin"
  >
    <App />
  </BrowserRouter>
  ```
  如果使用 `history`
  ```js
  const history = createBrowserHistory({
    basename: '/e-admin'
  })
  ```
- 静态服务器（使用nginx）做重定向配置（$try_files）
  ```shell
  # 因为前端使用了BrowserHistory，所以将路由 fallback 到 index.html
  location /e-admin {
    try_files $uri $uri/ /e-admin/index.html;
  }
  ```


#### 生产环境关闭 sourcemap
一般在部署到生产环境会关闭 sourcemap，避免打包文件过大
查看 `webpack.config.js` 看到如下代码：
```javascript
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
```
可以在命令行中使用`GENERATE_SOURCEMAP`这个环境变量
```json
{
  "script": {
    "build": "cross-env GENERATE_SOURCEMAP=false node scripts/build.js"
  }
}
```

#### eslint 配置

可以直接在`package.json`中的`eslintConfig`字段配置。

在根目录下新建`.eslint.js`（或者`.eslintrc`）配置文件，然后在命令行中设置`EXTEND_ESLINT`

```json
{
  "script": {
    "start": "cross-env EXTEND_ESLINT=true node scripts/start.js"
  }
}
```

> 因为各平台设置环境变量的方式不同，这里使用`cross-env`来抹平差异

#### 装饰器 Decorators 配置
开发中会有很多高阶组件以及 redux 的 `connect` 来包裹组件，使用 `Decorators` 写法会直观许多
- 先安装 `babel` 插件
```shell
yarn add @babel/plugin-proposal-decorators
```
- `babel` 配置，在 `plugins` 中添加
```json
{
  "plugins": [
    [
      "@babel/plugin-proposal-decorators",
      {
        "legacy": true
      }
    ]
  ]
}
```
- 完成上面配置后，编译就不会报错了，代码能正常运行，但是编辑器（这是使用VSCode）却报错了，我们需要做额外的配置

  - 在根目录下新建 `jsconfig.json` 文件

    ```json
    {
      "compilerOptions": {
        "experimentalDecorators": true
      }
    }
    ```

  - 打开 `VSCode` 的 `setting.json` 文件，添加以下属性

    ```json
    "javascript.implicitProjectConfig.experimentalDecorators": true
    ```


> create-react-app 的 babel 配置默认是在 package.json 中的，可以单独放到根目录下(.babelrc或者babel.config.js)

#### 区分环境
开发环境，测试环境，预生产环境，生产环境，很多配置项（比如接口地址）都是不同的，这时候我们需要根据环境来决定配置项。
create-react-app 默认支持`development`，`test`，`production`，这里的 `test` 是用来做代码测试的，并不是构建测试环境的，我们需要多种打包环境。
这里我们先区分三个环境：
- 开发环境 dev
- 测试环境 alpha
- 生产环境 prod

1、然后在根目录新建三个文件 `.env`，`.env.alpha`，`.env.prod`，文件内容如下：
  ```
  // .env
  NODE_ENV=development
  REACT_APP_MODE=dev

  // .env.alpha
  NODE_ENV=production
  REACT_APP_MODE=alpha

  // .env.prod
  NODE_ENV=production
  REACT_APP_MODE=prod
  ```
2、修改`package.json`的命令脚本
  ```json
  {
    "script": {
      "build:alpha": "cross-env MODE_ENV=alpha node scripts/build.js",
      "build:prod": "cross-env MODE_ENV=prod node scripts/build.js"
    }
  }
  ```
3、修改`config/env.js`文件
  ```javascript
  // const NODE_ENV = process.env.NODE_ENV;
  const NODE_ENV = process.env.MODE_ENV || process.env.NODE_ENV;
  ```
4、然后在业务代码里面就可以使用`process.env.REACT_APP_MODE`来区分环境了
  ```javascript
  // axios.baseURL
  const baseURL = {
    dev: 'http://localhost:3000',
    alpha: 'http://alpha.xxx.com',
    prod: 'http://xxx.com'
  }[process.env.REACT_APP_MODE]
  ```
根据不同命令区分不同环境，这是通用的手段。
这里根据`npm`命令中的`REACT_APP_MODE`来决定使用哪个`.env.[xxx]`的环境变量，注入到编译代码中。
> 注意：
- 需要注意的是在 env.js 文件中将 NODE_ENV 替换为了 MODE_ENV，导致本来的 NODE_ENV 缺失，在 .env.[xxx] 文件中要补上
- .env.[xxx] 的环境变量 以 REACT_APP_xxx 开头


#### 编译进度条配置
- 安装依赖
  ```shell
  yarn add webpackbar
  ```
- 修改`webpack.config.js`文件
  ```javascript
  const WebpackBar = require('webpackbar')
  plugins: [
    // ...
    new webpack.ProgressPlugin(),
    new WebpackBar()
  ]
  ```
`webpack.ProgressPlugin()` 是`webpack`内置插件，[webpack.ProgressPlugin](https://webpack.js.org/plugins/progress-plugin/)，`WebpackBar`用来显示编译时长


#### 打包开启 gzip 压缩
- 安装依赖
  ```shell
  yarn add compression-webpack-plugin
  ```
- 修改`webpack.config.js`文件
  ```javascript
  const CompressionPlugin = require('compression-webpack-plugin')
  const isGzip = process.env.GENERATE_GZIP_FILE === 'true'
  plugins: [
    // ...
    isEnvProduction && isGzip && new CompressionPlugin({
      filename: '[path].gz[query]', // 新版本 asset 属性已更换为 filename
      algorithm: 'gzip',
      test: /\.js$|\.css$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ]
  ```
- 通过设置环境变量`GENERATE_GZIP_FILE=true`来启用`gzip`压缩

> 请确保静态服务器开启了 gzip 配置项，nginx 配置 gzip_static on; 选项即可

下面是未开启`gzip`和开启`gzip`的效果：
- 未开启 gzip

  ![未开启gzip](https://blog.qiniu.qyhever.com/file.png)

- 开启 gzip

  ![未开启gzip](https://blog.qiniu.qyhever.com/file-gz.png)

#### 生成 report.html 可视化打包分析
- 安装依赖
  ```shell
  yarn add webpack-bundle-analyzer
  ```
- 修改`webpack.config.js`文件
  ```javascript
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
  const isBundleAnalyzer = process.env.GENERATE_BUNDLE_ANALYZER_REPORT === 'true'
  plugins: [
    // ...
    isEnvProduction && isBundleAnalyzer && new BundleAnalyzerPlugin()
  ]
  ```
- 通过设置环境变量`GENERATE_BUNDLE_ANALYZER_REPORT=true`来生成`report`


#### 引入 antd

`antd` 的 JS 代码默认支持基于 ES modules 的 tree shaking，即按需引入，只是样式的引入有些区别

1、直接引入，样式直接用编译后的`antd.css`

```javascript
import { Button } from 'antd'
import 'antd/dist/antd.css'

function App() {
  return (
    <Button type="primary">按钮</Button>
  )
}
```

简单粗暴，但是没法统一修改一些全局的颜色

2、引入 `less`

- 安装依赖

  ```shell
  yarn add less less-loader
  ```

- `wepack.config.js`配置，默认的`rules`已经包含`css`和`sass`，先找到下面的正则

  ```js
  // style files regexes
  const cssRegex = /\.css$/;
  const cssModuleRegex = /\.module\.css$/;
  const sassRegex = /\.(scss|sass)$/;
  const sassModuleRegex = /\.module\.(scss|sass)$/;
  // 加上匹配 less 文件的正则
  const lessRegex = /\.less$/;
  const lessModuleRegex = /\.module\.less$/;
  ```

  然后加上 `loader` 配置，在`sass-loader`配置下面加上`less-loader`的配置

  ```javascript
  // Adds support for CSS Modules, but using SASS
  // using the extension .module.scss or .module.sass
  {
    test: sassModuleRegex,
    use: getStyleLoaders(
      {
        importLoaders: 3,
        sourceMap: isEnvProduction && shouldUseSourceMap,
        modules: {
          getLocalIdent: getCSSModuleLocalIdent,
        },
      },
      'sass-loader'
    ),
  },
  // 在下面加上 less-loader 配置
  {
    test: lessRegex,
    exclude: lessModuleRegex,
    use: getStyleLoaders(
      {
        importLoaders: 2,
        sourceMap: isEnvProduction && shouldUseSourceMap,
      },
      'less-loader'
    ),
    sideEffects: true,
  },
  // Adds support for CSS Modules, but using less
  // using the extension .module.less
  {
    test: lessModuleRegex,
    use: getStyleLoaders(
      {
        importLoaders: 2,
        sourceMap: isEnvProduction && shouldUseSourceMap,
        modules: {
            getLocalIdent: getCSSModuleLocalIdent
        }
      },
      'less-loader'
    ),
  },
  ```

  找到`getStyleLoaders`方法，做如下修改：
  ```javascript
  // 将 if (preProcessor) {} 中的代码替换，实际上就是判断是`less-loader`就生成针对less的options
  if (preProcessor) {
    let preProcessorRule = {
      loader: require.resolve(preProcessor),
      options: {
        sourceMap: true
      }
    }
    if (preProcessor === 'less-loader') {
      preProcessorRule = {
        loader: require.resolve(preProcessor),
        options: {
          sourceMap: true,
          lessOptions: { // 如果使用less-loader@5，需要移除 lessOptions 这一级
            javascriptEnabled: true,
            modifyVars: {
              'primary-color': '#346fff', // 全局主色
              'link-color': '#346fff' // 链接色
            }
          }
        }
      }
    }
    loaders.push(
      {
        loader: require.resolve('resolve-url-loader'),
        options: {
          sourceMap: isEnvProduction && shouldUseSourceMap,
        },
      },
      preProcessorRule
    );
  }
  ```

- 将`import 'antd/dist/antd.css'`换成`import 'antd/dist/antd.less'`

  经过上面的配置后，可以直接修改`less`变量来修改全局颜色、间距等，[所有变量](https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less)

  当然如果在配置文件中覆盖`less`变量有些麻烦，可以直接直接新建单独的`less`文件来覆盖默认变量

  ```less
  @import '~antd/lib/style/themes/default.less';
  @import '~antd/dist/antd.less';
  @import 'customer-theme-file.less'; // 用于覆盖默认变量
  ```

  但是这种方式会加载所有组件的样式，没法做到按需加载



3、按需加载
- 安装依赖
  ```shell
  yarn add babel-plugin-import
  ```

- babel 配置
  ```json
  "plugins": [
    [
      "babel-plugin-import",
      {
        "libraryName": "antd",
        "libraryDirectory": "es",
        "style": true
      }
    ]
  ]
  ```

- 去掉`import 'antd/dist/antd.less'`的引入，现在引入组件就会附带引入对应组件的样式了

#### 全局less变量
项目中如果使用 `less` 或者 `sass`，那么可能会有些全局变量，需要在样式文件中使用，如果不做任何配置那么需要在用到变量的样式文件中引入变量文件`@import './var.less'`。

我们需要使用 `sass-resources-loader` 将变量和混入方法注入到全局，这样就可以在每个样式文件中直接使用变量了。

具体配置：
1、修改`getStyleLoaders`方法
  ```javascript
  const getStyleLoaders = (cssOptions, preProcessor, restLoaders) => {
    // 改 const 为 let，后面根据函数第三个参数重新赋值
    let loaders = [
      // ...
    ]
    // ...
    if (Array.isArray(restLoaders) && restLoaders.length) {
      loaders = loaders.concat(restLoaders)
    }
    return loaders
  }
  ```
2、修改 `less-loader` 配置
  ```javascript
  {
    test: lessRegex,
    exclude: lessModuleRegex,
    use: getStyleLoaders(
      {
        importLoaders: 2,
        sourceMap: isEnvProduction && shouldUseSourceMap,
      },
      'less-loader',
      // 添加第三个参数
      [
        {
          loader: 'sass-resources-loader',
          options: {
            resources: [
              path.resolve(__dirname, '../src/assets/styles/var.less')
            ]
          }
        }
      ]
    ),
    sideEffects: true,
  },
  {
    test: lessModuleRegex,
    use: getStyleLoaders(
      {
        importLoaders: 2,
        sourceMap: isEnvProduction && shouldUseSourceMap,
        modules: {
          getLocalIdent: getCSSModuleLocalIdent,
        }
      },
      'less-loader',
      // 添加第三个参数
      [
        {
          loader: 'sass-resources-loader',
          options: {
            resources: [
              path.resolve(__dirname, '../src/assets/styles/var.less')
            ]
          }
        }
      ]
    ),
  }
  ```
  这里使用`less`配置，变量文件路径`src/assets/styles/var.less`，配置完成后不用引入`var.less`，就可以在每个样式文件中使用变量了。


[项目地址](https://github.com/qyhever/cra-common-customer-config)


> 参考链接：
- [Create React App 官方文档](https://create-react-app.dev/docs/getting-started)
- [Create React App 中文文档](https://www.html.cn/create-react-app/docs/getting-started/)
- [Ant Design](https://ant-design.gitee.io/docs/react/introduce-cn)