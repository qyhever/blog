module.exports = {
  base: '/',
  title: '正在缓冲99%', // 显示在左上角的网页名称以及首页在浏览器标签显示的title名称
  description: 'noll的前端记录', // meta 中的描述文字，用于SEO
  // 注入到当前页面的 HTML <head> 中的标签
  head: [
    //浏览器的标签栏的网页图标，第一个'/'会遍历public文件夹的文件
    ['link', { rel: 'icon', href: '/favicon.png' }],
  ],
  plugins: [
    '@vuepress/back-to-top'
  ],

  //下面涉及到的md文件和其他文件的路径下一步再详细解释
  themeConfig: {
    logo: '/favicon.png',  //网页顶端导航栏左上角的图标
    lastUpdated: '上次更新',
    //顶部导航栏
    nav: [
      //格式一：直接跳转，'/'为不添加路由，跳转至首页
      { text: '首页', link: '/' },

      //格式二：添加下拉菜单，link指向的文件路径
      {
        text: '分类',  //默认显示        
        ariaLabel: '分类',   //用于识别的label
        items: [
          { text: 'js', link: '/pages/js/type-transform.md' },
          { text: 'vue', link: '/pages/vue/element-ui-upload.md' },
          { text: 'react', link: '/pages/react/create-react-app-common-customer-config.md' },
        ]
      },
      { text: '功能演示', link: '/pages/js/throttle-and-debounce.md' },

      //格式三：跳转至外部网页，需http/https前缀
      { text: 'Github', link: 'https://github.com/qyhever' },
    ],

    //侧边导航栏：会根据当前的文件路径是否匹配侧边栏数据，自动显示/隐藏
    sidebar: {
      '/pages/': [
        {
          title: 'js',   // 一级菜单名称
          collapsable: false, // false为默认展开菜单, 默认值true是折叠,
          sidebarDepth: 1,    //  设置侧边导航自动提取markdown文件标题的层级，默认1为h2层级
          children: [
            ['js/throttle-and-debounce.md', '函数节流与防抖'],
            ['js/type-transform.md', 'js类型转换'],
            ['js/axios-cancel.md', 'axios取消重复请求']
          ]
        },
        {
          title: 'vue',
          collapsable: false,
          children: [
            ['vue/element-ui-upload.md', '封装element-ui的upload组件']
          ]
        },
        {
          title: 'react',
          collapsable: false,
          children: [
            ['react/create-react-app-common-customer-config.md', 'create-react-app 一些常用的自定义配置']
          ]
        }
      ],

      //...可添加多个不同的侧边栏，不同页面会根据路径显示不同的侧边栏
    }
  }
}