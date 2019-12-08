### 前言

在浏览器中频繁的 DOM 操作比非 DOM 操作需要更多的内存和 CPU 时间，连续进行过多的 DOM 操作可能导致浏览器挂起，甚至崩溃，从而影响用户体验。

函数节流和防抖技术，属于高级函数中的一种，作用都是为了防止函数（通常函数中会进行或多或少的 DOM 操作）被高频调用，从而提高性能，加快浏览器反应速度。

### 常见场景

```js
window.onresize = function() {
  console.log(123);
};
```

比较常见的如绑定了 onscroll、onresize、onkeyup 这类事件，事件触发会持续执行事件处理的回调函数，意味着浏览器时时刻刻都在进行计算，导致页面出现延迟、卡顿现象。对于此类场景，通常使用函数节流与防抖技术来进行性能优化。

### 函数防抖 debounce

> 当调用函数过n毫秒后，才会执行该函数，若在这n毫秒内又调用此函数则将重新计算执行时间

```js
function debounce (fn, delay) {
  var timer = null;
  return function() {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function() {
      fn.apply(context, args);
    }, delay);
  };
}
```

使用：

```js
function handleResize() {
  console.log(123);
}
window.onresize = debounce(handleResize, 300);
```

这样每次都会间隔 300 ms 打印，原理：使用闭包实现一个 timer 变量，用来记录上一次调用函数的定时器。在事件触发时不是直接调用函数，在中间有一个间隔。如果两次调用的时间差小于设定值，则清除上一个定时器，再次启动一个定时器，这样就降低了函数的调用频率。

高程3中的方式：

```js
function debounce(fn, delay) {
  clearTimeout(fn.timer);
  var context = this;
  fn.timer = setTimeout(function() {
    fn.call(context);
  }, delay);
}
```

使用需注意：

```js
// 这里的 debounce 只是延时了回调函数，所以不能像前面那样使用
window.onresize = function () {
  debounce(handleResize, 300);
};
```

写法和前面有所区别，效果其实是一样，都减少了回调函数的调用频率。但是，函数防抖有点小问题，就是在事件持续触发过程中，执行回调函数的定时器会一直被清除，不会执行，只有在事件停止触发并经过设定值后才执行。这时候，需要通过函数节流解决一直不执行的问题。

### 函数节流 throttle

> 预先设定一个执行周期，当调用函数的时刻大于等于执行周期则执行该函数，然后进入下一个新周期。

方法一：使用一个节流阀来实现

```js
// 引入 flag 变量
function throttle(fn, delay) {
  var flag = true;
  return function() {
    if (!flag) return;
    var context = this, args = arguments;
    flag = false;
    setTimeout(function() {
      fn.apply(context, args);
      flag = true;
    }, delay);
  }
}
// 直接判断 timerId
function throttle(fn, delay) {
  var timer;
  return function() {
    var context = this, args = arguments;
    if (!timer) {
      timer = setTimeout(function() {
        timer = null;
        fn.apply(context, args);
      }, delay);
    }
  }
}
```

使用一个标记来记录是否到达设定值

方法二：记录时间差来实现

```js
function throttle(fn, delay) {
  var start = +new Date(), timer = null;
  return function() {
    var now = +new Date(), context = this, args = arguments;
    if (now - start >= delay) {
      fn.apply(context, args);
      start = now;
    }
  };
}
```

上面代码中记录两次调用函数的时间，大于或等于设定值则执行回调函数。

### 总结

函数防抖：在设定时间内，回调函数只会调用一次，即触发事件的最后一次。适用于 input 联想搜索场景。

函数节流：事件持续触发时，每隔一段时间就会调用一次。适用于 onscroll、onresize 此类事件。

参考：[浅谈Debounce 与Throttle](http://ghmagical.com/article/page/id/4qrB9JeihTKD)