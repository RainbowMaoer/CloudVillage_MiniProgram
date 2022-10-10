// pages/home-profile/index.js
import { getUserInfo } from '../../service/api_login'

Page({
  data: {
  },

  // 这个是以前获取用户信息的方式, 现在使用event已经获取不到用户信息了
  // handleGetUser(event) {
  //   console.log(event)
  // }

  // 现在我们的getUserProfile这个API就需要跟一个事件在一起使用, 不能直接写在app.js里面
  // 这样就会得到一个弹窗去请求获取用户信息
  // handleGetUser() {
  //   wx.getUserProfile({
  //     desc: '你好啊, Megumi',
  //     success(res) {
  //       console.log(res)
  //     }
  //   })
  // }

  // 这里将以上的获取用户信息的API进行一次封装
  async handleGetUser() {
    const userInfo = await getUserInfo()
    console.log(userInfo)
  },
  // 获取用户手机号的, 这个人开发账号是没用权限获取的, 只有企业小程序开发账号才有权限获取
  handleGetPhoneNumber(event) {
    // 这里因为没有权限, 打印出来会看到fail no permission -> 没有权限
    console.log(event)
  }
})