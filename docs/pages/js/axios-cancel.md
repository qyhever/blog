在开发中，经常会遇到接口重复请求导致的各种问题。

对于重复的`get`请求，会导致页面更新多次，发生页面抖动的现象，影响用户体验。

对于重复的`post`请求，会导致在服务端生成两次记录（例如生成两条订单记录）。

如果当前页面请求还未响应完成，就切换到了下一个路由，那么这些请求直到响应返回才会中止。

无论从用户体验或者从业务严谨方面来说，取消无用的请求确实是需要避免的。

当然我们可以通过页面`loading`来避免用户进行下一次的操作，但本文只讨论单纯的如何取消这些无用的请求。

### axios 的 cancelToken

`axios`是一个主流的`http`请求库，它提供了两种取消请求的方式。

- 通过`axios.CancelToken.source`生成取消令牌`token`和取消方法`cancel`

  ```js
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  axios.get('/user/12345', {
    cancelToken: source.token
  }).catch(function(thrown) {
    if (axios.isCancel(thrown)) {
      console.log('Request canceled', thrown.message);
    } else {
      // handle error
    }
  });

  axios.post('/user/12345', {
    name: 'new name'
  }, {
    cancelToken: source.token
  })

  // cancel the request (the message parameter is optional)
  source.cancel('Operation canceled by the user.');
  ```

- 通过`axios.CancelToken`构造函数生成取消函数

  ```js
  const CancelToken = axios.CancelToken;
  let cancel;

  axios.get('/user/12345', {
    cancelToken: new CancelToken(function executor(c) {
      // An executor function receives a cancel function as a parameter
      cancel = c;
    })
  });

  // cancel the request
  cancel();
  ```

> 需要注意的是在`catch`中捕获异常时，应该使用`axios.isCancel()`判断当前请求是否是主动取消的，以此来区分普通的异常逻辑。

### 封装取消请求逻辑

上面有两种取消请求，用哪种都是可以的，这里使用第二种。

取消请求主要有两个场景：

- 当请求方式`method`，请求路径`url`，请求参数（`get`为`params`，`post`为`data`）都相同时，可以视为同一个请求发送了多次，需要取消之前的请求
- 当路由切换时，需要取消上个路由中未完成的请求

我们封装几个方法：

```js
// 声明一个 Map 用于存储每个请求的标识 和 取消函数
const pending = new Map()
/**
 * 添加请求
 * @param {Object} config 
 */
const addPending = (config) => {
  const url = [
    config.method,
    config.url,
    qs.stringify(config.params),
    qs.stringify(config.data)
  ].join('&')
  config.cancelToken = config.cancelToken || new axios.CancelToken(cancel => {
    if (!pending.has(url)) { // 如果 pending 中不存在当前请求，则添加进去
      pending.set(url, cancel)
    }
  })
}
/**
 * 移除请求
 * @param {Object} config 
 */
const removePending = (config) => {
  const url = [
    config.method,
    config.url,
    qs.stringify(config.params),
    qs.stringify(config.data)
  ].join('&')
  if (pending.has(url)) { // 如果在 pending 中存在当前请求标识，需要取消当前请求，并且移除
    const cancel = pending.get(url)
    cancel(url)
    pending.delete(url)
  }
}
/**
 * 清空 pending 中的请求（在路由跳转时调用）
 */
export const clearPending = () => {
  for (const [url, cancel] of pending) {
    cancel(url)
  }
  pending.clear()
}
```

`Map`是`ES6`中一种新型的数据结构，本身提供了诸多方法，方便操作，适合当前场景。如果不熟悉的可以查看[ECMAScript 6 入门](http://es6.ruanyifeng.com/#docs/set-map#Map)。

在给`config.cancelToken`赋值的时候，需要判断当前请求是否已经在业务代码中使用了`cancelToken`

`qs`是一个专门用来转换对象和字符串参数的库，最初是由 [TJ](https://github.com/tj/node-querystring) 创建并维护的，也是`axios`推荐使用的参数序列化库。这里我们的目的只是单纯的将参数对象转换为字符串方便拼接。

`Map`结构默认部署了`Symbol.iterator`属性，可以使用`for...of`循环直接获取键名和键值，当然你也可以使用`for...in`循环。

### 在 axios 拦截器中使用

主要的方法已经写好了，只需要添加到`axios`拦截器中就可以了。

```js
axios.interceptors.request.use(config => {
  removePending(options) // 在请求开始前，对之前的请求做检查取消操作
  addPending(options) // 将当前请求添加到 pending 中
  // other code before request
  return config
}, error => {
  return Promise.reject(error)
})

axios.interceptors.response.use(response => {
  removePending(response) // 在请求结束后，移除本次请求
  return response
}, error => {
  if (axios.isCancel(error)) {
    console.log('repeated request: ' + error.message)
  } else {
    // handle error code
  }
  return Promise.reject(error)
})
```

将`clearPending()`方法添加到`vue`路由钩子函数中

```js
router.beforeEach((to, from, next) => {
  clearPending()
  // ...
  next()
})
```

### 测试效果

最后我们可以在浏览器中测试下，可以将`chrome`中控制面板的`Network`的网络状态切换为`Slow 3G`来模拟网速慢的情况。

我们把查询按钮的`loading`或者`disabled`属性干掉来方便测试

![cancel](<https://blog.qiniu.qyhever.com/axios-cancel.gif>)

在上面控制面板中可以看到，红色的`status`为`canceled`的就是被取消的请求。

上面代码在[e-admin-vue](https://github.com/qyhever/e-admin-vue)（一个使用 vue + element-ui + vue-cli3 构建的 rbac 权限模型）或者[e-admin-react](https://github.com/qyhever/e-admin-react)（一个使用 react + antd + create-react-app 构建的 rbac 权限模型）中都有体现，欢迎 star。

