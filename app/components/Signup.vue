<template>
  <div class="mt-16" style="max-width: 480px;margin: 0 auto;">
    <v-form lazy-validation autocomplete="off">
      <v-container>
        <h1 class="headline mb-12">
          {{ pTitle }}
        </h1>
        <v-text-field
          v-model="email"
          label="メールアドレス"
          required
          :error-messages="emailError"
          @input="emailError = ''"
        />
        <v-text-field
          v-model="password"
          :type="show ? 'text' : 'password'"
          label="パスワード"
          :append-icon="show ? 'visibility' : 'visibility_off'"
          :error-messages="passwordError"
          @input="passwordError = ''"
          @click:append="show = !show"
        />
        <div class="mt-4">
          <v-btn
            depressed
            type="button"
            color="primary"
            @click="handleCreateUserByEmail()"
          >
            登録する
          </v-btn>
        </div>
        <hr class="mt-8">
        <div class="mt-8">
          <v-btn
            depressed
            type="button"
            @click="handleLoginGoogle()"
          >
            Googleアカウントで会員登録
          </v-btn>
        </div>
      </v-container>
    </v-form>
  </div>
</template>
<script lang="ts">
import { defineComponent, Ref, ref, useStore } from '@nuxtjs/composition-api'
import firebase from 'firebase'
import { IUser } from '../interfaces/'

export default defineComponent({
  props: {
    pTitle: {
      type: String,
      default: ''
    }
  },
  setup (_props, _context) {
    const email: Ref<string> = ref('')
    const emailError: Ref<string> = ref('')
    const password: Ref<string> = ref('')
    const passwordError: Ref<string> = ref('')
    const show: Ref<boolean> = ref(false)
    const store = useStore()

    /* Googleで会員登録 */
    const handleLoginGoogle = () => {
      // store.dispatch('writeLoading', true)
      const provider = new firebase.auth.GoogleAuthProvider()
      firebase.auth().signInWithPopup(provider)
        .then((res) => {
          // console.log('ログインしました!')
          // console.log(res)
          const user = res.user as IUser
          const userObj: IUser = {
            email: user.email,
            uid: user.uid
          }
          store.dispatch('writeUser', userObj)
          location.href = '/input'
          // context.root.$router.push('/input')
        })
        .catch((error) => {
          console.log(error)
          // store.dispatch('writeLoading', false)
        })
    }

    /* Emailで会員登録 */
    const handleCreateUserByEmail = () => {
      store.dispatch('writeLoading', true)
      firebase.auth().createUserWithEmailAndPassword(email.value, password.value)
        .then((res) => {
          // console.log('作成しました')
          // console.log(res)
          const user = res.user as IUser
          const userObj: IUser = {
            email: user.email,
            uid: user.uid
          }
          store.dispatch('writeUser', userObj)
          location.href = '/input'
          // context.root.$router.push('/input')
        })
        .catch((error) => {
          /**
           * エラーコードによって、何が起因のエラーか出し分ける
           * https://firebase.google.com/docs/auth/admin/errors?hl=ja
           */
          switch (error.code) {
            case 'auth/invalid-email':
            case 'auth/user-not-found':
            case 'auth/email-already-in-use':
              emailError.value = error.message
              break
            case 'auth/invalid-password':
            case 'auth/wrong-password':
            case 'auth/weak-password':
              passwordError.value = error.message
              break
            default:
              break
          }
          console.log(error)
          store.dispatch('writeLoading', false)
        })
    }

    return {
      handleLoginGoogle,
      handleCreateUserByEmail,
      email,
      emailError,
      show,
      password,
      passwordError
    }
  }
})
</script>

<style>
</style>
