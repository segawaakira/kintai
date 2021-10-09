<template>
  <div>
    <v-form v-model="valid" ref="myForm" lazy-validation>
      <v-container>
        <v-row>
          <v-col
            cols="12"
            sm="12"
            md="12"
          >
            <v-text-field
              v-model="email"
              :rules="emailRules"
              label="メールアドレス"
              required
            />
          </v-col>
        </v-row>
        <v-btn
          type="button"
          @click="reset()"
        >
          パスワードリセットメールを送信する
        </v-btn>
      </v-container>
    </v-form>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, Ref, ref, useStore } from '@nuxtjs/composition-api'
import firebase from 'firebase'

export default defineComponent({
  setup (_props, _context) {
    const store = useStore()
    const valid: Ref<boolean> = ref(true)
    const myForm = ref(null)
    const email: Ref<string> = ref('')
    const emailRules = [
      (v: any) => !!v || 'E-mail is required',
      (v: any) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
    ]
    const isEditEmail: Ref<boolean> = ref(false)

    const reset = () => {
      store.dispatch('writeLoading', true)
      firebase.auth().sendPasswordResetEmail(email.value)
        .then(() => {
          console.log('リセットメールを送信しました')
          store.dispatch('writeLoading', false)
        })
        .catch((error) => {
          console.log('リセットメールを送信失敗しました', error)
          store.dispatch('writeLoading', false)
        })
    }

    onMounted(() => {
    })

    return {
      valid,
      email,
      emailRules,
      isEditEmail,
      myForm,
      reset
    }
  }
})
</script>

<style>
</style>
