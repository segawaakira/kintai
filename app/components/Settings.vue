<template>
  <div>
    <pre>{{ user }}</pre>

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
              :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="show = !show"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-form>

    <hr>
    <v-btn
      type="button"
      @click="signOut()"
    >
      signOut
    </v-btn>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from '@nuxtjs/composition-api'
import firebase from 'firebase'
// import axios from 'axios'
// import { Client } from '@googlemaps/google-maps-services-js'

export default defineComponent({
  setup (_props, _context) {
    const isSignedIn: Ref<Boolean> = ref(false)
    const user: Ref<any> = ref({})
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

    const signOut = () => {
      firebase.auth().signOut().then(() => {
        console.log('ログアウトしました')
        user.value = {}
        // Todo:location.hrefでなく、Nuxtでの書き方あればそれにする
        location.href = '/login'
      }).catch((error) => {
        console.log('ログアウト失敗', error)
      })
    }

    onMounted(() => {
      firebase.auth().onAuthStateChanged((data) => {
        if (data) {
          isSignedIn.value = true
          user.value = data
        } else {
          isSignedIn.value = false
          user.value = {}
        }
      })
    })

    return {
      signOut,
      user,
      isSignedIn,
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
