export default function (selector) {
  return new Promise((resolve) => {
    // 获取图片的高度(这里也就是获取image组件的高度)
    const query = wx.createSelectorQuery()
    // 创建query来绑定组件
    query.select(selector).boundingClientRect()
    // query.exec((res) => {
    //   resolve(res)
    // })
    // 上面的可以简写
    query.exec(resolve)
  })
}