<template>
  <div>
    <v-flex>
      <v-btn type="button" @click="prevMonth">
        前
      </v-btn>
      <p>{{ currentYear }}年{{ currentMonth }}月</p>
      <v-btn type="button" @click="nextMonth">
        次
      </v-btn>
    </v-flex>
    <p>{{ start }}</p>
    <p>{{ end }}</p>
    <p>{{ currentMonthData }}</p>

    <v-list three-line class="calendar">
      <v-list-item>
        <v-list-item-content class="d-flex flex-column">
          稼働時間
        </v-list-item-content>
      </v-list-item>
      <template v-for="(item, index) in lastDay">
        <v-list-item
          :key="index"
          class="timeline"
        >
          <div>{{ index + 1 }}</div>
          <div
            v-for="(data, dataIndex) in currentMonthData"
            :key="dataIndex"
          >
            <div
              v-if="data.startDate === index + 1"
              class="timeline-item"
              :style="calcPositionWidth(data.startTime - data.startDateTime, data.endTime - data.startDateTime)"
            />
            <!-- ▽ 日付を跨いだ時 ▽ -->
            <div
              v-else-if="data.startDate === index && data.endDate === index + 1"
              class="timeline-item"
              :data-end-time="data.endTime"
              :data-end-date-time="data.endDateTime"
              :style="calcPositionWidth(0, data.endTime - data.endDateTime)"
            />
          </div>
          <div>あああ</div>
        </v-list-item>
      </template>
    </v-list>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, Ref } from '@nuxtjs/composition-api'
// import axios from 'axios'
// import { Client } from '@googlemaps/google-maps-services-js'

export default defineComponent({
  setup (_props, _context) {
    const currentYear: Ref<number> = ref(new Date().getFullYear())
    const currentMonth: Ref<number> = ref(new Date().getMonth() + 1)

    /**
     * 指定月の日数を取得
     * @param  {number} year  年
     * @param  {number} month 月
     * @return {number} 指定月の日数
     */
    const getLastDay = (year: number, month: number) => {
      return new Date(year, month, 0).getDate()
    }

    const lastDay: Ref<number> = ref(getLastDay(currentYear.value, currentMonth.value))

    const nextMonth = () => {
      if (currentMonth.value !== 12) {
        currentMonth.value += 1
      } else {
        currentMonth.value = 1
        currentYear.value += 1
      }
      lastDay.value = getLastDay(currentYear.value, currentMonth.value)
    }

    const prevMonth = () => {
      if (currentMonth.value !== 1) {
        currentMonth.value -= 1
      } else {
        currentMonth.value = 12
        currentYear.value -= 1
      }
      lastDay.value = getLastDay(currentYear.value, currentMonth.value)
    }

    // TODO:ダミーデータなので、FireBaseから取得するようにする。
    const start = new Date()
    const end = new Date()
    end.setHours(start.getHours() + 5)

    const currentMonthData = [
      {
        startDateTime: new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0).getTime(), // startした日の0時0分0秒のタイムスタンプ
        startDate: start.getDate(),
        startTime: start.getTime(),
        endDateTime: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 0, 0, 0).getTime(), // endした日の0時0分0秒のタイムスタンプ
        endDate: end.getDate(),
        endTime: end.getTime()
      }
    ]

    const msDay = 86400000 // 1日何ミリ秒か
    /**
     * 稼働時間からスタイル（leftからの位置とwidth）を適用
     * @param  {number} start スタート時間
     * @param  {number} end 終了時間
     * @return {string} インラインスタイルに適用するCSS
     */
    const calcPositionWidth = (start: number, end: number) => {
      const startPosition = start / msDay * 100
      const width = (end - start) / msDay * 100
      return `left: ${startPosition}%; width: ${width}%;`
    }

    return {
      currentYear,
      currentMonth,
      lastDay,
      nextMonth,
      prevMonth,
      start,
      end,
      currentMonthData,
      calcPositionWidth
    }
  }
})
</script>

<style lang="scss">
.calendar {
  overflow: hidden;
}
.timeline {
  width: 100%;
  height: 100%;
  position: relative;
  display: block;
  height: 20px;
  &-item {
    position: absolute;
    top: 0;
    z-index: 1;
    background: #CCF;
    display: block;
    height: 20px;
  }
}
</style>
