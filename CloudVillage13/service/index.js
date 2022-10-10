import { TOKEN_KEY } from '../constans/token-const'

// 获取一下token, 然后在实例hyLoginRequest得时候, 将token作为请求头携带一下
const token = wx.getStorageSync(TOKEN_KEY)

// 请求一般数据的baseUrl
// const BASE_URL = 'http://123.207.32.32:9001'
const BASE_URL = 'http://localhost:3000'
// const BASE_URL = 'https://cloud-village.vercel.app'

// 登录请求的baseUrl
// 使用已经部署的远程服务器
const LOGIN_BASE_URL = 'http://123.207.32.32:3000'
// 使用本地服务器, 跑一下自己本地的登录服务器代码
// const LOGIN_BASE_URL = 'http://localhost:3000'

// 封装一个网络请求的类
class HYRequest {
  constructor(baseUrl, authHeader = {}) {
    this.baseUrl = baseUrl,
    this.authHeader = authHeader
  }

  // isAuth控制需不需要这个authHeader
  request(url, method, params, isAuth = false , header = {}) {
    const finalHeader = isAuth ? { ...this.authHeader, ...header } : header

    return new Promise((resolve, reject) => {
      wx.request({
        url: this.baseUrl + url,
        method: method,
        header: finalHeader,
        data: params,
        success: function (res) {
          resolve(res.data)
        },
        // fail: function(err) {
        //   reject(err)
        // }
        // 上面的这一段代码还可以优化
        // fail函数调用的时候会把err参数传给reject,所以这里直接省略,fail拿到参数就会直接给reject
        fail: reject
      })
    })
  }

  get(url, params, isAuth = false, header) {
    return this.request(url, 'GET', params, isAuth, header)
  }

  post(url, data, isAuth = false, header) {
    return this.request(url, 'POST', data, isAuth, header)
  }
}

const hyRequest = new HYRequest(BASE_URL)

const hyLoginRequest = new HYRequest(LOGIN_BASE_URL, {
  token
})

export default hyRequest
export { hyLoginRequest }
