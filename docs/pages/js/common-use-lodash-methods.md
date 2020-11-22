# 开发中常用的 lodash 方法

### compact
返回一个新数组，包含原数组中所有的非假值元素。例如false, null, 0, "", undefined, 和 NaN 都是被认为是“假值”。
例子：
```javascript
_.compact([0, 1, false, 2, '', null, 3])
// => [1, 2, 3]
```

自己实现：
```javascript
[0, 1, false, 2, '', null, 3].filter(Boolean)
// => [1, 2, 3]
```


### flatten
减少一级array嵌套深度。
例子：
```javascript
_.flatten([1, [2, [3, [4]], 5]])
// => [1, 2, [3, [4]], 5]
```

自己实现：
```javascript
[].concat(...[1, [2, [3, [4]], 5]])
// => [1, 2, [3, [4]], 5]
```


### flattenDeep
将array扁平化为一维数组。
例子：
```javascript
_.flattenDeep([1, [2, [3, [4]], 5]])
// => [1, 2, 3, 4, 5]
```

自己实现：
```javascript
function flattenDeep(arr) {
  let ret = []
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    if (Array.isArray(item)) {
      ret = ret.concat(flattenDeep(item))
    } else {
      ret.push(item)
    }
  }
  return ret
}
flattenDeep([1, [2, [3, [4]], 5]])
// => [1, 2, 3, 4, 5]
```



### nth
获取array数组的第n个元素。如果n为负数，则返回从数组结尾开始的第n个元素。
例子：
```javascript
var array = ['a', 'b', 'c', 'd']
 
_.nth(array, 1)
// => 'b'
 
_.nth(array, -2)
// => 'c'
```
一般情况下，我们使用下标的方式可能会更方便，但是如果要获取数组结尾开始的第n个元素 使用 `nth` 更直观，因为 `js` 中数组不支持通过负数索引获取结尾的元素，只能通过数组长度来计算正数索引

自己实现：
```javascript
var array = ['a', 'b', 'c', 'd']
 
array[1]
// => 'b'
 
array[array.length - 2]
// => 'c'
```


### intersection
返回两个数组的交集
例子：
```javascript
_.intersection([2, 1, 3], [4, 2, 3])
// => [2, 3]
```
自己实现：
```javascript
function intersection(a, b) {
  return a.filter(v => b.indexOf(v) >= 0)
}
intersection([2, 1, 3], [4, 2, 3])
// => [2, 3, 1]
```
开发中有时候并不是上面的单纯的数值集合，大部分都是对象集合，那么可以使用 `intersectionBy`
> lodash 中很多方法（名字By结尾的方法）都支持，iteratee（迭代函数）参数，调用每一个数组（array）的每个元素以产生唯一性计算的标准
返回两个对象数组中某个属性集合的交集
例子：
```javascript
var a = [
  { val: 2 },
  { val: 1 },
  { val: 3 }
]
var b = [
  { val: 4 },
  { val: 2 },
  { val: 3 }
]
_.intersectionBy(a, b, v => v.val)
// _.intersectionBy(a, b, 'val')
// => [{ val: 2 }, { val: 3 }]
```



### union
返回两个数组的并集
例子：
```javascript
_.union([2, 3], [1, 2, 3])
// => [2, 3, 1]
```

自己实现：
```javascript
function union(a, b) {
  return a.concat(b.filter(v => !a.includes(v)))
}
union([2, 3], [1, 2, 3])
// => [2, 3, 1]
```
`union` 也有对应的 `unionBy` 方法，返回两个对象数组中某个属性集合的并集
例子：
```javascript
var a = [
  { val: 2 },
  { val: 1 },
  { val: 3 }
]
var b = [
  { val: 4 },
  { val: 2 },
  { val: 3 }
]
_.unionBy(a, b, v => v.val)
// _.unionBy(a, b, 'val')
// => [{ val: 2 }, { val: 1 }, { val: 3 }, { val: 4}]
```



### uniq
返回一个去重后的新数组
例子：
```javascript
_.uniq([3, 2, 1, 3, 2, 1])
// => [3, 2, 1]
```


### uniqnBy
返回一个去重后的新数组
例子：
```javascript
var a = [
  {val: 3},
  {val: 2},
  {val: 1},
  {val: 3},
  {val: 2},
  {val: 1}
]
_.uniqBy(a, v => v.val)
// _.uniqBy(a, 'val')
// => [{val: 3}, {val: 2}, {val: 1}]
```


### debounce
函数防抖，一般使用在 输入框 远程搜索、输入框 校验
例子：
```javascript
function handler() {
  // async query
}
var debounced = _.debounce(handler, 200)
// 200 ms 内不再输入，则会调用 handler 函数
el.addEventListener('input', debounced)
```



### throttle
函数节流，一般使用在 滚动事件、窗口大小变化事件
例子：
```javascript
function handler() {
  // some code
}
var throttled = _.throttle(handler, 200)
// 滚动过程中，每隔 200 ms 调用一次 handler 函数
window.addEventListener('scroll', throttled)
```



### cloneDeep
对象深拷贝
例子：
```javascript
var arr = [{ a: 1 }, { b: 2 }]
 
var deep = _.cloneDeep(arr)
arr[0].a = 3
console.log(arr) // [{ a: 3 }, { b: 2 }]
console.log(deep) // [{ a: 1 }, { b: 2 }]
```



### isEqual
执行深比较来确定两者的值是否相等，是比较值不是比较引用
例子：
```javascript
var object = { a: 1 }
var other = { a: 1 }
 
_.isEqual(object, other)
// => true
 
object === other
// => false
```



### maxBy
对于一个数组项为对象的数组，给定一个属性值，返回这个属性值最小的数组项
例子：
```javascript
var arr = [{ a: 1 }, { a: 2 }]
 
_.maxBy(arr, v => v.a)
// _.maxBy(arr, 'a')
// => { a: 2 }
```


### minBy
对于一个数组项为对象的数组，给定一个属性值，返回这个属性值最小的数组项
例子：
```javascript
var arr = [{ a: 1 }, { a: 2 }]
 
_.minBy(arr, v => v.a)
// _.minBy(arr, 'a')
// => { a: 1 }
```



### mean
计算 array 的平均值
例子：
```javascript
var arr = [4, 2, 8, 6]
 
_.mean(arr)
// => 5
```
对应的 `meanBy` 方法
```javascript
var arr = [
  { val: 4 },
  { val: 2 },
  { val: 8 },
  { val: 6 }
]
 
_.meanBy(arr, v => v.val)
// _.meanBy(arr, 'val')
// => 5
```



### sum
计算 array 中值的总和
例子：
```javascript
var arr = [4, 2, 8, 6]
 
_.sum(arr)
// => 20
```
对应的 `sumBy` 方法
```javascript
var arr = [
  { val: 4 },
  { val: 2 },
  { val: 8 },
  { val: 6 }
]
 
_.sumBy(arr, v => v.val)
// _.sumBy(arr, 'val')
// => 20
```


### pick
创建一个从 object 中选中的属性的对象
例子：
```javascript
var object = { a: 1, b: '2', c: 3 }
 
_.pick(object, ['a', 'c'])
// => { a: 1, c: 3 }
```



### omit
创建一个从 object 中排除的属性的对象
例子：
```javascript
var object = { a: 1, b: '2', c: 3 }
 
_.omit(object, ['a', 'c'])
// => { b: '2' }
```


### flow
pipe 函数，从左到右调用传入的函数，上一个函数的输出为下一个函数的输入
例子：
```javascript
function add(a) {
  return a + 10
}
function multiply(a) {
  return a * 10
}
// var result = add(multiply(10))
var calculate = flow([multiply, add])
var result = calculate(10)
console.log(res) // 110
```


### flowRight
compose 函数，从右到左调用传入的函数，上一个函数的输出为下一个函数的输入。
react 开发中，可以将多个高阶函数组合起来，单参数 HOC 具有签名 Component => Component。 输出类型与输入类型相同的函数很容易组合在一起。
例子：
```javascript
function add(a) {
  return a + 10
}
function multiply(a) {
  return a * 10
}
// var result = multiply(add(10))
var calculate = flowRight([multiply, add])
var result = calculate(10)
console.log(res) // 200
```

