### 前言

众所周知， js 是一门**弱类型**或者说是**动态语言**。变量没有类型限制，可以随时赋予任意值。

虽然变量的数据类型是不确定的，但是各种运算符对数据类型是有要求的。如果运算符发现，运算值的类型与预期不符，就会自动转换类型。

```javascript
4 + '1' // '41'
```

上述代码中，数值 `4`和字符串`'1'`相加，结果为`'41'`，在运算过程中，JavaScript 将数值`4`自动转换为了字符串`'4'`，类似的转换在 JavaScript 中很常见，我们有必要了解下背后的转换原理。

### js数据类型

js 中的数据类型分两大类：

- 简单数据类型（也称为基本数据类型）：Undefined、Null 、Boolean、Number 和 String
- 复杂数据类型：Object

总共 6 种数据类型（ES6 新增了 Symobal 类型，本文不讨论），相较于其他的语言，js 中的数据类型好像不足以表示所有数据类型。但是，由于 js 的数据类型具有动态性，因此没有再定义其他数据类型的必要了。

在类型转换过程中简单数据类型又称为原始值（原始类型）



### 强制转换

 JavaScript 内置三个转型函数，可以使用`Number()`、`String()`和`Boolean()`，手动将各种类型的值，分别转换成数字、字符串或者布尔值。

#### Number()

其实把非数值转换为数值的函数除了`Number()`，`parseInt()`和`parseFloat()`也经常用到。转型函数`Number()`可以用于任何数据类型，而后面两个专门用于把字符串转换为数值。

##### 原始类型值

- 布尔值，`true `和`false `分别被转换为`1`和`0`
- 数字值，原样返回
- `null `值，返回`0`
- `undefined`，返回`NaN`
- 字符串
  - 如果是空字符串，返回`0`
  - 如果是字符串中只包含数字（包括前面带正负号的情况），则将其转换为十进制数值（例如`"123"`转换为`123`），前面的零会被忽略（例如`"011"`转换为`11`）
  - 如果字符串中是有效的浮点数，如`"1.2"`，返回`1.2`（前面的零会被忽略，例如`"01.2"`转换为`1.2`）
  - 如果是有效的十六进制格式，如`"0xf"`，则将其转换为相同大小的十进制整数值
  - 其他格式的字符串，则返回 NaN

```javascript
Number(true) // 1
Number(false) // 0
Number(10) // 10
Number(null) // 0
Number(undefined) // NaN
Number('') // 0
Number('10') // 10
Number('010') // 10
Number('1.2') // 1.2
Number('01.2') // 1.2
Number('0xf') // 15
Number('hello') // NaN
```

##### 对象

对象类型的转换稍微有点复杂：

1. 调用对象自身的`valueOf()`方法，如果返回原始类型的值，则直接对该值使用`Number`函数，不再进行后续步骤。
2. 如果`valueOf()`方法返回对象，则调用对象自身的`toString()`方法。如果`toString()`方法返回原始类型的值，则直接对该值使用`Number()`函数，不再进行后续步骤。
3. 如果`toString()`方法返回的是对象，则报错

```javascript
var obj = {a: 1}
Number(obj) // NaN

// 等同于下面步骤
if (typeof obj.valueOf() === 'object') {
    Number(obj.toString())
} else {
    Number(obj.valueOf())
}
```

上面代码中，首先调用`valueOf()`，结果返回对象本身；继续调用`toString()`，返回字符串`[object Object]`，对此字符串调用`Number()`，返回`NaN`。

大多数情况下，对象的`valueOf()`方法返回对象自身，所以一般会调用`toString()`方法，而`toString()`方法一般返回对象的类型字符串（例如`[object Object]`），所以`Number()`的参数是对象时，一般返回`NaN`。

如果`toString()`方法返回的不是原始类型的值，就会报错，我们可以重写对象的`toString()`方法：

```javascript
var obj = {
    valueOf: function() {
        return {}
    },
    toString: function() {
        return {}
    }
}
Number(obj)
// TypeError: Cannot convert object to primitive value
```

数组类型的情况有点不一样，对于空数组，转换为`0`；对于只有一个成员（且该成员为能够被`Number()`转换的值即转换结果不为`NaN`）的数组，转换为该成员的值；其他情况下的数组，转换为`NaN`。

```javascript
Number([]) // 0
Number([10]) // 10
Number([null]) // 0
Number([[10]]) // 10
```

数组类型和一般对象的转换结果不一样，主要是因为数组的`toString()`方法内部重写了，直接调用不会返回`[object Array]`，而是返回每个成员（会先转换成字符串）拼接成的字符串，中间以逗号分隔。

```javascript
[10].toString() // '10'
[null].toString() // ''
[1, 10].toString() // '1,10'
```



##### parseInt()

因为`Number()`函数在转换字符串时比较复杂而且不太适用，因此在处理字符串转换为整数的时候更常用的是`parseInt()`函数。`parseInt()`函数在转换字符串时，更多的是看起其是否符合数值模式。它会忽略字符串前面的空格，直至找到第一个非空格字符。

- 如果第一个字符不是数字字符或者负号，`parseInt()`就会返回`NaN`；因此，用`parseInt()`转换空字符串会返回`NaN`（`Number()`对空字符串返回`0`）。
- 如果第一个字符是数字字符，`parseInt()`会继续解析第二个字符，直到解析完所有后续字符或者遇到了一个非数字字符。例如，`'123abc'`会被转换为`1234`，因为`'abc'`会被完全忽略；`'22.5'`会被转换为`22`，因为小数点不是有效的数字字符。
- 如果字符串中的第一个字符是数字字符，`parseInt()`也能够识别出各种整数格式（十进制、八进制、十六进制）。如果字符串以`'0x'`开头且后面是数字字符，就会当成一个十六进制整数；如果字符串以`0`开头且后面是数字字符，则会将其当做八进制整数。

```javascript
parseInt('123abc') // 123
parseInt('') // NaN
parseInt('a12') // NaN
parseInt('0xa') // 10(十六进制数)
parseInt('12.5') // 12
parseInt('070') // 56(八进制数)
```

上述代码中`parseInt('070')`在浏览器中测试会返回`10`，前面的零会被忽略掉。其实`parseInt()`可以传入第二个参数，转换的基数（想要以什么进制来转换）

```javascript
parseInt('0xaf') // 175
parseInt('af') // NaN
// af 本来是有效的十六进制数值，如果指定第二个参数为16，使用十六进制来解析，那么可以省略前面的 0x
parseInt('af', 16) // 175
```

如果不指定基数，`parseInt()`会自行确定如何解析输入的字符串，为了避免不必要的错误，应该总是传入第二个参数，明确指定基数。

> 一般情况下，解析的都是十进制数值，应该始终将 10 作为第二个参数（在语法检查工具 ESLint中，也会提示指定第二个参数）



##### parseFloat()

与`parseInt()`函数类似，`parseFloat()`也是从第一个字符开始解析每个字符，一直解析到最后一个字符。如果遇见一个无效的浮点数字字符，就会停止解析，输出结果。字符串中的第一个小数点是有效的，而第二个小数点就是无效的了，因此它后面的字符都会被忽略。例如，`'12.34.5'`会被转换为`12.34`。

`parseFloat()`会忽略最前面的零，且它只能解析十进制值（没有第二个参数）。

```javascript
parseFloat('123abc') // 123
parseFloat('0xa') // 0
parseFloat('12.3') // 12.3
parseFloat('12.3.4') // 12.3
parseFloat('012.3') // 12.3
```



#### Boolean()

`Boolean()`函数可以将任意类型的值转为布尔值。至于返回的这个值是`true`还是`false`，取决于要转换值的数据类型及其实际值。下表给出了各种数据类型及其对应的转换规则。



| 数据类型      | 转换为true的值      | 转换为false的值     |
| --------- | -------------- | -------------- |
| Boolean   | true           | false          |
| String    | 任何非空字符串        | ""（空字符串）       |
| Number    | 任何非零数字值（包括无穷大） | 0（包括-0和+0）和NaN |
| Object    | 任何对象           | null           |
| Undefined | -              | undefined      |

需要注意的是，所有空对象的转换结果都是`true`，而且布尔对象表示的`false`值（`new Boolean(false)`）的转换结果也是`true`。

```javascript
Boolean({}) // true
Boolean([]) // true
Boolean(new Boolean(false)) // true
```



### String()

`String()`函数可以将任意类型的值转化成字符串，转换规则如下。

##### 原始类型值

- 数值，转为相应的字符串
- 字符串，原样输出
- 布尔值，`true`转换为字符串`'true'`，`false`转换为字符串`'false'`
- `undefined`，转为字符串`'undefined'`
- `null`，转为字符串`'null'`

```javascript
String(123) // '123'
String('abc') // 'abc'
String(true) // 'true'
String(undefined) // 'undefined'
String(null) // 'null'
```



##### 对象

`String()`函数的参数如果是对象，返回一个类型字符串；如果是数组，返回该数组的字符串形式。

`String()`函数背后的转换规则，与`Number()`函数基本相同，区别是互换了`valueOf()`方法和`toString()`方法的执行顺序。

1. 先调用对象自身的`toString()`方法。如果返回原始类型的值，则对该值使用`String()`函数，不再进行以下步骤。
2. 如果`toString()`方法返回的是对象，再调用对象的`valueOf()`方法。如果`valueOf()`方法返回原始类型的值，则对该值使用`String()`函数，不再进行以下步骤。
3. 如果`valueOf()`方法返回的是对象，就报错。

```javascript
String({name: 1}) // '[object Object]'
// 等同于
String({name: 1}.toString())
String('[object Object]')  // '[object Object]'
```

上面代码先调用对象的`toString()`方法，会返回字符串`'[object Object]'`，然后对该值使用`String()`函数，不会再调用`valueOf()`方法，输出`'[object Object]'`。

如果`toString()方`法和`valueOf()`方法，返回的都是对象，就会报错，可以重写对象的这两个方法来验证：

```javascript
var obj = {
  valueOf: function() {
    return {}
  },
  toString: function() {
    return {}
  }
}
String(obj)
// TypeError: Cannot convert object to primitive value
```



### 自动转换

类型转换中一个难点就是自动转换（也称隐式转换），由于在一些操作符下其类型会自动转换，这使得 js 尤其灵活，但同时又难以理解。

JavaScript 会自动转换数据类型的情况主要有三种：

- 不同类型的数据互相运算

  ```javascript
  1 == '1' // true
  1 + 'a' // '1a'
  ```

- 条件控制语句的条件表达式为非布尔值类型

  ```javascript
  if ('a') {
    console.log('success')
  }
  // 'success'
  ```

- 对非数值类型的值使用一元运算符（`+`和`-`）

  ```javascript
  +{a: 1} // NaN
  -[1] // -1
  ```

自动转换的规则是这样的：预期什么类型的值，就调用该类型的转换函数。比如，某个位置预期为字符串，就调用`String()`函数进行转换。如果该位置即可以是字符串，也可能是数值，那么默认转为数值。

由于自动转换具有不确定性，而且不易排错，建议在预期为布尔值、数值、字符串的地方，全部使用`Boolean()`、`Number()`和`String()`函数进行显式转换。

#### ToBoolean

JavaScript 遇到预期为布尔值的地方（比如`if`语句的条件部分），就会将非布尔值自动转换为布尔值，自动调用`Boolean()`函数，其转换规则在上面已经说过。

这些转换规则对于条件类语句非常重要，在运行过程中，会自动执行相应的`Boolean`转换。

```javascript
var str = 'abc'
if (str) {
    console.log('success')
} // 'success'
str && 'def' // 'def'
```

运行上面代码，就会输出字符串`success`，因为字符串`abc`被自动转换成了对应的`Boolean`值（true）。由于存在这种自动执行的`Boolean`转换，因此在条件类语句中知道是什么类型的变量非常重要。

常见的自动转换布尔值还有下面两种：

```javascript
// 三目运算符
expression ? true : false

// 双重取反
!!expression
```

上面两种写法，内部其实还是调用的`Boolean()`函数。



#### ToString

JavaScript 遇到预期为字符串的地方，就会将非字符串值自动转为字符串。字符串的自动转换，主要在字符串的加法运算，当一个值为字符串，另一个值为非字符串时，非字符串会自动转换。

自动转换一般会调用非字符串的`toString()`方法转换为字符串（`null`和`undefined`没有`toString()`方法，调用`String()`方法转换为`'null'`和`'undefined'`），转换完成得到相应的字符串值，然后就是执行加法运算，即字符串的拼接操作了。

```javascript
'1' + 2 // '12'
'1' + true // '1true'
'1' + false // '1false'
'1' + {} // '1[object Object]'
// 数组的 toString 方法经过重写，返回每个成员以逗号分隔拼接成的字符串
// 下面一行等同于, '1' + '', 结果为 '1'
'1' + [] // '1'
'1' + function (){} // '1function (){}'
'1' + undefined // '1undefined'
'1' + null // '1null'
```

上面代码需要注意的是字符串与函数的加法运算，会先调用函数的`toString()`方法，它始终返回当前函数的代码（看起来就像源代码一般）。

```javascript
(function (){}).toString() // 'function (){}'
(function foo(a){ return a + b }).toString() // 'function foo(a){ return a + b }'
```

所以转换之后就是`'1'`和`'function (){}'`的拼接操作，结果为`'1function (){}'`。



#### ToNumber

JavaScript 遇到预期为数值的地方，就会将非数值自动转换为数值，系统内部会自动调用`Number()`函数。

除了加法运算符（`+`）有可能（可能会是字符串拼接的情况）把自动转换，其他运算符都会把非数值自动转成数值。`Number()`函数的转换规则前面已经说过，下面看看几个例子：

```javascript
'3' - '2' // 1
'3' * '2' // 6
true - 1  // 0
false - 1 // -1
'1' - 1   // 0
'3' * []    // 0
false / '3' // 0
'a' - 1   // NaN
null + 1 // 1
undefined + 1 // NaN
```

上面代码中需要注意的是，`null`会被转换为`0`，`undefined`会被转换为`NaN`

> NaN，即非数值，是一个特殊的数值，用于表示一个将要返回数值而未返回数值的情况。关于这个值，需要注意两点，第一是任何涉及到与 NaN 的运算操作，都会返回 NaN；第二是 NaN 不等于自身（即 NaN === NaN 为 false），检测 NaN 需要使用专用的 isNaN 函数。



#### 相等操作符

`==`在比较时，如果被比较的两个值类型不同，那么系统会自动转换成相同类型再比较。

`==`并不是严格的比较，只是比较两者的数值。

在比较不同的数据类型时，有下面几种情况：

- 如果有一个操作数为布尔值，这在比较之前先将其转换为数值——`false`转换为`0`，`true`转换为`1`。

- 如果有一个操作数为字符串，另一个操作数为数值，在比较之前先将字符串转换为数值。

- 如果有一个操作数为对象，另一个操作数不是，则调用对象的`valueOf()`方法或`toString()`方法，用得到的基本类型值按照起那么的规则比较。

- 如果两个操作符都为对象，这比较它们是不是同一个对象，如果都指向同一个对象，则为`true`（比较引用）

- 只要有一个操作数为`NaN`，一律返回`false`

- `null`和`undefined`比较，不会进行转换，直接返回`true`

  下面看看几个例子：

  ```javascript
  false == 0 // true
  true == 1 // true
  true == 3 // false
  '5' == 5 // true
  var o = {name: 'foo'}
  o == 1 // false
  o == '[object Object]' // true，前面的 o 对象转换为基础类型值 '[object Object]'
  undefined == 0 // false
  null == 0 // false
  null == undefined // true
  'NaN' == NaN // false
  1 == NaN // false
  NaN == NaN // false
  ```

在开发时，在遇到不确定是字符串还是数值时，可能会使用`==`来比较，这样就可以不用手动强制转换了。但其实这是偷懒的表现，还是规规矩矩的先强制转换后再比较，这样代码看上去逻辑会更清晰（如果配置了语法检测工具`eslint`，它的建议就是一直使用`===`而不使用`==`，避免自动转换）



### toString()方法总结

前面提到了这么多转换规则，有很多都是调用的`toString()`之后才继续执行的，我们有必要总结下`toString()`的返回值。

下面是各种类型的返回情况：

- 数值返回当前数值的字符串形式
- 字符串直接返回
- 布尔值返回当前值的字符串形式
- `null`和`undefined`没有`toString()`方法，一般使用`String()`，分别返回`'null'`和`'undefined'`
- 对象返回当前对象的类型字符串（例如`'[object Object]'`，`'[object Math]'`)
- 函数返回当前函数代码，例如：`function foo(){}`返回`'function foo(){}'`（各浏览器返回可能有差异）
- 数组返回每个成员（会先转换成字符串）拼接成的字符串，中间以逗号分隔（可以理解为调用了`join()`方法），例如：`[1, 2, 3]`返回`'1,2,3'`
- 日期对象返回当前时区的时间字符串表示，例如：`new Date('2018-10-01 12:12:12').toString()` 返回`'Mon Oct 01 2018 12:12:12 GMT+0800 (中国标准时间)'`。但其实在类型转换中`Date`类型一般是调用`valueOf()`，因为它的`valueOf()`方法返回当前时间的数字值表示（即时间戳），返回结果已经是基础类型值了，不会再调用`toString()`方法了。

最后，看几个有意思的类型转换例子

1. +new Date()

   这个返回时间戳的方法相信大家都经常用到，这里`+`运算符的规则和`Number()`转型函数是相同的，对于对象首先会先调用它的`valueOf()`方法，`Date`类型的`valueOf()`方法返回当前时间的数字值表示（即时间戳），返回结果为数值，不会继续下一步调用`toSting()`方法，直接对当前返回值使用`Number()`还是返回时间戳

2. (!+[]+[]+![]).length = 9

   xxx.length，粗略一看有`length`属性的就字符串和数组了，所以前面的结果肯定是这两个其中一种。这里是类型转换，不可能出现转换为数组的情况，那么只可能是字符串，下面我们分析一下。

   首先拆开来看，就是`!+[]`、`[]`、`![]`的相加操作

   `!+[]`会进行如下转换

   ```javascript
   [].toString() // ''
   +'' // 0
   !0 // true
   ```

   都转换完成后，就是`true`、`''`、`false`的相加操作，结果为`'truefalse'`，最后结果就是`9`

3. [] + {} 和 {} + []

   先说 [] + {} 。一个数组加一个对象。

   `[]` 和 `{}` 的 `valueOf()`都返回对象自身，所以都会调用 `toString()`，最后的结果是字符串串接。`[].toString()` 返回空字符串，`({}).toString()` 返回`'[object Object]'`。最后的结果就是`'[object Object]'`。

   然后说 {} + [] ，看上去应该和上面一样。但是 `{}` 除了表示一个对象之外，也可以表示一个空的`block`。

   在 [] + {} 中，`[]` 被解析为数组，因此后续的 `+` 被解析为加法运算符，而 `{}` 就解析为对象。但在 `{} + []` 中，开头的`{}` 被解析为空的 `block`，随后的 `+` 被解析为正号运算符，最后的结果就是`0`。即实际上成了：

```javascript
   {} // empty block 
   +[] // 0
```

相信不少人在遇到类型转换尤其是自动转换的时候，都是靠猜的。现在看了这么多底层的转换规则，应该或多或少的对其都有了一定的了解了。