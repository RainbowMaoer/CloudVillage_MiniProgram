// app.js
import { getLoginCode, codeToToken, checkToken, checkSession } from './service/api_login'
import { TOKEN_KEY } from './constans/token-const'

App({
  // 这里可以放一些全局共享的数据, 但是这个里面的数据不是响应式的
  // 需要改变的数据可以放到hy-event-store中, 这里可以放一些固定不变的数据
  globalData: {
    screenWidth: 0,
    screenHeight: 0,
    statusBarHeight: 0,
    navBarHeight: 44,
    // 设备宽高比
    deviceRadio: 0
  },
  // 当应用程序启动的生命周期
  onLaunch() {
    // 1. 获取设备的默认信息
    // 这里使用同步方法去获取, 其实还有异步方法getSystemInfoAsync
    const info = wx.getSystemInfoSync()
    // console.log(info)
    this.globalData.screenWidth = info.screenWidth
    this.globalData.screenHeight = info.screenHeight
    this.globalData.statusBarHeight = info.statusBarHeight

    // 计算设备宽高比
    const deviceRadio = info.screenHeight / info.screenWidth
    this.globalData.deviceRadio = deviceRadio

    // 2. 让用户默认进行登录
    this.handleLogin()

    // 3. 获取用户的信息
    // 现在已经不允许在app.js里面直接去使用这个接口了
    // 这个是因为早期很多小程序这里设置去请求用户授权, 给用户造成不好的印象, 所以现在不允许这么写了
    // 现在这里这样写也不会有任何结果
    // wx.getUserProfile({
    //   desc: '你好啊, Megumi',
    //   success(res) {
    //     console.log(res)
    //   }
    // })
  },

  async handleLogin() {
    // 登录之前判断一下是否有token, 有的话就不需要登录
    const token = wx.getStorageSync(TOKEN_KEY)
    // 还有一个判断是token有没有过期  这里已经不需要传入token了, 请求头里面都已经携带了
    const checkResult = await checkToken()
    // console.log(checkResult)
    // 判断session_key是否过期
    const isSessionExpire = await checkSession()
    // errorCode有值就表示token过期了
    if (!token || checkResult.errorCode || !isSessionExpire) {
      this.loginAction()
    }
  },

  async loginAction() {
    // 1. 获取code
    const code = await getLoginCode()

    // 2. 将code发送给服务器
    const result = await codeToToken(code)
    const token = result.token
    wx.setStorageSync(TOKEN_KEY, token)
  }
})
