基于 axios 封装一个“听话”的请求函数

在网上看了许多关于 axios 的封装，感觉不够全面，也不太适合我，于是就自己瞎折腾下吧。。。

```
this.loading = true
axios.get('http://xxx', params)
	.then(res => {
		if (res.code === 1) {
      		this.$message.success('')
      		this.list = res.data.list
		} else {
      		this.$message.warning('')
		}
	})
	.catch(err => {
      // ...
	})
	.finally(() => {
      this.loading = false
	})
```

前后端分离开发是现在主流的开发模式，前端的所有数据都是通过接口请求的。有时候是一个很简单的功能，只是想简单的发个请求获取数据，却不得不写一大堆重复代码。

我们想象中的使用方式

```
const list = await axios({})
this.list = list
```



```
axios({
  method: 'get',
  url: 'xxx',
  params: {}
})
axios({
  method: 'post',
  url: 'xxx',
  data
})
```

axios简写方式，所谓 仁者见仁智者见智吧，虽然简便了，但有时候也会出错

规范化，在使用`axios.get`和`axios.post`时，有时候是直接复制过来的，get 请求写成了`axios.get('xxx', params)`，然后看了半天硬是没看出来啥问题，最后发现之后真是想锤爆自己。直接将传参规范化，统一对象参数传递，可能会避免很多错误。