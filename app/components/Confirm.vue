<template>
  <v-dialog v-model="dialog" width="320" persistent>
    <v-card class="pa-8">
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer />
        <v-btn v-if="isConfirm" color="grey" @click.native="handleCancel">CANCEL</v-btn>
        <v-btn color="primary darken-1" @click.native="handleAgree">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { defineComponent, Ref, ref } from '@nuxtjs/composition-api'

export default defineComponent({
  setup (_props, _context) {
    const dialog: Ref<boolean> = ref(false)
    const resolve: Ref<any> = ref(null)
    const reject: Ref<any> = ref(null)
    const message: Ref<string> = ref('')
    const isConfirm: Ref<boolean> = ref(true)

    /**
     * ダイアログを開く
     * @param  {string} _message
     * @param  {boolean} _isConfirm trueならConfirm（OK or CANCEL）で、falseなら普通のアラート（OKのみ）
     * @return {Promise}
     */
    const open = (_message: string, _isConfirm: boolean) => {
      dialog.value = true
      message.value = _message
      isConfirm.value = _isConfirm
      return new Promise((_resolve, _reject) => {
        resolve.value = _resolve
        reject.value = _reject
      })
    }

    /* OKをクリック */
    const handleAgree = () => {
      resolve.value(true)
      dialog.value = false
    }

    /* CANCELをクリック */
    const handleCancel = () => {
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
      handleAgree,
      handleCancel
    }
  }
})
</script>
