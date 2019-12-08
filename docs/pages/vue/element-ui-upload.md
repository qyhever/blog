### 图片上传

无论什么项目，大概都少不了图片上传。作为常见的需求，很多地方会使用到，应该单独封装一个上传组件，方便复用。

这里使用 vue + element-ui-upload + 七牛云完成上传

### 前端调用七牛 API

现在主流的七牛云上传方式大概为授权式上传，大概为如下过程：

- 请求后端接口获取上传凭证 token（后端通过accessKey，secretKey，bucket 生成 token）
- 请求七牛云的接口地址完成上传
- 七牛云服务器返回图片地址（返回 hash，key，需要自己拼接下）

如果说后端很好，在服务器端直接调用七牛上传接口，那么前端只需要传一个文件给后端，前端方面会简单许多。

不过我是没有遇到的，而且前端调用上传接口，可控性会更强些

关于七牛云的上传地址：

- https://up-z2.qiniu.com
- https://up-z2.qiniup.com
- https://upload-z2.qiniu.com
- https://upload-z2.qiniup.com

经过测试，上面四个接口都是可用的（https 或者 http），我这里的空间是华南区域，不同区域会有所不同，[可以参考](https://developer.qiniu.com/kodo/manual/1671/region-endpoint)

七牛 API，有 3 个参数，token、file、key（可选），其中 key 是文件名，不传会自动生成

首先分析下需求，完成的 upload 组件，要和表单结合起来，意味着要实现双向绑定，调用这个组件的时候，只需要绑定 value（图片url） 属性，组件内部上传完成后通过 $emit('input', url) 改变 value，这样就很方便了

下面介绍下 el-upload 组件：

1. action  属性是上传的接口地址，直接用上面的七牛云的上传地址
2. name 字段是文件流的参数字段名，默认值为 file，七牛云上传的文件流参数字段就是 file，所以这里可以忽略
3. data 属性是需要传递的参数，七牛云的上传地址所需参数包括 file（插件会自动传递）、key、token，key 可以不传（七牛自动生成），我们只需要获取 token，在调用七牛之前将 token 塞到 data 中就可以了
4. before-upload 属性是上传文件之前的钩子，这里调用后端接口获取到上传需要的 token，塞到 data 中，然后别忘了 resolve，因为获取 token 是异步过程，所以在钩子里面返回 Promise，请求成功后 resolve 进行上传（如果有校验文件大小、文件类型的需求也可以在钩子中完成，提前返回 false 就可以了）

下面是代码：

```vue
<template>
  <el-upload
    v-loading="loading"
    class="uploader"
    :class="{'hover-mask': value}"
    action="https://up-z2.qiniup.com"
    :show-file-list="false"
    :data="param"
    accept="image/*"
    :on-success="handleSuccess"
    :before-upload="handlebeforeUpload">
      <img v-if="value" :src="value" class="avatar">
      <i class="el-icon-plus uploader-icon"></i>
  </el-upload>
</template>

<script>
import axios from 'axios'
export default {
  props: {
    value: String,
    required: true
  },
  data() {
    return {
      loading: '',
      param: {
        token: ''
      }
    }
  },
  methods: {
    handleSuccess(res, file) {
      this.loading = false
      // 如果不传 key 参数，就使用七牛自动生成的 hash 值，如果传递了 key 参数，那么就用返回的 key 值
      const { hash } = res
      // 拼接得到图片 url
      const imageUrl = 'your domain prefix' + hash
      // 触发事件 input，父组件会修改绑定的 value 值
      this.$emit('input', imageUrl)
    },
    handlebeforeUpload(file) {
      // 这里做可以做文件校验操作
      const isImg = /^image\/\w+$/i.test(file.type)
      if (!isImg) {
        this.$message.error('只能上传 JPG、PNG、GIF 格式!')
        return false
      }
      return new Promise((resolve, reject) => {
        this.loading = true
        // 获取token
        const tokenUrl = 'http://xxx/upload'
        axios.get(tokenUrl).then(res => {
          const { token } = res.data.data
          this.param.token = token
          resolve(true)
        }).catch(err => {
          this.loading = false
          reject(err)
        })
      })
    }
  }
}
</script>

<style scoped lang="scss">
  .uploader {
    width: 130px;
    height: 130px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    &:hover {
      border-color: #409EFF;
    }
    /deep/ .el-upload {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  }
  .uploader-icon {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    line-height: 128px;
    text-align: center;
    font-size: 28px;
    color: #8c939d;
  }
  .avatar + .uploader-icon {
    opacity: 0;
  }
  .avatar {
    width: 128px;
    height: 128px;
    display: block;
    border-radius: 6px;
  }
  .hover-mask:hover .uploader-icon {
    opacity: 1;
    background-color: rgba(0, 0, 0, .2);
    color: #fff;
  }
</style>

```

如何使用：

```vue
<template>
  <el-form ref="form" :model="form">
    <el-form-item label="头像" prop="avatar">
      <upload v-model="form.avatar"></upload>
  	</el-form-item>
    <el-form-item label="姓名" prop="userName">
      <el-input v-model="form.userName"></el-input>
  	</el-form-item>
  </el-form>
	<el-button type="primary" @click="onSubmit">确 定</el-button>
</template>
<script>
import Upload from '@/components/Upload'
export default {
  components: { Upload },
  data () {
    return {
      form: {
        avatar: '',
        userName: ''
      }
    }
  },
  methods: {
    onSubmit() {
      this.$refs.form.validata(valid => {
        if (valid) {
          // 将 this.form 传给后端
        }
      })
    }
  }
}
</script>

```

实现双向绑定后，收集数据会非常方便，调用后端接口直接传递绑定的值就 ok 了

### 前端直接调用后端上传接口

如果后端很好（铁哥们），前端只需要传递 file 对象，那就更简单了，在上传前置钩子中就不用获取 token，这部分工作都由后端去处理，我们只需要调用上传接口就可以

```vue
<template>
  <el-upload
    v-loading="loading"
    class="uploader"
    :class="{'hover-mask': value}"
    action="your upload api"
    :show-file-list="false"
    :on-success="handleSuccess"
    :before-upload="handlebeforeUpload">
      <img v-if="value" :src="value" class="avatar">
    	<i class="el-icon-plus uploader-icon"></i>
  </el-upload>
</template>

<script>
import axios from 'axios'
export default {
  props: {
    value: String,
    required: true
  },
  data() {
    return {
      loading: ''
    }
  },
  methods: {
    handleSuccess(res, file) {
      this.loading = false
      const { hash } = res
      const imageUrl = 'your domain prefix' + hash
      this.$emit('input', imageUrl)
    },
    handlebeforeUpload(file) {
      // 不需要操作可以直接 返回 true
      return true
    }
  }
}
</script>
```

其实，我们在组件上使用`v-model`的时候，实际上是下面这样：

```vue
<custom-upload
  :value="form.avatar"
  @input="form.avatar = $event"
></custom-upload>
```

为了让它正常工作，`custom-upload`组件内必须：

- 将其 `value` 特性绑定到一个名叫 `value` 的 prop 上（这里就是图片地址）
- 需要修` value`时，将新的值通过自定义的 `input` 事件抛出（这里就是上传成功后的`$emit('input', 图片地址)`）

所以 `v-model`是一个语法糖，一种简写形式。如果想要双向绑定，又想自定义，那么可以使用上面的方式：

```vue
<custom-upload
  :url="form.avatar"
  @update:url="form.avatar = $event"
></custom-upload>
```

那么在子组件内部就接受`url`属性，作为图片地址就可以了，在更新`url`时，也要与绑定的事件名一致`$emit('update:url', 图片地址)`，事件名使用`update:propName`是`vue`推荐的风格，目的是提醒开发者这是一个双向绑定的属性。

当然，为了方便起见，`vue`为这种模式提供一个缩写，即 `.sync` 修饰符：

```vue
<custom-upload :url.sync="form.avatar"></custom-upload>
```

> 带有 `.sync` 修饰符的值不能为表达式（例如`:url.sync="domain + form.avatar"`是无效的）

### 多图上传

有时候类似上传资料、凭证这类的需求要求上传多张图片，我们可以再封装一个多图上传的组件

对于 el-upload，多张图片上传注意如下几点：

1. props 的 value 不再是`string`，应该是一个数组，数组成员为图片地址`['url1', 'url2']`
2. file-list属性为上传的文件列表，我们不能直接把 value 赋值给它，file-list应该是一个数组，例如`[{name: 'foo.jpg', url: 'xxx'}, {name: 'bar.jpg', url: 'xxx'}]`。这与我们传进来的数据不一样，需要处理一下 value（当然我们使用组件时可以直接传递需要的这种格式，就不用处理了）
3. show-file-list 设置为 true，当然可以不传，它默认为 true
4. list-type 可以设置为 `'picture-card'`，图片将以卡片形式显示
5. on-remove 属性为文件列表移除文件时的钩子，这里需要触发事件，更新 value
6. on-preview 属性为点击文件列表中已上传的文件时的钩子，可以做图片预览
7. limit 属性可以指定最大允许上传个数，配合 on-exceed 属性（文件超出个数限制时的钩子）使用，当上传超过指定值后，在这个钩子里面做些提示

下面是代码：

```vue
<template>
  <div>
    <el-upload
      :action="QINIU_UPLOAD_URL"
      :data="param"
      :file-list="fileList"
      list-type="picture-card"
      :limit="limit"
      :on-exceed="handleUploadExceed"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      :before-upload="handlebeforeUpload"
      :on-success="handleSuccess">
      <i class="el-icon-plus"></i>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  props: {
    value: {
      type: Array,
      default: () => []
    },
    limit: {
      type: Number,
      default: 4
    }
  },
  data() {
    return {
      dialogImageUrl: '', // 当前预览图片地址
      dialogVisible: false, // 预览弹框 visible
      param: {
        token: ''
      }
    }
  },
  computed: {
    // ['xxx', 'xxx'] 转换为 [{url: 'xxx'}, {url: 'xxx'}]
    fileList() {
      return this.value.map(url => ({ url }))
    }
  },
  methods: {
    handleUploadExceed() {
      this.$message.error(`最多上传${this.limit}张图片`)
    },
    handleRemove(file, fileList) {
      // fileList 为删除后的文件列表
      const value = fileList.map(v => v.url)
      this.$emit('input', value)
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    handlebeforeUpload(file) {
      return new Promise((resolve, reject) => {
        axios.get('/upload/qiniuToken').then(res => {
          const { token } = res.data
          this.param.token = token
          resolve(true)
        }).catch(err => {
          reject(err)
        })
      })
    },
    handleSuccess(res, file) {
      const { hash } = res
      const imageUrl = this.QINIU_PREFIX + hash
      // 这里如果 this.value.push(imageUrl) 这么写，vue会报出警告，大概意思是value作为props不应该在子组件中被修改
      // 应该根据 value 得到新的值，而不能修改它，this.value.concat(imageUrl)也是可以的，concat方法返回新的数组
      this.$emit('input', [...this.value, imageUrl])
    }
  }
}
</script>

```

如何使用：

```vue
<template>
  <el-form ref="form" :model="form">
    <el-form-item label="还款金额" prop="amount">
      <el-input v-model="form.amount"></el-input>
    </el-form-item>
    <el-form-item label="凭证" prop="voucherUrlList">
      <multi-upload v-model="form.voucherUrlList"></multi-upload>
    </el-form-item>
  </el-form>
  <el-button type="primary" @click="onSubmit">确 定</el-button>
</template>
<script>
import MultiUpload from '@/components/MultiUpload'
export default {
  components: { MultiUpload },
  data () {
    return {
      form: {
        amount: '',
        voucherUrlList: []
      }
    }
  },
  methods: {
    onSubmit() {
      this.$refs.form.validata(valid => {
        if (valid) {
          // 将 this.form 传给后端
        }
      })
    }
  }
}
</script>
```

把上传组件封装成双向绑定的形式后，我们使用会更方便，也方便复用。