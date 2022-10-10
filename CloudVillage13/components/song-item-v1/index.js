// components/song-item-v1/index.js
import { playerStore } from '../../store/index'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 生命周期
   */
  lifetimes: {

  },

  /**
   * 组件的方法列表
   * 早期的时候, 小程序都是把这些方法函数什么的都直接放在最外层, 现在做了个统一, 放到了一起
   */
  methods: {
    handleSongItemClick() {
      // console.log('item-v1点击')
      const id = this.properties.item.id
      // 1. 页面跳转
      wx.navigateTo({
        // id跳转的时候传过去, 到时候在options里面拿到, 然后发送请求获取数据
        url: `/packagePlayer/pages/music-player/index?id=${id}`
      })

      // 2. 对歌曲的数据请求和其他操作
      playerStore.dispatch("playMusicWithSongIdAction", { id })

      // 3. 获取当前播放的歌曲所在的列表以及当前歌曲在列表中的索引
      // 这部分逻辑放到home-music里面做
    }
  }
})
