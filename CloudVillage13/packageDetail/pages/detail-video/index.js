// pages/detail-video/index.js
import { getMVURL, getMVDetail, getRelatedVideo } from '../../../service/api_video'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    mvURLInfo: {},
    mvDetail: {},
    relatedVideos: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 别的页面传过来的参数都会放到options这个对象里面
    // console.log(options)
    // 1. 获取传进来的id
    const id = options.id
    // console.log(id)
    // 2. 获取页面数据
    this.getPageData(id)
  },

  // 获取页面数据抽离出来的函数
  getPageData(id) {
    // 这里三个请求是可以同时发送的, 所以这里不建议用async和await
    // 1. 请求播放地址
    getMVURL(id).then(res => {
      this.setData({ mvURLInfo: res.data })
    })
    // 2. 请求视频信息
    getMVDetail(id).then(res => {
      this.setData({ mvDetail: res.data })
    })
    // 3. 请求相关视频
    getRelatedVideo(id).then(res => {
      this.setData({ relatedVideos: res.data })
    })
  }
})