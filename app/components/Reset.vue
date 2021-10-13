<template>
  <div>
    <v-form lazy-validation>
      <v-container>
        <v-row>
          <v-col
            cols="12"
            sm="12"
            md="12"
          >
            <v-text-field
              v-model="email"
              label="メールアドレス"
              :error-messages="emailError"
              @input="emailError = ''"
            />
          </v-col>
        </v-row>
        <v-btn
          type="button"
          @click="handleResetPassword()"
        >
          パスワードリセットメールを送信する
        </v-btn>
      </v-container>
    </v-form>
    <Confirm ref="confirmRef" />
  </div>
</template>
<script lang="ts">
import { defineComponent, Ref, ref, useStore } from '@nuxtjs/composition-api'
import firebase from 'firebase'
import Confirm from './common/Confirm.vue'

export default defineComponent({
  components: {
    Confirm
  },
  setup (_props, _context) {
    const store = useStore()
    const email: Ref<string> = ref('')
    const emailError: Ref<string> = ref('')
    const confirmRef: Ref<any> = ref()

    /* パスワードリセット */
    const handleResetPassword = () => {
      store.dispatch('writeLoading', true)
      firebase.auth().sendPasswordResetEmail(email.value)
        .then(async () => {
          if (await confirmRef.value.open(email.value + '宛にパスワードリセットメールを送信しました', false)) {
            store.dispatch('writeLoading', false)
          }
        })
        .catch((error) => {
          emailError.value = error.message
          store.dispatch('writeLoading', false)
        })
    }

    return {
      email,
      emailError,
      handleResetPassword,
      confirmRef
    }
  }
})
</script>

<style>
</style>
