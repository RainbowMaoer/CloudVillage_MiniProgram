// base-ui/nav-bar/index.js
Component({
  options: {
    // 使用多个插槽(也就是具名插槽)的时候, 需要加这个代码
    multipleSlots: true
  },
  properties: {
    title: {
      type: String,
      value: '默认标题'
    }
  },
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    navBarHeight: getApp().globalData.navBarHeight
  },
  methods: {
    handleLeftClick() {
      // 因为nav-bar是一个可复用的组件, 所以这里的事件最好是可以发出去, 让父组件来决定做什么
      this.triggerEvent('click')
    }
  }
})
