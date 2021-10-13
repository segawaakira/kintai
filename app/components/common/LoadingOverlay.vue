<template>
  <div>
    <v-overlay
      :value="state.loading"
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
import { defineComponent, useStore } from '@nuxtjs/composition-api'
import { IState } from '../../interfaces/'

export default defineComponent({
  setup (_props, _context) {
    const store = useStore()
    const state: IState = store.state as IState

    return {
      state
    }
  }
})
</script>
