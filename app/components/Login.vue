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
          <v-col
            cols="12"
            sm="12"
            md="12"
          >
            <v-text-field
              v-model="password"
              :rules="passwordRules"
              :type="show ? 'text' : 'password'"
              label="パスワード"
              :append-icon="show ? 'visibility' : 'visibility_off'"
              @click:append="show = !show"
            />
          </v-col>
        </v-row>
        <v-btn
          @click="signInEmail()"
        >
          signInEmail
        </v-btn>
      </v-container>
    </v-form>

    <hr>

    <v-btn
      type="button"
      to="/reset"
    >
      パスワードをお忘れの方はこちら
    </v-btn>

    <hr>

    <v-btn
      type="button"
      @click="loginGoogle()"
    >
      loginGoogle
    </v-btn>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, Ref, ref, useStore } from '@nuxtjs/composition-api'
import firebase from 'firebase'

export default defineComponent({
  setup (_props, _context) {
    const valid: Ref<boolean> = ref(true)
    const myForm = ref(null)
    const email: Ref<string> = ref('')
    const emailRules = [
      (v: any) => !!v || 'E-mail is required',
      (v: any) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
    ]
    const show: Ref<boolean> = ref(false)
    const passwordRules = [
      (v: any) => !!v || 'password is required'
    ]
    const password: Ref<string> = ref('')
    const store = useStore()

    const loginGoogle = () => {
      store.dispatch('writeLoading', true)
      const provider = new firebase.auth.GoogleAuthProvider()
      firebase.auth().signInWithRedirect(provider)
        .then((res) => {
          console.log('ログインしました')
          console.log(res)
          store.dispatch('writeLoading', false)
        })
        .catch((error) => {
          console.log(error)
          store.dispatch('writeLoading', false)
        })
    }

    const signInEmail = () => {
      store.dispatch('writeLoading', true)
      firebase.auth().signInWithEmailAndPassword(email.value, password.value)
        .then((res) => {
          console.log('ログインしました')
          console.log(res)
          // Todo:location.hrefでなく、Nuxtでの書き方あればそれにする
          // location.href = '/input'
        })
        .catch((error) => {
          console.log(error)
          store.dispatch('writeLoading', false)
        })
    }

    onMounted(() => {
      firebase.auth().onAuthStateChanged((data) => {
        store.dispatch('writeLoading', true)
        if (data) {
          // Todo:location.hrefでなく、Nuxtでの書き方あればそれにする
          store.dispatch('writeUser', data)
          location.href = '/input'
        } else {
          store.dispatch('writeUser', null)
          store.dispatch('writeLoading', false)
        }
      })
    })

    return {
      loginGoogle,
      signInEmail,
      valid,
      email,
      emailRules,
      show,
      passwordRules,
      password,
      myForm
    }
  }
})
</script>

<style>
</style>
