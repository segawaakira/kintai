<template>
  <Settings :p-title="title" />
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  setup (_props, _context) {
    const title = '設定'
    return {
      title
    }
  },
  head () {
    return {
      title: this.title
    }
  }
})
</script>
