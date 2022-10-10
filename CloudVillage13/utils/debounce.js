// immediate: 立即的    这里默认是false
export default function debounce(fn, delay = 500, immediate = false, resultCallback) {
  // 1. 定义一个定时器, 保存上一次的定时器
  let timer = null
  // 这里虽然可以直接使用immediate进行立即执行的控制, 但是它是外界传进来的, 最好是不要随便修改
  // 所以这里就定义自己的变量进行控制
  let isInvoke = false

  // 2. 真正执行的函数  这里把参数都传到里面去, 目前用的比较多的是event, 但是并不确定有多少参数, 所以使用剩余参数
  const _debounce = function (...args) {
    return new Promise((resolve, reject) => {
      // 3. 取消上一次定时器
      if (timer) clearTimeout(timer)

      // 判断是否需要立即执行
      if (immediate && !isInvoke) {
        const result = fn.apply(this, args)
        if (resultCallback) resultCallback(result)
        resolve(result)
        isInvoke = true
      } else {
        // 4. 延迟执行
        timer = setTimeout(() => {
          // 不使用防抖函数的时候调用, this是指向元素的, 这里如果不显示绑定, this就会指向window
          // 箭头函数没有this, 显示绑定就会到上层作用域去找, 最后找到_debounce, 它的this就是元素, 这个要自己理解一下
          const result = fn.apply(this, args)
          if (resultCallback) resultCallback(result)
          resolve(result)
          isInvoke = false
          timer = null
        }, delay)
      }
    })
  }

  // 封装取消功能
  _debounce.cancle = function () {
    if (timer) clearTimeout(timer)
    // 这里在取消清除了之后最好是把timer赋空isInvoke赋值false
    timer = null
    isInvoke = false
  }

  // 返回新的函数是因为我们不能对原函数, 也就是fn做修改
  return _debounce
}
