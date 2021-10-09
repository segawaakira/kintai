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
          @click="createUserByEmail()"
        >
          createUserByEmail
        </v-btn>
      </v-container>
    </v-form>

    <hr>

    <v-btn
      type="button"
      @click="loginGoogle()"
    >
      loginGoogle
    </v-btn>
    <loading-overlay :p-loading="loading" />
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from '@nuxtjs/composition-api'
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
    const loading: Ref<boolean> = ref(false)

    const loginGoogle = () => {
      loading.value = true
      const provider = new firebase.auth.GoogleAuthProvider()
      firebase.auth().signInWithRedirect(provider)
        .then((res) => {
          console.log('ログインしました')
          console.log(res)
          loading.value = false
        })
        .catch((error) => {
          console.log(error)
          loading.value = false
        })
    }

    const createUserByEmail = () => {
      loading.value = true
      firebase.auth().createUserWithEmailAndPassword(email.value, password.value)
        .then((res) => {
          console.log('作成しました')
          console.log(res)
          // Todo:location.hrefでなく、Nuxtでの書き方あればそれにする
          location.href = '/projects'
        })
        .catch((error) => {
          console.log(error)
          loading.value = false
        })
    }

    onMounted(() => {
      firebase.auth().onAuthStateChanged((data) => {
        if (data) {
          // Todo:location.hrefでなく、Nuxtでの書き方あればそれにする
          location.href = '/projects'
        } else {
          user.value = {}
        }
      })
    })

    return {
      loginGoogle,
      createUserByEmail,
      valid,
      email,
      emailRules,
      show,
      passwordRules,
      password,
      myForm,
      loading
    }
  }
})
</script>

<style>
</style>
