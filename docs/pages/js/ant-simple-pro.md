<img src="D:\await\blog\docs\pages\js\logo.svg" alt="logo" style="zoom:200%;" />

# ant-simple-pro，一个包含3大主流框架的中台解决方案



## 简介

[ant-simple-pro](https://github.com/lgf196/ant-simple-pro) 是一款支持 [vue3.0](https://github.com/vuejs/vue)，[react](https://github.com/facebook/react)，[angular](https://github.com/angular/angular)，[typescript ](https://github.com/microsoft/TypeScript)等多框架支持的中台前端解决方案，ui 框架使用 [ant-design](https://github.com/ant-design/ant-design) 实现，它使用了最新的前端技术栈，内置了 i18n 国际化解决方案，动态路由，响应式设计，开箱即用，它可以帮助你快速搭建企业级中后台产品原型，不管你是 vueer ，还是 reacter , 或者是 angular 开发者，都能在这里找到你想要的版本。



## 为什么要写 ant-simple-pro

可以说是兴趣所致吧，然后就是对自己的技术不够自信，想通过做一个开源项目来丰富自己的提高自己的技术。当前的此类项目当然很多，但都是单个技术栈的，本项目用每个主流框架实现，对于系统学习前端是很有帮助的。本身我是一个 Vueer，同时也是一个 Reacter，做一名双开的前端并不是一件非常困难的事情，在多个框架之间寻找平衡与突破，是一件快乐且有意义的事。刚好好友也有同样的想法，于是一起在空余时间，完成了  ant-simple-pro  乞丐版（这里确实初版功能非常少，不过后面肯定是会完善的）。



## 为什么要选用 ant-design 做为 UI

- 生态，生态，生态，重要的事情说三遍，antd 的生态可以说是国类 UI 组件库生态中最强大的代表，在 [antd](https://ant.design/) 的官网下面，你可以看到有很多相关资源，pc 端，移动端，图表，动画，设计资源等等。
- 强大的背景 - antd 的团队可以说是国内很厉害的团队之一，能进 antd 团队的人，实力非常的强，而且 antd 团队开发的产品，服务了阿里成百个项目，可以说在前端领域很有经验，再一个就是团队资金雄厚，毕竟背靠支付宝，人人都得用花呗。
- 社区 - antd 社区是非常强大和活跃的，而且国内很多大厂都在使用。在 antd 的支撑下，出现了很多基于 antd 的实用性功能组件，大大的方便了开发者们
- UI 漂亮 -  视觉风格很契合中台项目，全链路开发和设计工具体系让开发和设计配合更方便，个人觉得还是挺漂亮的（在 UI 设计师的眼里就是丑，这个没法吐槽，毕竟不是一类人，哈哈 ）



## 为什么引入 TypeScript

近几年，TS 在前端圈已经越来越火，不管是服务端（Node.js），还是前端框架（Angular必须使用 TS、React + TS 标配、Vue3 则提供了更好的 TS 支持），都有越来越多的项目使用 TS 开发。 无论是社区还是各种文章都能看出来，整体来说正面的信息是大于负面的。引入TS 可以在开发阶段规避掉很多代码层面上的问题，提高代码质量和可读性，在后续维护起来也会更轻松。作为前端程序员，TS 已经成为一项必不可少的技能。



## 前序准备

本地环境（必需）：[Node.js](https://nodejs.org/)v10 或以上 、[Git ](https://git-scm.com/)

前置知识：[ES6+](https://es6.ruanyifeng.com/)、[Ant-Design](https://ant-design.gitee.io/index-cn)、[Typescript](https://github.com/microsoft/TypeScript)、[Webpack](https://webpack.js.org/)、[Babel](https://babel.dev/)

三大框架：

#### Vue

- vue3 新语法，如 composition-api
- vue全家桶，vue-cli4x、vue-router4x、vuex4x

#### React

- react 基本语法，如 class 组件、函数式组件、render props、hoc、hooks 等
- react 全家桶，create-react-app、react-router-dom
- react 状态管理，主要是 redux，然后是 redux 的一些插件 redux-saga、redux-thunk 等

#### Angular

- angular 基本语法，如 html 模板，指令，组件等
-  angular的全家桶 ，angular-cli、@angular/router



![rM9VoD](D:\await\blog\docs\pages\js\rM9VoD.png)



## 运行

```bash
# 克隆项目
git clone https://github.com/lgf196/ant-simple-pro.git

# 进入项目目录
cd ant-simple-pro

# 选择你喜欢的版本

# 安装依赖
npm install

# 启动服务
npm run dev
```

 详细内容请查看文档[ant-simple-pro-document](https://blog.lgf196.top/ant-simple-pro-document/)。 



## 服务端

`ant-simple-pro`的服务端接口并未采用 [mock](https://github.com/nuysoft/Mock) 来模拟数据，而是采用`ts`+`node`+`mysql`+`docker`等提供接口，由于数据暂时不是很复杂，所以并未采用`orm`框架来操作数据库，而是直接原生`sql`语句来操作，服务端虽然不是很复杂，但是涉及到了常见业务 60% 以上的需求，CURD，分页，jwt 认证，文件上传，文件下载等。

```bash
├── public                     # 存放静态资源文件
├── src                        # 源代码
│   ├── config                 # 数据库配置文件
│   ├── controllers            # 业务层，控制器
│   ├── interface              # ts接口
│   ├── middleware             # 中间件
│   ├── routes                 # 路由
│   ├── types                  # 全局类型声明
│   ├── utils                  # 工具函数
│   └── index.ts               # 入口文件
├── .gitignore                 # git提交忽略文件
├── tsconfig.json              # 项目全局ts配置文件
└── package.json               # package.json
```

 详细内容请查看文档[ant-simple-pro-document](https://blog.lgf196.top/ant-simple-pro-document/)。 



## 后期版本

现在的版本是 1.0 版本，也是一个初始版本，肯定很多常见的功能会没有，我们会在后期的版本中不断的更新进来，像代码的质量，本项目的整体布局，我们也会在后面的版本中进行优化和修改，还希望大家不要着急，耐心的等待，本项目会一直维护下去的，不用担心没人维护的问题，该项目的 bug ，大家可以去 [issues](https://github.com/lgf196/ant-simple-pro/issues)上题问，我们会在一周内，回复大家的反馈。

后期版本中，`ant-simple-pro` 的生态会新增 桌面端、移动端、ssr 同构 等，敬请期待。



## 结语

- 项目地址：[ant-simple-pro](https://github.com/lgf196/ant-simple-pro)
- 文档地址：[ant-simple-pro-document](http://blog.lgf196.top/ant-simple-pro-document/)
- 技术交流群扫码进入，一起学习，一起成长：

