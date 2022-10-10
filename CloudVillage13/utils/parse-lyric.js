// 这里使用正则表达式匹配字符串, 比较方便
// 正则表达式: 字符串匹配利器

// 匹配下面循环出来的时间
// timePattern -> 开发中可能很多时候使用pattern来命名
const timeRegExp = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/


export function parseLyric(lyricString) {
  const lyricStrings = lyricString.split('\n')

  const lyricInfos = []
  for (const lineString of lyricStrings) {
    // [01:22.837]不得真假 不做挣扎 不惧笑话
    // console.log(lineString)
    const timeResult = timeRegExp.exec(lineString)
    // console.log(timeResult)
    if (!timeResult) continue // 这里可不能用return, 当timeResult没有值(null)的时候, 就跳过这一次
    // 1. 获取时间
    const minute = timeResult[1] * 60 * 1000
    const second = timeResult[2] * 1000
    const millSecond = timeResult[3].lenght === 2 ? timeResult[3] * 10 : timeResult[3] * 1
    const time = minute + second + millSecond
    // console.log(time)

    // 2. 获取歌词文本
    // const text = lineString.replace(timeResult[0], '')
    const text = lineString.replace(timeRegExp, '')  // 以上两种方式都行

    lyricInfos.push({ time, text })
  }
  return lyricInfos
}
