<template>
  <v-dialog v-model="dialog" :max-width="options.width">
    <v-card>
      <v-toolbar dark :color="options.color" dense>
        <v-toolbar-title class="white--text">{{ title }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer></v-spacer>
        <v-btn color="primary darken-1" @click.native="agree">Yes</v-btn>
        <v-btn color="grey" @click.native="cancel">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- <v-dialog v-model="dialog" :max-width="options.width" @keydown.esc="cancel">
    <v-card>
      <v-toolbar dark :color="options.color" dense flat>
        <v-toolbar-title class="white--text">{{ title }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text v-show="!!message">{{ message }}</v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer></v-spacer>
        <v-btn color="primary darken-1" flat="flat" @click.native="agree">Yes</v-btn>
        <v-btn color="grey" flat="flat" @click.native="cancel">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog> -->
</template>
<script lang="ts">
import { defineComponent, Ref, ref } from '@nuxtjs/composition-api'

export default defineComponent({
  setup (_props, _context: any) {
    const dialog: Ref<boolean> = ref(false)
    const resolve: Ref<any> = ref(null)
    const reject: Ref<any> = ref(null)
    const message: Ref<any> = ref(null)
    const title: Ref<any> = ref(null)
    const options: Ref<any> = ref({
      color: 'primary',
      width: 290
    })

    const open = (_title: any, _message: any, _options: any) => {
      dialog.value = true
      title.value = _title
      message.value = _message
      options.value = Object.assign(options.value, _options)
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
      title,
      options,
      open,
      agree,
      cancel
    }
  }
})
</script>
