<template>
  <Signup :p-title="title" />
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  setup (_props, _context) {
    const title = '会員登録'
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
