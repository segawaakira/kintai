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

    <v-list three-line>
      <template v-for="(item, index) in lastDay">
        <v-list-item
          :key="index"
        >
          <v-list-item-content>
            <v-list-item-title>{{ index + 1 }}</v-list-item-title>
          </v-list-item-content>
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

    return {
      currentYear,
      currentMonth,
      lastDay,
      nextMonth,
      prevMonth
    }
  }
})
</script>

<style>
</style>
