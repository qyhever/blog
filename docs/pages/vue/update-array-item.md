vue 中如何更新数组某一项，这是开发中经常遇到的问题

例如：data 里面有个 list 数组，数组里面有三项
```javascript
export default {
  data() {
    return {
      list: [
        'foo',
        'bar',
        'baz'
      ]
    }
  }
}
```
如何将第二项的值更新为 `'jerry'`

不少小伙伴可能都试过 `this.list[1] = 'jerry'` ，但遗憾的是页面并不会更新
这种方法确实改变了 `list[1]` 的值，但没法触发页面更新

那么在 `Vue` 中，如何更新数组某一项呢？下面是总结的一些方法：

### 数组原生方法
`Array.prototype.splice` 被称为数组最强大的方法，具有删除、增加、替换功能，可以用 `splice` 来更新
```javascript
this.list.splice(1, 1, 'jerry')
```
为什么 splice 可以触发更新？
`Vue` 将被侦听的数组（这里就是`list`）的变更方法进行了包裹，所以它们也将会触发视图更新。这些被包裹过的方法包括：
- push()
- pop()
- shift()
- unshift()
- splice()
- sort()
- reverse()
`splice` 不再是数组原生方法了，而是 `Vue` 重写过的方法
部分源码：
```javascript
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    return result
  })
})
```
可以看到，`splice` 除了执行本身的逻辑(`original.apply(this, args)`)之外，会把插入的值变成响应式对象(`observeArray(inserted)`)，然后调用 `ob.dep.notify()` 手动触发依赖通知。
[详情src/core/observer/array.js](https://github.com/vuejs/vue/blob/dev/src/core/observer/array.js)

### 官方 API Vue.set()
`Vue.set` 是官方提供的全局 API，别名 `vm.$set`，用来主动触发响应

```javascript
Vue.set(this.list, 1, 'jerry')
// 或者
this.$set(this.list, 1, 'jerry')
```

其实 `set` 方法本质上还是调用的 `splice` 方法来触发响应，部分源码
```javascript
function set (target: Array<any> | Object, key: any, val: any): any {
  // ...
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }
  // ...
}
```
当 `set` 的第一个参数为数组时，直接调用 `target.splice()`
[详情src/core/observer/index.js](https://github.com/vuejs/vue/blob/dev/src/core/observer/index.js#L207)

### vm.$forceUpdate()
强制使 `Vue` 实例重新渲染，其实 `this.list[1] = 'jerry'` 操作，`list` 确实已经更改了，我们调用 `vm.$forceUpdate()` 可以强制渲染
```javascript
this.list[1] = 'jerry'
this.$forceUpdate()
```

通常你应该避免使用这个方法，而是通过数据驱动的正常方法来操作

当你无路可走的时候，可以试试这个方法，但此方法不可滥用，想想你只是想更改某个数组项，但是却可能更新了整个组件

正如官网所说的：
> 如果你发现你自己需要在 Vue 中做一次强制更新，99.9% 的情况，是你在某个地方做错了事。

### 深拷贝
一般粗暴的都是通过 序列化然后反序列化 回来 来实现
```javascript
this.list[1] = 'jerry'
this.list = JSON.parse(JSON.stringify(this.list))
```
可能你还会封装自己的 `cloneDeep` 方法，虽然也能触发响应，但是仅仅是更新某一项就要用到深拷贝，确实有点别扭

### map()
`map` 是数组的原生方法，用来做数组映射，类似的非变更方法（不会改变原数组）还有 `slice`、`concat`、`filter` 这些，它们不会变更原始数组，而总是返回一个新数组
那么在 `Vue` 中我们直接替换数组也是可以实现更新的
```javascript
this.list = this.list.map((item, index) => {
  if (index === 1) {
    return 'jerry'
  }
  return item
})
```
你可能认为这将导致 `Vue` 丢弃现有 `DOM` 并重新渲染整个列表。幸运的是，`Vue` 做的够多。`Vue` 为了使得 `DOM` 元素得到最大范围的重用而实现了一些智能的启发式方法，所以用一个含有相同元素的数组去替换原来的数组是非常高效的操作。还记得在模板中使用 `v-for` 必须要提供 `key` 吗，`Vue` 根据这个 `key` 值能够更高效的找出差异，精准定位并更新。

实际上，这种基于源数据生成新数据（同时不影响外部）的方式符合函数式编程的思想，如果你用过 `redux`，那么在写 `reducer` 时会经常用到 `map`、`filter` 这些


### 数组项为对象的情况
在开发中可能会遇到 `this.list[1].name = 'jerry'` 这种情况，如果数组项是对象，那么是可以通过下标直接更新这个对象的属性
其实是 `Vue` 在初始化数组的时候做了处理，对于数组项是非对象会直接返回，不做操作，如果是对象，那么会用 `Observer` 类初始化它，给对象属性加上 `getter`、`setter`监听器
部分源码：
```javascript
class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that have this object as root $data

  constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      if (hasProto) {
        protoAugment(value, arrayMethods)
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}
```
`Observer` 类初始化时，如果是数组，一般情况下会调用 `protoAugment()`、`observeArray()`。`protoAugment` 会将 `value`（数组） 的 `__proto__` 指向 `arrayMethods`，这里着重看 `observeArray`，它会在每个数组项调用 `observe()`，`observe` 如下：
```javascript
export function observe (value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}
```
可以看到，如果数组项不是对象，会直接返回；数组项为对象，会对该对象继续进行 `Observer` 初始化，进而调用 `walk()`，对每个属性调用 `defineReactive()`，
`defineReactive` 会通过`Object.defineProperty`给属性加上 `getter`、`setter`监听器，所以给数组项重新赋值就会触发响应了
[详情src/core/observer/index.js](https://github.com/vuejs/vue/blob/dev/src/core/observer/index.js#L53)

关于为什么 `Vue` 没有将 `arr[index] = val` 变成响应式，网上有很多讨论，作者也有回答，大体来说，就是 **性能代价和获得的用户体验不成正比**。
`arr[index] = val` 虽然不是响应式，但也有提供的官方 `API` 来操作，作为一个框架，`Vue` 已经做的够多了。当然 `Vue3` 将 `Object.defineProperty` 换成了 `Proxy`，那么这个问题也就不复存在了。
