// pages/detail-search/index.js
import { getSearchHot, getSearchSuggest, getSearchResult } from '../../../service/api_search'
import debounce from '../../../utils/debounce'
import stringToNodes from '../../../utils/string2nodes'

import { playerStore } from '../../../store/index'

// 网络请求函数通过防抖函数进行处理, 我们手动传入300的延迟时间
const debounceGetSearchSuggest = debounce(getSearchSuggest, 300)

Page({
  data: {
    hotKeywords: [],
    suggestSongs: [],
    resultSongs: [],
    suggestSongsNodes: [],
    searchValue: ''
  },
  onLoad(options) {
    // 获取页面数据
    this.getPageData()
  },

  // 获取页面数据网络请求
  getPageData() {
    getSearchHot().then(res => {
      // console.log(res)
      this.setData({ hotKeywords: res.result.hots })
    })
  },

  // 事件处理
  handleSearchChange(event) {
    // console.log(event)
    const searchValue = event.detail
    this.setData({ searchValue })

    // 输入框没有值的时候不能搜索
    if (!searchValue.length) {
      // 输入框没有值的时候赋空一下, 方便做组件的显示隐藏
      // 这里有个小bug, 当按键盘上的backspace比较快删除的时候, 会在最后清空了的时候额外发一次请求
      this.setData({ suggestSongs: [], resultSongs: [] })
      debounceGetSearchSuggest.cancle()
      return
    }

    // 根据关键字进行搜索
    debounceGetSearchSuggest(searchValue).then(res => {
      // console.log(res)
      // 1. 获取关键字歌曲
      const suggestSongs = res.result.allMatch
      this.setData({ suggestSongs })
      
      if (!suggestSongs) return

      // 2. 将suggestSongs转成nodes节点
      const suggestKeywords = suggestSongs.map(item => item.keyword)
      const suggestSongsNodes = []

      for (const keyword of suggestKeywords) {
        const nodes = stringToNodes(keyword, searchValue)
        suggestSongsNodes.push(nodes)
      }
      this.setData({ suggestSongsNodes })
    })
  },
  handleSearchAction() {
    const searchValue = this.data.searchValue
    // 根据searchValue去发送网络请求获取歌曲数据
    getSearchResult(searchValue).then(res => {
      // console.log(res)
      this.setData({ resultSongs: res.result.songs })
    })
  },
  // handleSuggestItemClick(event) {
  //   // 1. 获取点击的关键字
  //   const index = event.currentTarget.dataset.index
  //   const keyword = this.data.suggestSongs[index].keyword
  //   // console.log(keyword)

  //   // 2. 将关键字设置到searchValue中
  //   this.setData({ searchValue: keyword })

  //   // 3. 发送网络请求
  //   // getSearchResult(keyword).then(res => {
  //   //   this.setData({ resultSongs: res.result.songs })
  //   // })
  //   this.handleSearchAction()
  // },
  // // 监听热门搜索的每一个item的点击
  // handleTagItemClick(event) {
  //   const keyword = event.currentTarget.dataset.keyword

  //   this.setData({ searchValue: keyword })

  //   this.handleSearchAction()
  // }
  // 将以上两个点击操作合并
  handleKeywordItemClick(event) {
    const keyword = event.currentTarget.dataset.keyword

    this.setData({ searchValue: keyword })

    this.handleSearchAction()
  },

  // 监听song-item-v2的点击
  handleSongItemClick(event) {
    const index = event.currentTarget.dataset.index
    playerStore.setState('playListSongs', this.data.resultSongs)
    playerStore.setState('playListIndex', index)
  }
})