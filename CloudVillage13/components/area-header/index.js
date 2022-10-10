// components/area-header/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: '默认标题'
    },
    rightText: {
      type: String,
      value: '更多'
    },
    // 有的地方用不着右边这一块就传入这个参数隐藏掉
    showRight: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 子组件发生点击事件, 这里我们希望的是把这个事件发出去, 因为不同的地方触发事件效果不一样
    handleRightClick() {
      // 发射事件, 这里如果有携带参数的话, 和vue的emit一样, 放在第二个参数里面
      this.triggerEvent('click')
    }
  }
})
