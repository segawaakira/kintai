<template>
  <div class="mt-16" style="max-width: 480px;margin: 0 auto;">
    <v-form lazy-validation>
      <v-container>
        <h1 class="headline mb-12">
          {{ pTitle }}
        </h1>
        <v-text-field
          v-model="email"
          label="メールアドレス"
          :error-messages="emailError"
          @input="emailError = ''"
        />
        <div class="mt-4">
          <v-btn
            depressed
            type="button"
            color="primary"
            @click="handleResetPassword()"
          >
            パスワードリセットメールを送信する
          </v-btn>
        </div>
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
  props: {
    pTitle: {
      type: String,
      default: ''
    }
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
