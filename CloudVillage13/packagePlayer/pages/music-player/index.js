// pages/music-player/index.js
// import { getSongDetail, getSongLyric } from '../../service/api_player'
// import { parseLyric } from '../../utils/parse-lyric'
import { audioContext, playerStore } from '../../../store/index'

const playModeNames = ['order', 'repeat', 'random']

Page({
  data: {
    id: 0,
    currentSong: [],
    // 保存歌曲总时长, 这里拿起风了歌曲的时间做初始时间
    durationTime: 325863,
    // 歌词信息
    lyricInfos: [],


    // 记录歌曲当前播放到的时间
    currentTime: 0,
    // 具体的某一行歌词
    currentLyricText: '',
    // 保存一下歌词的索引
    currentLyricIndex: 0,

    // 播放模式的索引
    playModeIndex: 0,
    // 记录图标对应的名字
    playModeName: 'order',


    // 记录播放的状态
    isPlaying: false,
    // 记录播放的图标
    playingName: 'pause',

    // 控制歌词是否显示, 默认是显示的, 根据不同的设备宽高比来控制是否显示
    isMusicLyric: true,
    // 记录播放页中的歌曲页面和歌词页面
    currentPage: 0,
    // 记录滑块的位置
    sliderValue: 0,
    // 动态获取swiper的高度
    contentHeight: 0,
    // 记录滑块是否在变化
    isSliderChanging: false,
    // 记录歌词滚动距顶部的距离
    lyricScrollTop: 0
  },

  onLoad(options) {
    // 1. 获取传入的id
    const id = options.id
    this.setData({ id })

    // 2. 根据id去获取歌曲相关的信息
    // this.getPageData(id)
    this.setupPlayerStoreListener()

    // 3. 动态计算内容的高度, 也就是swiper的高度
    const globalData = getApp().globalData
    const screenHeight = globalData.screenHeight
    const statusBarHeight = globalData.statusBarHeight
    const navBarHeight = globalData.navBarHeight
    const contentHeight = screenHeight - statusBarHeight - navBarHeight

    // 拿到设备的宽高比
    const deviceRadio = globalData.deviceRadio

    this.setData({ contentHeight, isMusicLyric: deviceRadio >= 2 })
  },

  // ========================= 事件处理 =========================
  handleSwiperChange(event) {
    // console.log(event)
    const current = event.detail.current
    this.setData({ currentPage: current })
  },

  // ========================= 监听滑块正在改变的时候 =========================
  handleSliderChanging(event) {
    const value = event.detail.value
    const currentTime = this.data.durationTime * value / 100
    // 当我们手指正在滑动滑块的时候, 就不能让滑块随着currentTime改变
    this.setData({ isSliderChanging: true, currentTime })
  },

  // ========================= 监听滑块, 也就是播放的进度条的变化 =========================
  handleSliderChange(event) {
    // console.log(event)
    // 1. 获取slider变化的值
    const value = event.detail.value
    // 这里拿到的value的值是0~100, 这个到时候使用是按百分比使用的

    // 2. 计算出移动滑块的currentTime
    const currentTime = this.data.durationTime * value / 100

    // 3. 设置audioContext播放currentTime位置的音乐
    // 这里修改之前, 暂停一下音乐是比较好的
    // audioContext.pause()   // 注释掉, 可以看第十二个视频五十分钟时候的讲解
    // 可以看文档, seek里面需要传入第一个秒, 精度是毫秒, 也就是可以保留三位小数
    audioContext.seek(currentTime / 1000)

    // 4. 记录最新的sliderValue
    this.setData({ sliderValue: value, isSliderChanging: false })
  },

  handleBackBtnClick() {
    // 可以传返回的层级, 这里返回一层就可以了
    wx.navigateBack()
  },

  handleModeBtnClick() {
    // 计算最新的playModeIndex
    let playModeIndex = this.data.playModeIndex + 1
    if (playModeIndex === 3) playModeIndex = 0

    // 设置playStore中的PlayModeIndex
    // 这里绕一圈是为了把数据存在playStore里面, 供别的地方使用
    playerStore.setState('playModeIndex', playModeIndex)
  },

  handlePlayBtnClick() {
    playerStore.dispatch('changeMusicPlayStatusAction', !this.data.isPlaying)
  },

  // 上一首图标的点击
  handlePrevBtnClick() {
    playerStore.dispatch('changeNewMusicAction', false)
  },

  // 下一首图标的点击
  handleNextBtnClick() {
    playerStore.dispatch('changeNewMusicAction')
  },

  // ========================= 数据监听 =========================
  // 抽取函数, 用于取消下面的监听, 这里写一个作为例子
  handleCurrentMusicListener({ currentSong, durationTime, lyricInfos }) {
    if (currentSong) this.setData({ currentSong })
    if (durationTime) this.setData({ durationTime })
    if (lyricInfos) this.setData({ lyricInfos })
  },

  setupPlayerStoreListener() {
    // 1. 监听currentSong, durationTime, lyricInfos
    playerStore.onStates(['currentSong', 'durationTime', 'lyricInfos'], this.handleCurrentMusicListener)

    // 2. 监听currentTime, currentLyricIndex, currentLyricText
    playerStore.onStates(['currentTime', 'currentLyricIndex', 'currentLyricText'], ({
      currentTime,
      currentLyricIndex,
      currentLyricText
    }) => {
      // 滑块(时间)在变化的时候做的操作
      if (currentTime && !this.data.isSliderChanging) {
        const sliderValue = currentTime / this.data.durationTime * 100
        this.setData({ sliderValue, currentTime })
      }
      // 歌词变化
      if (currentLyricIndex) {
        this.setData({ currentLyricIndex,  lyricScrollTop: currentLyricIndex * 35})
      }
      if (currentLyricText) this.setData({ currentLyricText })
    })

    // 3. 监听播放模式相关的数据
    playerStore.onStates(['playModeIndex', 'isPlaying'], ({
      playModeIndex,
      isPlaying
    }) => {
      if (playModeIndex !== undefined) {
        this.setData({ playModeIndex, playModeName: playModeNames[playModeIndex] })
      }
      if (isPlaying !== undefined) {
        this.setData({ isPlaying, playingName: isPlaying ? 'pause' : 'resume' })
      }
    })
  },

  onUnload() {
    // 这里上面有三个Store的监听, 然后把第一个里面抽取到了一个函数里面, 这里就可以取消监听
    // 这里只是举例, 这三个监听都是可以以相同的方式抽取到函数里面, 然后取消监听
    playerStore.offStates(['currentSong', 'durationTime', 'lyricInfos'], this.handleCurrentMusicListener)
    // 其他两个的取消监听这里就不做演示了, 小细节
  }
})