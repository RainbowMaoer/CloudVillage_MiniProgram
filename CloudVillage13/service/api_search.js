import hyRequest from './index'

/**
 * 获取热门搜索的关键词数据
 */
export function getSearchHot() {
  return hyRequest.get('/search/hot')
}

/**
 * 根据关键词提示
 * @param {string} keywords 关键词
 */
export function getSearchSuggest(keywords) {
  return hyRequest.get('/search/suggest', {
    keywords,
    // 这里是移动端去请求数据, 我们就直接把类型写死
    type: 'mobile'
  })
}

/**
 * 根据输入框的内容发送请求获取歌曲数据
 * @param {string} keywords 输入框的内容
 */
export function getSearchResult(keywords) {
  return hyRequest.get('/search', {
    keywords
  })
}
