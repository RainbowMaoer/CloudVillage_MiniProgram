// pages/home-music/index.js
import { rankingStore, rankingMap, playerStore } from '../../store/index'

import { getBanners, getSongMenu } from '../../service/api_music'
import queryRect from '../../utils/query-rect'
import throttle from '../../utils/throttle'

// 将旧函数转化成节流函数
// 这里修改了节流函数里面的一些默认参数, 这里就不自己传参进行修改了
const throttleQueryRect = throttle(queryRect)

Page({
  data: {
    swiperHeight: 0,
    banners: [],
    hotSongMenu: [],
    recommendSongMenu: [],
    rankings: { 0: {}, 2: {}, 3: {} },
    // 这里因为请求不到数据, 所以在这里随便给一点默认数据
    recommendSongs: [{
      name: '晴天',
      id: 11111,
      al: {
        name: '晴天',
        picUrl: '/assets/images/music/pause_icon.png'
      },
      ar: [{
        name: '周杰伦'
      }]
    }],

    // 这里从playStore里面获取一首歌的详细数据
    currentSong: {},
    isPlaying: false,
    // 控制图片是否旋转
    playerAnimState: 'paused'
  },

  onLoad(options) {
    // 获取页面数据
    this.getPageData()

    // 发起共享数据的请求
    rankingStore.dispatch('getRankingDataAction')

    // 从store中获取共享的数据
    this.setupPlayerStoreListener()
  },

  // 网络请求
  getPageData() {
    getBanners().then(res => {
      this.setData({ banners: res.banners })
    })
    getSongMenu().then(res => {
      // console.log(res)
      this.setData({ hotSongMenu: res.playlists })
    })
    // 这里就区分一些歌单即可
    getSongMenu('华语').then(res => {
      this.setData({ recommendSongMenu: res.playlists })
    })
  },

  // 事件处理
  handleSearchClick() {
    // console.log('搜索框点击')
    wx.navigateTo({
      url: '/packageDetail/pages/detail-search/index'
    })
  },

  // 监听图片加载完成, 然后获取图片高度, 将图片高度设置给swiper高度
  handleSwiperImageLoaded() {
    // console.log('图片加载完成')
    throttleQueryRect('.swiper-image').then(res => {
      // console.log('测试节流函数是否生效')
      const rect = res[0]
      this.setData({ swiperHeight: rect.height })
    })
  },

  // area-header右侧点击事件
  handleMoreClick() {
    // console.log('监听到推荐歌曲中的更多的点击')
    this.navigateToDetailSongsPage('hotRanking')
  },
  // ranking-area-item点击
  handleRankingItemClick(event) {
    // console.log(event.currentTarget.dataset.idx)
    const idx = event.currentTarget.dataset.idx
    const rankingName = rankingMap[idx]
    // 这里和上面做的事情是一样的, 都是跳转到同一个页面, 只不过两次跳转之后的页面数据有差别
    this.navigateToDetailSongsPage(rankingName)
  },

  // 这里封装这个函数为了上面携带不同数据进行跳转
  navigateToDetailSongsPage(rankingName) {
    wx.navigateTo({
      // url: '/pages/detail-songs/index'
      url: `/packageDetail/pages/detail-songs/index?ranking=${rankingName}&type=rank`
    })
  },

  // 监听song-item-v1的点击
  handleSongItemClick(event) {
    const index = event.currentTarget.dataset.index
    playerStore.setState('playListSongs', this.data.recommendSongs)
    playerStore.setState('playListIndex', index)
  },

  // 监听播放工具栏的播放暂停按钮的点击
  handlePlayBtnClick(event) {
    playerStore.dispatch('changeMusicPlayStatusAction', !this.data.isPlaying)
  },

  // 监听play-bar的点击, 点击就进入歌曲的播放页面
  handlePlayBarClick() {
    wx.navigateTo({
      // 这里其实传不传id都一样了, 因为根本就用不到, 我们使用的id基本都是从playStore里面取出来的
      url: '/packageDetail/pages/music-player/index?id=' + this.data.currentSong.id,
    })
  },

  // 卸载页面
  onUnload() {
    rankingStore.offState('newRanking', this.getNewRankingHandler)
  },

  // 从store中共享数据统一抽取到这里
  setupPlayerStoreListener() {
    // 1. 排行榜
    rankingStore.onState('hotRanking', (res) => {
      // console.log(res)
      // 推荐歌曲我们只需要六条数据即可, 但是需要判断一下, 因为第一次进来的时候没有值
      if (!res.tracks) return
      const recommendSongs = res.tracks.slice(0, 6)
      // console.log(recommendSongs)
      // 这里设置值的时候用到了对象的增强写法
      this.setData({ recommendSongs })
    })
    rankingStore.onState('newRanking', this.getRankingHandler(0))
    rankingStore.onState('originRanking', this.getRankingHandler(2))
    rankingStore.onState('upRanking', this.getRankingHandler(3))

    // 2. 播放器的监听
    playerStore.onStates(['currentSong', 'isPlaying'], ({ currentSong, isPlaying }) => {
      if (currentSong) this.setData({ currentSong })
      if (isPlaying !== undefined) {
        this.setData({
          isPlaying,
          playerAnimState: isPlaying ? 'running' : 'paused'
        })
      }
    })
  },

  getRankingHandler(idx) {
    return (res) => {
      if (Object.keys(res).length === 0) return
      const name = res.name
      const coverImgUrl = res.coverImgUrl
      const songList = res.tracks.slice(0, 3)
      const rankingObj = { name, coverImgUrl, songList }
      const newRankings = { ...this.data.rankings, [idx]: rankingObj }
      originRankings.puah(rankingObj)
      this.setData({ rankings: newRankings })
    }
  }
})