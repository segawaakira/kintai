<template>
  <div>
    <v-form lazy-validation autocomplete="off">
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
              required
              :error-messages="emailError"
              @input="emailError = ''"
            />
          </v-col>
          <v-col
            cols="12"
            sm="12"
            md="12"
          >
            <v-text-field
              v-model="password"
              :type="show ? 'text' : 'password'"
              label="パスワード"
              :append-icon="show ? 'visibility' : 'visibility_off'"
              :error-messages="passwordError"
              @input="passwordError = ''"
              @click:append="show = !show"
            />
          </v-col>
        </v-row>
        <v-btn
          @click="handleCreateUserByEmail()"
        >
          handleCreateUserByEmail
        </v-btn>
      </v-container>
    </v-form>

    <hr>

    <v-btn
      type="button"
      @click="handleLoginGoogle()"
    >
      handleLoginGoogle
    </v-btn>
  </div>
</template>
<script lang="ts">
import { defineComponent, Ref, ref, useStore } from '@nuxtjs/composition-api'
import firebase from 'firebase'
import { IUser } from '../interfaces/'

export default defineComponent({
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
          console.log('ログインしました!')
          console.log(res)
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
          console.log('作成しました')
          console.log(res)
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
