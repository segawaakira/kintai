<template>
  <div>
    <v-overlay
      :value="pLoading"
      :z-index="10"
    >
      <v-progress-circular
        :size="50"
        indeterminate
        color="white"
      />
    </v-overlay>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    pLoading: {
      type: Boolean,
      default: false
    }
  },
  setup (_props, _context) {
    onMounted(() => {
    })

    return {
    }
  }
})
</script>

<style lang="scss">
</style>
