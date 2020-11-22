# 一些常用的函数实现

### 实现一个bind方法（偏函数）
缓存一部分参数，然后让另一些参数在使用时传入
```javascript
function bind(fn, context) {
  var args = Array.prototype.slice.call(arguments, 2)
  return function() {
    var innerArgs = Array.prototype.slice.call(arguments)
    var finalArgs = args.concat(innerArgs)
    return fn.apply(context, finalArgs)
  }
}
```



### 柯里化
将一个多参数函数转化为多个嵌套的单参数函数
```javascript
function curry(fn) {
  var len = fn.length
  var args = [].slice.call(arguments, 1)
  return function() {
    var newArgs = args.concat([].slice.call(arguments))
    if (newArgs.length < len) {
      return curry.apply(null, [fn].concat(newArgs))
    }
    return fn.apply(null, newArgs)
  }
}
// or
function curry(fn) {
  return function curried() {
    var args = [].slice.call(arguments)
    if (args.length >= fn.length) {
      return fn.apply(null, args)
    }
    return function() {
      var rest = [].slice.call(arguments)
      return curried.apply(null, args.concat(rest))
    }
  }
}
// eg:
function add(a, b, c) {
  return a + b + c
}
add(2, 3, 5)
var added = curry(add)
added(2)(3)(5)
```


### compose 函数
compose的作用就是将嵌套执行的方法作为参数平铺，嵌套执行的时候，里面的方法也就是右边的方法最开始执行，然后往左边返回（上个函数的输出结果是下个函数的输入参数）
```javascript
function compose() {
  var args = Array.prototype.slice.call(arguments)
  return function(val) {
    return args.reduceRight(function(res, cb) {
      return cb(res)
    }, val)
  }
}
// eg:
function add(a) {
  return a + 10
}
function multiply(a) {
  return a * 10
}
// 两个函数的嵌套计算，add函数的返回值作为multiply函数的参数
// var result = multiply(add(10))
var calculate = compose(multiply, add)
var result = calculate(10)
console.log(res) // 200
```
compose使用的挺多的，Redux的中间件就是用compose实现的，webpack中loader的加载顺序也是从右往左，它也是compose实现的。

react 开发中经常遇到的情况：
```javascript
withRouter(Form.create()(connect(mapStateToProps, mapDispatchToProps)(ComponentA)))
// 在使用 compose 后
import { compose } from recompose
compose(
  withRouter,
  Form.create(),
  connect(mapStateToProps, mapDispatchToProps)
)(ComponentA)

```

webpack 里面的 compose 代码：
```javascript
const compose = (...fns) => {
  return fns.reduce(
    (prevFn, nextFn) => {
      return value => prevFn(nextFn(value)) 
    },
    value => value
  )
}
```
> compose 传入的每个函数接受的输入应当与上一步函数的输出拥有同样的数据类型，例如: react 的 compose 例子，每个函数的输入和输出都是 Component 组件类型


### pipe 函数
pipe函数跟compose函数的作用是一样的，也是将参数平铺，只不过它的顺序是从左往右。
```javascript
function pipe() {
  var args = Array.prototype.slice.call(arguments)
  return function(val) {
    return args.reduce(function(res, cb) {
      return cb(res)
    }, val)
  }
}
```

Vue 中的 filter 也是类似 pipe 的作用
```html
{{ message | filterA | filterB }}
```
filterA 被定义为接收单个参数的过滤器函数，表达式 message 的值将作为参数传入到函数中。然后继续调用同样被定义为接收单个参数的过滤器函数 filterB，将 filterA 的结果传递到 filterB 中。



### 函数防抖
```javascript
function debounce(fn, interval) {
  var timer = null
  interval = interval || 500
  return function() {
    var context = this, args = arguments
    clearTimeout(timer)
    timer = setTimeout(function() {
      fn.apply(context, args)
    }, interval)
  }
}
```



### 函数节流
```javascript
// 定时器版
function throttle(fn, interval) {
  var timer = null
  interval = interval || 500
  return function() {
    var context = this, args = arguments
    if (!timer) {
      timer = setTimeout(function() {
        timer = null
        fn.apply(context, args)
      }, interval)
    }
  }
}
// 时间差版
function throttle(fn, interval) {
  var start = +new Date(), timer = null
  interval = interval || 500
  return function() {
    var context = this, now = +new Date(), args = arguments
    if (now - start >= delay) {
      fn.apply(context, args)
      start = now
    }
  }
}
```


### 缓存函数
对于相同参数的函数调用，只会计算一次，后面的调用直接从缓存中返回
```javascript
function memoize() {
  var cache = {}
  return function() {
    var key = JSON.stringify(Array.prototype.slice.call(arguments))
    if (cache.hasOwnProperty(key)) {
      return cache[key]
    }
    var val = fn.apply(this, arguments)
    cache[key] = val
    return val
  }
}

// eg:
function add(a) {
  return a + 10
}
var memoized = memoize(add)
var result = memoized(10) // 20, 第一次调用会计算
var result = memoized(10) // 20, 相同参数直接返回
var result = memoized(10) // 20, 相同参数直接返回
```
Vue 中的 computed 实现了具有缓存的作用，computed 的用法是根据依赖项计算返回新的属性，当依赖项没有变化时，不会重新计算



### 对象clone
```javascript
function cloneDeep(obj) {
  var copy
  if (obj === null || typeof obj !== 'object' || typeof obj === 'undefined') {
    return obj
  }
  if (obj instanceof Array) {
    copy = []
    for (var i = 0; i < obj.length; i++) {
      copy[i] = cloneDeep(obj[i])
    }
    return copy
  }
  if (obj instanceof Object) {
    copy = {}
    for (var k in obj) {
      copy[k] = cloneDeep(obj[k])
    }
    return copy
  }
  throw new Error('This type is not supported.')
}
```



### 冒泡排序
```javascript
function swap(arr, x, y) {
  var temp = arr[x]
  arr[x] = arr[y]
  arr[y] = temp
}
function bubbleSort(arr) {
  for (var i = 0; i < arr.length - 1; i++) {
    var flag = true
    for (var j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        flag = false
        swap(arr, j, j + 1)
      }
    }
    if (flag) {
      break
    }
  }
  return arr
}
```



### 数字千分位
```javascript
function toThousand(value) {
  var arr = String(value).split('').reverse()
  var ret = []
  for (var i = 0; i < arr.length; i += 3) {
    ret.push(arr.slice(i, i + 3).reverse().join(''))
  }
  return ret.reverse().join(',')
}
// or
function toThousand(value) {
  return value.toLocaleString()
}
```



### 数组最大深度
```javascript
function getArrDepth(arr) {
  if (!Array.isArray(arr)) {
    return 0
  }
  var temp = []
  arr.forEach(item => {
    temp.push(getArrDepth(item))
  })
  var maxDepth = Math.max(...temp)
  return maxDepth + 1
}
```