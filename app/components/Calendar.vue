<template>
  <div>
    <v-flex>
      <p>{{ currentYear }}年{{ currentMonth }}月</p>
      <v-btn type="button" @click="prevMonth">
        前
      </v-btn>
      <v-btn type="button" @click="nextMonth">
        次
      </v-btn>
    </v-flex>
    <!-- <pre>{{ totalWorkedHourOfDay }}</pre> -->
    <!-- <pre>{{ currentMonthData }}</pre>
    <pre>{{ items }}</pre> -->

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
          <div>{{ index + 1 }} {{ getDayOfWeek(currentYear, currentMonth, index + 1) }}</div>
          <div
            v-for="(data, dataIndex) in currentMonthData"
            :key="dataIndex"
          >
            <div
              v-if="data.startDate === index + 1"
              class="timeline-item"
              :style="calcPositionWidth(data.startTime - data.startDateTime, data.endTime - data.startDateTime)"
              @click="onClickDetail(data.id)"
            />
            <!-- ▽ 日付を跨いだ時 ▽ -->
            <div
              v-else-if="data.startDate === index && data.endDate === index + 1"
              class="timeline-item"
              :data-end-time="data.endTime"
              :data-end-date-time="data.endDateTime"
              :style="calcPositionWidth(0, data.endTime - data.endDateTime)"
              @click="onClickDetail(data.id)"
            />
            <!-- ▽ 稼働時間 ▽ -->
            <div style="display: none;">
              <div v-if="data.startDate === index + 1">
                <div class="js-work-hour">{{ Math.round(data.startWorkTime / 3600000 * 10) / 10 }}</div>
              </div>
              <div v-else-if="data.startDate === index && data.endDate === index + 1">
                <div class="js-work-hour">{{ Math.round(data.endWorkTime / 3600000 * 10) / 10 }}</div>
              </div>
            </div>
          </div>
          <div>{{ totalWorkedHourOfDay[index] }}</div>
        </v-list-item>
      </template>
    </v-list>
    <!-- ▽ 月別稼働合計時間 ▽ -->
    <div>{{ totalWorkedHourOfMonth }}</div>
    <v-btn
      @click="onCreateExcel"
    >
      onCreateExcel
    </v-btn>
    <loading-overlay :p-loading="loading" />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, Ref, onMounted, useStore } from '@nuxtjs/composition-api'
import firebase from 'firebase'
import dayjs from 'dayjs'
const excelJs = require('exceljs')

export default defineComponent({
  setup (_props, context) {
    const store = useStore()
    const currentUser: Ref<any> = ref(null)
    const currentYear: Ref<number> = ref(new Date().getFullYear())
    const currentMonth: Ref<number> = ref(new Date().getMonth() + 1)
    const totalWorkedHourOfDay: Ref<any> = ref([])
    const totalWorkedHourOfMonth: Ref<number> = ref(0)
    const db = firebase.firestore()
    const items: Ref<any> = ref([])
    const loading: Ref<boolean> = ref(false)

    /**
     * 指定月の日数を取得
     * @param  {number} year  年
     * @param  {number} month 月
     * @return {number} 指定月の日数
     */
    const getLastDay = (year: number, month: number) => {
      return new Date(year, month, 0).getDate()
    }

    const getDayOfWeek = (year: number, month: number, day: number) => {
      const date = new Date(year, month - 1, day)
      const dayOfWeek = date.getDay()
      return ['日', '月', '火', '水', '木', '金', '土'][dayOfWeek]
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
      getItems()
    }

    const prevMonth = () => {
      if (currentMonth.value !== 1) {
        currentMonth.value -= 1
      } else {
        currentMonth.value = 12
        currentYear.value -= 1
      }
      lastDay.value = getLastDay(currentYear.value, currentMonth.value)
      getItems()
    }

    const currentMonthData: Ref<any> = ref([])

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

    const checkCurrentMonthData = (items: any) => {
      currentMonthData.value = []
      items.forEach((item: any) => {
        const start = new Date(item.start.seconds * 1000)
        const end = new Date(item.end.seconds * 1000)
        if (
          (start.getFullYear() === currentYear.value && start.getMonth() + 1 === currentMonth.value) ||
          (end.getFullYear() === currentYear.value && end.getMonth() + 1 === currentMonth.value)
        ) {
          let startWorkTime = end.getTime() - start.getTime()
          let endWorkTime = end.getTime() - start.getTime()
          // 日を跨いで稼働した場合の処理
          if (start.getDate() !== end.getDate()) {
            // 開始した日の稼働時間は、開始〜その翌日の0時0分0秒まで
            startWorkTime = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1, 0, 0, 0).getTime() - start.getTime()
            // 終了した日の稼働時間は、その日の0時0分0秒〜終了まで
            endWorkTime = end.getTime() - new Date(end.getFullYear(), end.getMonth(), end.getDate(), 0, 0, 0).getTime()
          }
          // 選択中の年月に一致するデータのみ出力する
          currentMonthData.value.push(
            {
              startDateTime: new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0).getTime(), // 開始した日の0時0分0秒のタイムスタンプ
              startDate: start.getDate(),
              startTime: start.getTime(),
              endDateTime: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 0, 0, 0).getTime(), // 終了した日の0時0分0秒のタイムスタンプ
              endDate: end.getDate(),
              endTime: end.getTime(),
              startWorkTime,
              endWorkTime,
              id: item.id
            }
          )
        }
      })
    }

    const getItems = () => {
      // @ts-ignore
      db.collection(`users/${currentUser.value.uid}/projects/${store.state.project.id}/items`).onSnapshot((docs) => {
        loading.value = true
        items.value = []
        docs.forEach((doc) => {
          items.value.push({
            ...doc.data(),
            id: doc.id
          })
        })
        checkCurrentMonthData(items.value)
        // 日別の合計稼働時間
        totalWorkedHourOfDay.value = []
        const timelines = document.getElementsByClassName('timeline')
        context.root.$nextTick(() => {
          for (let i = 0; i < timelines.length; i++) {
            const workHour = timelines[i].getElementsByClassName('js-work-hour')
            let workHourTotal: number = 0
            for (let j = 0; j < workHour.length; j++) {
              workHourTotal += Number(workHour[j].innerHTML)
            }
            totalWorkedHourOfDay.value.push(
              workHourTotal
            )
          }
        })
        // 月別の合計稼働時間
        totalWorkedHourOfMonth.value = 0
        context.root.$nextTick(() => {
          const workHour = document.getElementsByClassName('js-work-hour')
          let workHourTotal: number = 0
          for (let j = 0; j < workHour.length; j++) {
            workHourTotal += Number(workHour[j].innerHTML)
          }
          totalWorkedHourOfMonth.value += workHourTotal
        })
        loading.value = false
      })
    }

    const onClickDetail = (id: string) => {
      // Todo:location.hrefでなく、Nuxtでの書き方あればそれにする
      location.href = '/detail?id=' + id
    }

    /** 枠線のスタイル */
    const borderStyle = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
    }
    /** ヘッダ行の背景色 */
    const headerFillStyle = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDDDDDD' }
    }
    /** ヘッダ行のフォント */
    const headerFontStyle = {
      bold: true
    }
    /** 偶数行の背景色 */
    const bodyEvenFillStyle = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF5F5F5' }
    }
    /** 奇数行の背景色 */
    const bodyOddFillStyle = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFFFF' }
    }

    const onCreateExcel = async () => {
      loading.value = true
      const itemsExcel: any[] = []
      items.value.forEach((item: any) => {
        const start = new Date(item.start.seconds * 1000)
        const end = new Date(item.end.seconds * 1000)
        itemsExcel.push(
          {
            start: dayjs(start).format('MM月DD日 HH:MM'),
            end: dayjs(end).format('MM月DD日 HH:MM'),
            hour: Math.round((item.end.seconds - item.start.seconds) / 3600 * 10) / 10,
            start_place_name: item.start_place_name,
            end_place_name: item.end_place_name,
            description: item.description
          }
        )
      })

      const title = currentYear.value + '年' + currentMonth.value + '月稼働実績'
      // Workbookの作成
      const workbook = new excelJs.Workbook()
      // Workbookに新しいWorksheetを追加
      workbook.addWorksheet(title)
      // ↑で追加したWorksheetを参照し変数に代入
      const worksheet = workbook.getWorksheet(title)

      // 列を定義
      worksheet.columns = [
        { header: '開始日時', key: 'start' },
        { header: '終了日時', key: 'end' },
        { header: '稼働時間', key: 'hour' },
        { header: '開始場所', key: 'start_place_name' },
        { header: '終了場所', key: 'end_place_name' },
        { header: '業務内容', key: 'description' }
      ]

      // すべての行を走査
      worksheet.eachRow((row: any, rowNumber: any) => {
        // すべてのセルを走査
        row.eachCell((cell: any, _colNumber: any) => {
          if (rowNumber === 1) {
            // ヘッダ行のスタイルを設定
            cell.fill = headerFillStyle
            cell.font = headerFontStyle
          } else if (rowNumber % 2 === 0) {
            // ボディ行（偶数行）のスタイルを設定
            cell.fill = bodyEvenFillStyle
          } else {
            // ボディ行（奇数行）のスタイルを設定
            cell.fill = bodyOddFillStyle
          }
          // セルの枠線を設定
          cell.border = borderStyle
        })
        // 行の設定を適用
        row.commit()
      })

      // 行を定義
      itemsExcel.forEach((item: any) => {
        worksheet.addRow(
          {
            start: item.start,
            end: item.end,
            hour: item.hour,
            start_place_name: item.start_place_name,
            end_place_name: item.end_place_name,
            description: item.description
          }
        )
      })
      worksheet.addRow(
        {
          start: '合計',
          end: '-',
          hour: totalWorkedHourOfMonth.value,
          start_place_name: '-',
          end_place_name: '-',
          description: '-'
        }
      )

      // UInt8Arrayを生成
      const uint8Array = await workbook.xlsx.writeBuffer()
      // Blobを生成
      const blob = new Blob([uint8Array], { type: 'application/octet-binary' })
      // DL用URLを生成し、aタグからダウンロードを実行
      const url = window.URL.createObjectURL(blob)
      // aタグを生成
      const a = document.createElement('a')
      // aタグのURLを設定
      a.href = url
      // aタグにdownload属性を付け、URLがダウンロード対象になるようにします
      a.download = title + '.xlsx'
      // aタグをクリックさせます
      a.click()
      // ダウンロード後は不要なのでaタグを除去
      a.remove()
      loading.value = false
    }

    onMounted(() => {
      firebase.auth().onAuthStateChanged((data) => {
        if (data) {
          currentUser.value = firebase.auth().currentUser
          getItems()
        } else {
          currentUser.value = {}
        }
      })
    })

    return {
      currentYear,
      currentMonth,
      lastDay,
      nextMonth,
      prevMonth,
      currentMonthData,
      calcPositionWidth,
      items,
      getDayOfWeek,
      onClickDetail,
      totalWorkedHourOfDay,
      totalWorkedHourOfMonth,
      onCreateExcel,
      loading
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
