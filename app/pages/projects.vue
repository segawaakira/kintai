<template>
  <Projects :p-title="title" />
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  setup (_props, _context) {
    const title = '案件一覧'
    return {
      title
    }
  },
  head (): any {
    return {
      title: this.title
    }
  }
})
</script>
