export default function (fn, interval = 1000, options = { leading: true, trailing: true }) {
  const { leading, trailing, resultCallback } = options
  // 1. 记录上一次的开始时间
  let lastTime = 0
  let timer = null

  // 2. 事件触发时, 真正执行的函数
  const _throttle = function (...args) {
    return new Promise((resolve, reject) => {
      // 2.1 获取当前事件触发的时间
      const nowTime = new Date().getTime()
      if (!lastTime && !leading) lastTime = nowTime

      // 2.2 用间隔时间减去 当前时和上一次开始时间的差, 如果得到的结果小于等于0就触发函数执行
      const remainTime = interval - (nowTime - lastTime)
      if (remainTime <= 0) {
        // 这里还需要加一个判断, timer有值的时候, 清除掉timer并且赋空
        // 因为如果前面加了定时器的, 这里已经触发了, 所以是不需要前面已经加的定时器再执行的
        if (timer) {
          clearTimeout(timer)
          timer = null
        }

        // 2.3 真正触发的函数
        const result = fn.apply(this, args)
        if (resultCallback) resultCallback(result)
        resolve(result)
        // 2.4 保留上次触发的时间
        lastTime = nowTime

        // 这里直接return一下, 就是下面的定时器不需要再判断了, 只有等下一个时间段还输入的时候再进行判断添加定时器
        return
      }

      if (trailing && !timer) {
        timer = setTimeout(() => {
          timer = null
          // 当leading是false就设置成0, 当leading是true的时候就设置当前时间
          // 原因是, 当leading为true的时候, 我们刚输入完执行一遍fn之后, 定时器就启动了, 非常短的时间就启动了
          // 然后我们只有当正好interval这个间隔时间的时候输入, 然后执行fn的时候, 它才会清除定时器
          // 所以我们直接在leading为true的时候就让lastTime等于当前时间, 这样就会让它一直走的定时器这边
          lastTime = !leading ? 0 : new Date().getTime()
          const result = fn.apply(this, args)
          if (resultCallback) resultCallback(result)
          resolve(result)
        }, remainTime)
      }
    })
  }

  // 取消功能
  _throttle.cancle = function () {
    if (timer) clearTimeout(timer)
    timer = null
    lastTime = 0
  }

  return _throttle
}
