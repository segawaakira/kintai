<template>
  <div class="mt-16" style="max-width: 480px;margin: 0 auto;">
    <v-form lazy-validation autocomplete="off">
      <v-container>
        <h1 class="headline mb-12">
          ログイン
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
        <div class="d-flex justify-space-between align-center mt-4">
          <v-btn
            depressed
            type="button"
            color="primary"
            @click="handleLoginEmail()"
          >
            ログイン
          </v-btn>
          <v-btn
            depressed
            type="button"
            text
            small
            to="/reset"
          >
            パスワードをお忘れの方
          </v-btn>
        </div>
        <hr class="mt-8">
        <div class="mt-8">
          <v-btn
            depressed
            type="button"
            @click="handleLoginGoogle()"
          >
            Googleアカウントでログイン
          </v-btn>
        </div>
      </v-container>
    </v-form>
  </div>
</template>
<script lang="ts">
import { defineComponent, Ref, ref, useStore } from '@nuxtjs/composition-api'
import firebase from 'firebase'
import { IUser, IState, IProject } from '../interfaces/'

export default defineComponent({
  setup (_props, _context) {
    const email: Ref<string> = ref('')
    const emailError: Ref<string> = ref('')
    const password: Ref<string> = ref('')
    const passwordError: Ref<string> = ref('')
    const show: Ref<boolean> = ref(false)
    const store = useStore()
    const state: IState = store.state as IState

    const db = firebase.firestore()

    /* Googleでログイン */
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

    /* Emailでログイン */
    const handleLoginEmail = () => {
      store.dispatch('writeLoading', true)
      firebase.auth().signInWithEmailAndPassword(email.value, password.value)
        .then((res) => {
          console.log('ログインしました')
          console.log(res)
          const user = res.user as IUser
          const userObj: IUser = {
            email: user.email,
            uid: user.uid
          }
          store.dispatch('writeUser', userObj)
          onCheckInAttendanceProject()
        })
        .catch((error) => {
          /**
           * エラーコードによって、何が起因のエラーか出し分ける
           * https://firebase.google.com/docs/auth/admin/errors?hl=ja
           */
          switch (error.code) {
            case 'auth/invalid-email':
            case 'auth/user-not-found':
            case 'auth/email-already-exists':
              emailError.value = error.message
              break
            case 'auth/invalid-password':
            case 'auth/wrong-password':
              passwordError.value = error.message
              break
            default:
              break
          }
          console.log(error)
          store.dispatch('writeLoading', false)
        })
    }

    /* 稼働中のプロジェクト情報を取得する */
    const onCheckInAttendanceProject = () => {
      // in_attendance_projectから稼働中のプロジェクト情報を取得する
      db.collection(`users/${state.user.uid}/in_attendance_project`).get()
        .then((ref) => {
          const inAttendanceProjectArray: IProject[] = []
          ref.docs.forEach((doc) => {
            inAttendanceProjectArray.push({
              ...doc.data() as IProject
            })
          })
          if (inAttendanceProjectArray.length) {
            // 稼働中のプロジェクトがある場合、選択中のprojectに設定する
            store.dispatch('writeProject', inAttendanceProjectArray[0])
          }
          location.href = '/input'
        })
        .catch((error) => {
          console.log(error)
          location.href = '/input'
        })
    }

    return {
      handleLoginGoogle,
      handleLoginEmail,
      email,
      emailError,
      show,
      password,
      passwordError
    }
  }
})
</script>
