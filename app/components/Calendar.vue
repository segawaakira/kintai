<template>
  <div class="my-16">
    <h1 class="headline mb-12">
      {{ pTitle }}
    </h1>

    <ProjectSelect />

    <v-alert
      v-if="!state.project"
      dense
      outlined
      type="warning"
      class="mt-8 mb-16"
    >
      案件を選択してください。
    </v-alert>

    <div v-else>
      <div class="d-flex justify-space-between align-center mb-4">
        <v-btn type="button" depressed @click="handlePrev">
          <v-icon>
            chevron_left
          </v-icon>
        </v-btn>
        <div class="title">
          {{ currentYear }}年{{ currentMonth }}月
        </div>
        <v-btn type="button" depressed @click="handleNext">
          <v-icon>
            chevron_right
          </v-icon>
        </v-btn>
      </div>

      <v-simple-table>
        <thead>
          <tr>
            <th width="10%">
              日付
            </th>
            <th width="100%" class="d-flex justify-space-between pa-0 align-center timeline-header">
              <span
                v-for="(_i, i) in 25"
                :key="'timeline-header-item' + i"
                class="timeline-header-item"
                :style="'left:' + i * (100 / 24) + '%;'"
              >
                {{ i }}
              </span>
            </th>
            <th width="10%">
              計
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in lastDay"
            :key="index"
          >
            <td>{{ index + 1 }} {{ getDayOfWeek(currentYear, currentMonth, index + 1) }}</td>
            <td class="timeline pa-0">
              <span
                v-for="(_i, i) in 25"
                :key="'timeline-border' + i"
                class="timeline-border"
                :style="'left:' + i * (100 / 24) + '%;'"
              />
              <div
                v-for="(data, dataIndex) in currentMonthData"
                :key="dataIndex"
              >
                <div
                  v-if="data.startDate === index + 1 && data.startMonth === currentMonth"
                  class="timeline-item"
                  :style="calcPositionWidth(data.startTime - data.startDateTime, data.endTime - data.startDateTime)"
                  @click="handleClickDetail(data.id)"
                />
                <!-- ▽ 月 or 日を跨いだ時 ▽ -->
                <div
                  v-else-if="(data.endDate === index + 1 && data.endMonth === currentMonth) || (data.startDate === index && data.endDate === index + 1)"
                  class="timeline-item"
                  :style="calcPositionWidth(0, data.endTime - data.endDateTime)"
                  @click="handleClickDetail(data.id)"
                />
                <!-- ▽ この日はぶっ続けの場合 ▽ -->
                <div
                  v-else-if="(data.startDate < index + 1 && data.endDate > index + 1 ) && data.endMonth === currentMonth"
                  class="timeline-item"
                  style="left: 0; width: 100%;"
                  @click="handleClickDetail(data.id)"
                />
                <!-- ▽ 翌月にかけてぶっ続けの場合 ▽ -->
                <div
                  v-else-if="data.startDate < index + 1 && data.endMonth === currentMonth + 1"
                  class="timeline-item"
                  style="left: 0; width: 100%;"
                  @click="handleClickDetail(data.id)"
                />
                <!-- ▽ 翌年にかけてぶっ続けの場合 ▽ -->
                <div
                  v-else-if="data.startDate < index + 1 && data.startMonth === 12 && currentMonth === 12"
                  class="timeline-item"
                  style="left: 0; width: 100%;"
                  @click="handleClickDetail(data.id)"
                />
                <!-- ▽ 先月末からぶっ続けの場合 ▽ -->
                <div
                  v-else-if="data.endDate > index + 1 && data.startMonth +1 === currentMonth"
                  class="timeline-item"
                  style="left: 0; width: 100%;"
                  @click="handleClickDetail(data.id)"
                />
                <!-- ▽ 年末からぶっ続けの場合 ▽ -->
                <div
                  v-else-if="data.endDate > index + 1 && data.startMonth === 12 && currentMonth === 1"
                  class="timeline-item"
                  style="left: 0; width: 100%;"
                  @click="handleClickDetail(data.id)"
                />
                <!-- 稼働時間（計算のために必要で、非表示） -->
                <div style="display: none;">
                  <div v-if="data.startDate === index + 1 && data.startMonth === currentMonth">
                    <div class="js-work-hour">
                      {{ Math.round(data.startWorkTime / 3600000 * 10) / 10 }}
                    </div>
                  </div>
                  <div v-else-if="(data.endDate === index + 1 && data.endMonth === currentMonth) || (data.startDate === index && data.endDate === index + 1)">
                    <div class="js-work-hour">
                      {{ Math.round(data.endWorkTime / 3600000 * 10) / 10 }}
                    </div>
                  </div>
                  <div v-else-if="(data.startDate < index + 1 && data.endDate > index + 1 ) && data.endMonth === currentMonth">
                    <div class="js-work-hour">
                      24
                    </div>
                  </div>
                  <div v-else-if="data.startDate < index + 1 && data.endMonth === currentMonth + 1">
                    <div class="js-work-hour">
                      24
                    </div>
                  </div>
                  <div v-else-if="data.startDate < index + 1 && data.startMonth === 12 && currentMonth === 12">
                    <div class="js-work-hour">
                      24
                    </div>
                  </div>
                  <div v-else-if="data.endDate > index + 1 && data.startMonth +1 === currentMonth">
                    <div class="js-work-hour">
                      24
                    </div>
                  </div>
                  <div v-else-if="data.endDate > index + 1 && data.startMonth === 12 && currentMonth === 1">
                    <div class="js-work-hour">
                      24
                    </div>
                  </div>
                </div>
              </div>
            </td>
            <td class="text-right timeline-total">
              {{ totalWorkedHourOfDay[index] }}
            </td>
          </tr>
          <tr>
            <td />
            <td class="text-right">
              {{ currentMonth }}月 合計
            </td>
            <td class="text-right">
              {{ totalWorkedHourOfMonth }}h
            </td>
          </tr>
        </tbody>
      </v-simple-table>
      <v-btn
        depressed
        type="button"
        color="primary"
        class="mt-8"
        @click="handleDownloadExcel"
      >
        <v-icon class="mr-2">
          file_download
        </v-icon>
        エクセルでダウンロード
      </v-btn>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, Ref, onMounted, useStore, watch } from '@nuxtjs/composition-api'
import firebase from 'firebase'
import dayjs from 'dayjs'
import { IState, IProjectItem } from '../interfaces/'
import { DAY_OF_WEEK } from '../common/constants'
import ProjectSelect from './parts/ProjectSelect.vue'

const excelJs = require('exceljs')

interface IItemData {
  startDateTime: number
  startMonth: number
  startDate: number
  startTime: number
  endDateTime: number
  endMonth: number
  endDate: number
  endTime: number
  startWorkTime: number
  endWorkTime: number
  id: string
}

interface IItemDataExel {
  start_time?: number, // 日付ソート用でExcelには表示されない
  start: string,
  end: string,
  hour: number,
  start_place_name: string,
  end_place_name: string,
  description: string
}

export default defineComponent({
  components: { ProjectSelect },
  props: {
    pTitle: {
      type: String,
      default: ''
    }
  },
  setup (_props, context) {
    const store = useStore()
    const state: IState = store.state as IState
    const currentYear: Ref<number> = ref(new Date().getFullYear())
    const currentMonth: Ref<number> = ref(new Date().getMonth() + 1)
    const totalWorkedHourOfDay: Ref<number[]> = ref([])
    const totalWorkedHourOfMonth: Ref<number> = ref(0)
    const db = firebase.firestore()
    const items: Ref<IProjectItem[]> = ref([])

    /**
     * 指定月の日数を取得
     * @param  {number} year  年
     * @param  {number} month 月
     * @return {number} 指定月の日数
     */
    const getLastDay = (year: number, month: number) => {
      return new Date(year, month, 0).getDate()
    }

    /**
     * 年月日から曜日を取得
     * @param  {number} year  年
     * @param  {number} month 月
     * @param  {number} day 日
     * @return {string} 曜日
     */
    const getDayOfWeek = (year: number, month: number, day: number) => {
      const date = new Date(year, month - 1, day)
      const dayOfWeek = date.getDay()
      return DAY_OF_WEEK[dayOfWeek]
    }

    const lastDay: Ref<number> = ref(getLastDay(currentYear.value, currentMonth.value))

    /* 次の月 */
    const handleNext = () => {
      if (currentMonth.value !== 12) {
        currentMonth.value += 1
      } else {
        currentMonth.value = 1
        currentYear.value += 1
      }
      lastDay.value = getLastDay(currentYear.value, currentMonth.value)
      getItems()
    }

    /* 前の月 */
    const handlePrev = () => {
      if (currentMonth.value !== 1) {
        currentMonth.value -= 1
      } else {
        currentMonth.value = 12
        currentYear.value -= 1
      }
      lastDay.value = getLastDay(currentYear.value, currentMonth.value)
      getItems()
    }

    const currentMonthData: Ref<IItemData[]> = ref([])

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

    /* 表示中の年月の稼働データから、カレンダーに表示用のデータに整形する */
    const checkCurrentMonthData = (items: IProjectItem[]) => {
      currentMonthData.value = []
      items.forEach((item: IProjectItem) => {
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
          currentMonthData.value.push({
            startDateTime: new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0).getTime(), // 開始した日の0時0分0秒のタイムスタンプ
            startDate: start.getDate(),
            startMonth: start.getMonth() + 1,
            startTime: start.getTime(),
            endDateTime: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 0, 0, 0).getTime(), // 終了した日の0時0分0秒のタイムスタンプ
            endMonth: end.getMonth() + 1,
            endDate: end.getDate(),
            endTime: end.getTime(),
            startWorkTime,
            endWorkTime,
            id: item.id as string
          })
        }
      })
    }

    /* 表示中の年月の稼働状況を取得する */
    const getItems = () => {
      if (!state.project) {
        return
      }
      db.collection(`users/${state.user.uid}/projects/${state.project.id}/items`).onSnapshot((docs) => {
        store.dispatch('writeLoading', true)
        items.value = []
        docs.forEach((doc) => {
          items.value.push({
            ...doc.data() as IProjectItem,
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
              // 小数第一位に丸めて、浮動小数点型による誤差をなくす
              Math.round(workHourTotal * 10) / 10
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
          // 小数第一位に丸めて、浮動小数点型による誤差をなくす
          totalWorkedHourOfMonth.value += Math.round(workHourTotal * 10) / 10
        })
        store.dispatch('writeLoading', false)
      })
    }

    /* タイムラインをクリックでその稼働詳細画面に遷移する */
    const handleClickDetail = (id: string) => {
      context.root.$router.push('/detail?id=' + id)
    }

    /* 表示中の年月の稼働実績を記載されたエクセルをダウンロード */
    const handleDownloadExcel = async () => {
      store.dispatch('writeLoading', true)

      // ヘッダ行の背景
      const headerFillStyle = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '00000000' }
      }
      // ヘッダ行のテキスト
      const headerFontStyle = {
        color: { argb: 'FFFFFFFF' }
      }
      // セルの枠線
      const borderStyle = {
        top: { style: 'thin', color: { argb: '66666666' } },
        left: { style: 'thin', color: { argb: '66666666' } },
        bottom: { style: 'thin', color: { argb: '66666666' } },
        right: { style: 'thin', color: { argb: '66666666' } }
      }

      const itemsExcel: IItemDataExel[] = []
      items.value.forEach((item: IProjectItem) => {
        let start = new Date(item.start.seconds * 1000)
        let end = new Date(item.end.seconds * 1000)
        let hour = Math.round((item.end.seconds - item.start.seconds) / 3600 * 10) / 10
        // 現在表示している年月のものに絞り込む
        if ((start.getMonth() + 1 === currentMonth.value && start.getFullYear() === currentYear.value) || (end.getMonth() + 1 === currentMonth.value && end.getFullYear() === currentYear.value)) {
          // 月跨ぎの場合の処理
          if (start.getMonth() !== end.getMonth()) {
            // 開始した日の稼働時間は、開始〜その翌日の0時0分0秒まで
            const startWorkTime = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1, 0, 0, 0).getTime() - start.getTime()
            // 終了した日の稼働時間は、その日の0時0分0秒〜終了まで
            const endWorkTime = end.getTime() - new Date(end.getFullYear(), end.getMonth(), 1, 0, 0, 0).getTime()
            // 1日 or 末日のどっちまたぎかの条件分岐
            if (start.getMonth() + 1 === currentMonth.value) {
              // 末日跨ぎ
              hour = Math.round(startWorkTime / 3600000 * 10) / 10
              // 末日までの日数分、hourに24h足す
              const lastDay = getLastDay(start.getFullYear(), start.getMonth() + 1)
              const straddleDay = lastDay - start.getDate()
              for (let i = 0; i < straddleDay; i++) {
                hour += 24
              }
              end = new Date(start.getFullYear(), start.getMonth() + 1, 1, 0, 0, 0)
              // 年末跨ぎの場合、endは良く年元日の0:00
              if (start.getMonth() + 1 === 12) {
                end = new Date(start.getFullYear() + 1, 0, 1, 0, 0, 0)
              }
            } else {
              // 1日跨ぎ
              hour = Math.round(endWorkTime / 3600000 * 10) / 10
              start = new Date(end.getFullYear(), end.getMonth(), 1, 0, 0, 0)
            }
          }

          itemsExcel.push(
            {
              start_time: start.getTime(),
              start: dayjs(start).format('MM月DD日 HH:mm'),
              end: dayjs(end).format('MM月DD日 HH:mm'),
              hour,
              start_place_name: item.start_place_name,
              end_place_name: item.end_place_name,
              description: item.description
            }
          )
        }
      })

      // 日付順にsort
      itemsExcel.sort((a: any, b: any) => a.start_time - b.start_time)

      const title = state.project.name + '_' + currentYear.value + '年' + currentMonth.value + '月稼働実績'
      // Workbookの作成
      const workbook = new excelJs.Workbook()
      // Workbookに新しいWorksheetを追加
      workbook.addWorksheet(title)
      // ↑で追加したWorksheetを参照し変数に代入
      const worksheet = workbook.getWorksheet(title)

      // 列を定義
      worksheet.columns = [
        { header: '開始日時', key: 'start', width: 15 },
        { header: '終了日時', key: 'end', width: 15 },
        { header: '稼働（h）', key: 'hour', width: 10 },
        { header: '開始場所', key: 'start_place_name', width: 50 },
        { header: '終了場所', key: 'end_place_name', width: 50 },
        { header: '業務内容', key: 'description', width: 80 }
      ]

      // 行を定義
      itemsExcel.forEach((item: IItemDataExel) => {
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

      // すべての行を走査
      worksheet.eachRow((row: any, rowNumber: number) => {
        // すべてのセルを走査
        row.eachCell((cell: any, _colNumber: number) => {
          if (rowNumber === 1) {
            // ヘッダ行のスタイルを設定
            cell.fill = headerFillStyle
            cell.font = headerFontStyle
          }
          cell.border = borderStyle
        })
        // 行の設定を適用
        row.commit()
      })

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
      store.dispatch('writeLoading', false)
    }

    /* 案件変更時 */
    watch(
      () => state.project,
      (_n, _o) => {
        getItems()
      }
    )

    onMounted(() => {
      getItems()
    })

    return {
      currentYear,
      currentMonth,
      lastDay,
      handleNext,
      handlePrev,
      currentMonthData,
      calcPositionWidth,
      items,
      getDayOfWeek,
      handleClickDetail,
      totalWorkedHourOfDay,
      totalWorkedHourOfMonth,
      handleDownloadExcel,
      state
    }
  }
})
</script>

<style lang="scss">
.timeline {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  &-header {
    position: relative;
    &-item {
      position: absolute;
      margin-left: -0.5em;
      @media (max-width: $break-point-s) {
        display: none;
        &:nth-child(2n + 1) {
          display: block;
        }
      }
    }
  }
  &-border {
    width: 1px;
    height: 48px;
    position: absolute;
    top: 0;
  }
  &-item {
    position: absolute;
    top: 0;
    z-index: 1;
    background: var(--v-primary-lighten2);
    border: 1px solid var(--v-primary-lighten3);
    display: block;
    height: 48px;
    cursor: pointer;
    &:hover {
      background: var(--v-primary-lighten3);
    }
  }
}
.v-application {
  /* ダークモード */
  &.theme--dark {
    .timeline {
      &-border {
        background-color: rgba(255, 255, 255, 0.12);
      }
      &-total {
        border-left: 1px solid rgba(255, 255, 255, 0.12);
      }
    }
  }
  /* ライトモード */
  &.theme--light {
    .timeline {
      &-border {
        background-color: rgba(0, 0, 0, 0.12);
      }
      &-total {
        border-left: 1px solid rgba(0, 0, 0, 0.12);
      }
    }
  }
}
</style>
