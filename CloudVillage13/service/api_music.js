import hyRequest from './index'

/**
 * 获取轮播图数据
 */
export function getBanners() {
  return hyRequest.get('/banner', {
    // 这个是类型, 区分不同机型, 不同机型轮播图不同, 这个看接口文档可以查
    type: 2
  })
}

/**
 * 获取热门榜单的数据
 * @param {number} idx 
 */
export function getRanking(idx) {
  return hyRequest.get('/top/list', {
    idx
  })
}

/**
 * 获取音乐列表
 * @param {string} cat 获取的音乐类型 
 * @param {number} limit 获取多少条数据
 * @param {number} offset 偏移量
 */
export function getSongMenu(cat = '全部', limit = 6, offset = 0) {
  return hyRequest.get('/top/playlist', {
    cat,
    limit,
    offset
  })
}

/**
 * 获取热门歌单和推荐歌单详情
 * @param {number} id 
 */
export function getSongMenuDetail(id) {
  return hyRequest.get('/playlist/detail/dynamic', {
    id
  })
}
