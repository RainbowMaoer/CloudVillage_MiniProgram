import { HYEventStore } from 'hy-event-store'
import { getSongDetail, getSongLyric } from '../service/api_player'
import { parseLyric } from '../utils/parse-lyric'

// 这个是供前台播放的api   createInnerAudioContext
// const audioContext = wx.createInnerAudioContext()
// 这个是供后台播放的api, 但是我们也可以用到前台播放, 这样前台后台就只需要这一个就够了
const audioContext = wx.getBackgroundAudioManager()

const playerStore = new HYEventStore({
  state: {
    // 记录是否是第一次播放
    isFirstPlay: true,
    // 记录是否是停止状态
    isStoping: false,

    id: 0,
    currentSong: {},
    durationTime: 0,
    lyricInfos: [],

    currentTime: 0,
    currentLyricText: '',
    currentLyricIndex: 0,

    // 记录播放模式的索引, 0: 顺序播放, 1: 单曲循环, 2: 随机播放
    playModeIndex: 0,

    // 控制播放状态, 暂停还是播放
    isPlaying: false,
    // 记录播放列表
    playListSongs: [],
    // 记录当前播放的歌曲在列表中的索引
    playListIndex: 0
  },
  actions: {
    playMusicWithSongIdAction(ctx, { id, isRefresh = false }) {
      // 这里做一个判断, 如果第二次点击的歌曲和上一次相同, 就直接return
      // 这里还可以做一个操作就是第二次点进来的时候, 不管之前是暂停还是播放, 都变成播放
      // 只需要手动dispatch一下changeMusicPlayStatusAction即可
      if (ctx.id == id && !isRefresh) return
      ctx.id = id

      // 0. 修改播放的状态
      ctx.isPlaying = true
      // 初始化其他的一些状态, 再第二首歌播放之前就重置上一首歌留下的信息
      // 播放模式playModeIndex是不需要重置的
      ctx.currentSong = {}
      ctx.durationTime = 0
      ctx.lyricInfos = []
      ctx.currentTime = 0
      ctx.currentLyricText = ''
      ctx.currentLyricIndex = 0

      // 1. 根据id请求数据
      // 获取歌曲信息的请求
      getSongDetail(id).then(res => {
        // 该接口无法访问, 注释掉
        ctx.currentSong = res.songs[0]
        ctx.durationTime = res.songs[0].dt
        audioContext.title = res.songs[0].name
      })
      // 获取歌词的请求
      getSongLyric(id).then(res => {
        const lyricString = res.lrc.lyric
        const lyrics = parseLyric(lyricString)
        ctx.lyricInfos = lyrics
      })

      // 2. 播放对应id的歌曲
      audioContext.stop()
      audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
      // 使用背景播放的时候, 这里还需要增加一个title
      // 这里暂且就用id作为title, 等到获取了歌曲详情, 就拿歌曲的名字作为title
      audioContext.title = id
      audioContext.autoplay = true

      // 3. 监听audioContext的一些事件, 这里单独抽取一个action是为了阅读性更好
      if (ctx.isFirstPlay) {
        this.dispatch('setupAudioContextListenerAction')
        // 每次都添加一个新的audioContext是没必要的, 所以这里判断一下
        ctx.isFirstPlay = false
      }
    },
    
    setupAudioContextListenerAction(ctx) {
      // 1. 监听歌曲可以播放
      audioContext.onCanplay(() => {
        // 音频可以播放的时候, 就调用播放的API
        audioContext.play()
      })

      // 2. 监听歌曲播放的时间
      audioContext.onTimeUpdate(() => {
        // console.log(audioContext.currentTime)
        // 1. 获取到的是秒, 我们转换成毫秒, 方便我们使用formatDuration来格式化时间
        const currentTime = (audioContext.currentTime) * 1000
        
        // 2. 根据当前时间修改currentTime
        ctx.currentTime = currentTime

        // 3. 根据当前时间查找播放的歌词
        if (!ctx.lyricInfos.length) return
        let i = 0
        for (; i < ctx.lyricInfos.length; i++) {
          const lyricInfo = ctx.lyricInfos[i]
          if (currentTime < lyricInfo.time) {
            break
          }
        }
        // 设置当前歌词的索引和内容
        const currentIndex = i - 1
        if (ctx.currentLyricIndex !== currentIndex) {
          const currentLyricInfo = ctx.lyricInfos[currentIndex]
          const currentLyricText = currentLyricInfo.text
          // currentLyricIndex: currentIndex这里记录一下索引就不会重复设置歌词
          ctx.currentLyricText = currentLyricText,
          ctx.currentLyricIndex = currentIndex
        }
      })

      // 3. 监听歌曲播放完成
      audioContext.onEnded(() => {
        this.dispatch('changeNewMusicAction')
      })

      // 4. 监听音乐暂停或者播放以及停止
      // 播放状态(这里修改在)
      audioContext.onPlay(() => {
        ctx.isPlaying = true
      })
      // 暂停状态
      audioContext.onPause(() => {
        ctx.isPlaying = false
      })
      // 停止状态, 就是退出小程序的页面之后, 把后台播放给叉掉
      audioContext.onStop(() => {
        ctx.isPlaying = false
        ctx.isStoping = true
      })
    },

    // 控制歌曲播放或者暂停
    changeMusicPlayStatusAction(ctx, isPlaying = true) {
      ctx.isPlaying = isPlaying
      // 停止状态我们点进去之后希望它继续播放
      if (ctx.isPlaying && ctx.isStoping) {
        // 这时候需要重新设置src和title
        audioContext.src = `https://music.163.com/song/media/outer/url?id=${ctx.id}.mp3`
        // audioContext.title = currentSong.name
        // 这里以防获取不到currentSong报错, 所以就先用id作为title
        audioContext.title = ctx.id
        ctx.isStoping = false
      }
      ctx.isPlaying ? audioContext.play() : audioContext.pause()
      // if (ctx.isPlaying) {
      //   audioContext.play()
      // } else {
      //   audioContext.pause()
      // }
    },

    changeNewMusicAction(ctx, isNext = true) {
      // 1. 获取当前音乐的索引
      let index = ctx.playListIndex

      // 2. 根据不同的播放模式获取下一首歌的索引, 因为可能是顺序播放, 也可能是随机播放
      switch(ctx.playModeIndex) {
        case 0: // 顺序播放
          index = isNext ? index + 1 : index - 1
          if (index === -1) index = ctx.playListSongs.length - 1
          if (index === ctx.playListSongs.length) index = 0
          break
        case 1: // 单曲循环
          // 这里做的比较奇怪, 当模式是单曲循环的时候, 点击下一首/上一首会重新播放该歌曲
          break
        case 2: // 随机播放  Math.floor向下取整
          // 这里还可以做一个判断, 当随机到的index和上一次的一样, 我们可以再随机一次
          index = Math.floor(Math.random() * ctx.playListSongs.length)
          break
      }

      // 3. 获取歌曲
      let currentSong = ctx.playListSongs[index]
      // 判断, 拿到的歌曲列表如果是空的, 就单曲循环当前这首歌
      if (!currentSong) {
        currentSong = ctx.currentSong
      } else {
      // 记录最新的歌曲索引
        ctx.playListIndex = index
      }

      // 4. 播放新的歌曲
      this.dispatch('playMusicWithSongIdAction', { id: currentSong.id, isRefresh: true })
    },

    // 逻辑相似, 下面的这个与上面的合并一下
    // changeNewMusicPrevAction(ctx) {
    //   // 1. 获取当前音乐的索引
    //   let index = ctx.playListIndex

    //   // 2. 根据不同的播放模式获取下一首歌的索引, 因为可能是顺序播放, 也可能是随机播放
    //   switch(ctx.playModeIndex) {
    //     case 0: // 顺序播放
    //       index = index - 1
    //       if (index === -1) index = ctx.playListSongs.length - 1
    //       break
    //     case 1: // 单曲循环
    //       // 这里做的比较奇怪, 当模式是单曲循环的时候, 点击下一首/上一首会重新播放该歌曲
    //       break
    //     case 2: // 随机播放  Math.floor向下取整
    //       // 这里还可以做一个判断, 当随机到的index和上一次的一样, 我们可以再随机一次
    //       index = Math.floor(Math.random * ctx.playListSongs.length)
    //       break
    //   }

    //   // 3. 获取歌曲
    //   let currentSong = ctx.playListSongs[index]
    //   // 判断, 拿到的歌曲列表如果是空的, 就单曲循环当前这首歌
    //   if (!currentSong) {
    //     currentSong = ctx.currentSong
    //   } else {
    //   // 记录最新的歌曲索引
    //   ctx.playListIndex = index
    //   }

    //   // 4. 播放新的歌曲
    //   this.dispatch('playMusicWithSongIdAction', { id: currentSong.id, isRefresh: true })
    // }
  }
})

export {
  audioContext,
  playerStore
}
