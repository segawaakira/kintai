<template>
  <v-dialog v-model="dialog" width="320" persistent>
    <v-card class="pa-8">
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer></v-spacer>
        <v-btn v-if="isConfirm" color="grey" @click.native="cancel">CANCEL</v-btn>
        <v-btn color="primary darken-1" @click.native="agree">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { defineComponent, Ref, ref } from '@nuxtjs/composition-api'

export default defineComponent({
  setup (_props, _context: any) {
    const dialog: Ref<boolean> = ref(false)
    const resolve: Ref<any> = ref(null)
    const reject: Ref<any> = ref(null)
    const message: Ref<any> = ref(null)
    const isConfirm: Ref<boolean> = ref(true)

    const open = (_message: any, _isConfirm: boolean) => {
      dialog.value = true
      message.value = _message
      isConfirm.value = _isConfirm
      return new Promise((_resolve: any, _reject: any) => {
        resolve.value = _resolve
        reject.value = _reject
      })
    }

    const agree = () => {
      resolve.value(true)
      dialog.value = false
    }
    const cancel = () => {
      resolve.value(false)
      dialog.value = false
    }
    return {
      dialog,
      resolve,
      reject,
      message,
      isConfirm,
      open,
      agree,
      cancel
    }
  }
})
</script>
