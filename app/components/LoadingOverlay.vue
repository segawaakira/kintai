<template>
  <div>
    <v-overlay
      :value="store.state.loading"
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
import { defineComponent, onMounted, useStore } from '@nuxtjs/composition-api'

export default defineComponent({
  setup (_props, _context) {
    const store = useStore()
    onMounted(() => {
    })

    return {
      store
    }
  }
})
</script>

<style lang="scss">
</style>
