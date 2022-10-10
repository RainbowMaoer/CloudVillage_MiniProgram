import hyRequest from './index'

/**
 * 请求视频页的数据
 * @param {number} offset 偏移量
 * @param {number} limit 一次请求的数据量
 */
export function getTopMV(offset, limit = 10) {
  return hyRequest.get('/top/mv', {
    offset,
    limit
  })
}

/**
 * 请求MV的播放地址
 * @param {number} id MV的id
 */
export function getMVURL(id) {
  return hyRequest.get('/mv/url', {
    id
  })
}
/**
 * 请求MV的详情
 * @param {number} mvid MV的id 
 */
export function getMVDetail(mvid) {
  return hyRequest.get('/mv/detail', {
    mvid
  })
}
/**
 * 请求MV视频数据
 * @param {number} id MV的id
 */
export function getRelatedVideo(id) {
  return hyRequest.get('/related/allvideo', {
    id
  })
}
