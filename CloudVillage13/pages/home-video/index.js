// pages/home-video/index.js
import { getTopMV } from '../../service/api_video'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    topMVs: [],
    // 这个变量来判断是否还有数据
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getTopMVData(0)
  },

  // 可以看到请求数据的代码可以复用, 这里封装成一个函数, 这里封装函数不需要function
  async getTopMVData(offset) {
    // 判断请求的时候hasMore是否为true, 可以写严谨一点
    if (!this.data.hasMore && offset !== 0) return

    // 展示加载动画, 在页面标题的左边
    wx.showNavigationBarLoading()

    const res = await getTopMV(offset)
    let newData = this.data.topMVs
    if (offset === 0) {
      newData = res.data
    } else {
      newData = newData.concat(res.data)
    }
    this.setData({ topMVs: newData })
    this.setData({ hasMore: res.hasMore })
    // 数据请求成功关闭加载动画
    wx.hideNavigationBarLoading()
    
    // 这里获取完数据之后可以停止下拉刷新的动画
    if (offset === 0) {
      wx.stopPullDownRefresh()
    }
  },

  // 封装item点击事件处理的函数
  handleVideoItemClick(event) {
    // 获取id
    const id = event.currentTarget.dataset.item.id
    // 页面跳转
    wx.navigateTo({
      url: `/packageDetail/pages/detail-video/index?id=${id}`,
    })
  },

  // 下拉刷新的生命周期
  onPullDownRefresh() {
    this.getTopMVData(0)
  },

  // 页面滚动到底部的生命周期
  onReachBottom() {
    this.getTopMVData(this.data.topMVs.length)
  }
})
