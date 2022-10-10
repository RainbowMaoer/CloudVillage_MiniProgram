import { HYEventStore } from 'hy-event-store'

import { getRanking } from '../service/api_music'

const rankingMap = { 0: 'newRanking', 1: 'hotRanking', 2: 'originRanking', 3: 'upRanking' }

const rankingStore = new HYEventStore({
  state: {
    newRanking: {},    // 0: 新歌
    hotRanking: {},    // 1. 热门
    originRanking: {}, // 2. 原创
    upRanking: {}      // 3. 飙升
  },
  actions: {
    getRankingDataAction(ctx) {
      // 0: 新歌榜 1. 热门榜 2. 原创榜 3. 飙升榜
      for (let i = 0; i < 4; i++) {
        getRanking(i).then(res => {
          // console.log(res)
          // ctx.hotRanking = res.playlist

          // 这种写法是比较优雅的
          const rankingName = rankingMap[i]
          ctx[rankingName] = res.playlist

          // 以下这种写法虽然结构清晰, 但是不够优雅
          // switch(i) {
          //   case 0:
          //     ctx.newRanking = res.playlist
          //     break;
          //   case 1:
          //     ctx.hotRanking = res.playlist
          //     break;
          //   case 2:
          //     ctx.originRanking = res.playlist
          //     break;
          //   case 3:
          //     ctx.upRanking = res.playlist
          //     break;
          // }
        })
      }
    }
  }
})

export {
  rankingStore,
  rankingMap
}
