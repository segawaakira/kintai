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
              type="password"
              label="パスワード"
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

    <v-btn
      type="button"
      @click="createUserByEmail()"
    >
      createUserByEmail
    </v-btn>
    <v-btn
      type="button"
      @click="loginGoogle()"
    >
      loginGoogle
    </v-btn>
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
      v => !!v || 'E-mail is required',
      v => /.+@.+\..+/.test(v) || 'E-mail must be valid'
    ]
    const passwordRules = [
      v => !!v || 'password is required'
    ]
    const password: Ref<string> = ref('')

    const loginGoogle = () => {
      const provider = new firebase.auth.GoogleAuthProvider()
      firebase.auth().signInWithRedirect(provider)
        .then((res) => {
          console.log('ログインしました')
          console.log(res)
        })
    }

    const createUserByEmail = async () => {
      const res = await firebase.auth().createUserWithEmailAndPassword(email.value, password.value)
      user.value = res.user
    }

    const signInEmail = async () => {
      const res = await firebase.auth().signInWithEmailAndPassword(email.value, password.value)
      user.value = res.user
    }

    const signOut = () => {
      firebase.auth().signOut().then(() => {
        console.log('ログアウトしました')
        user.value = {}
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
      loginGoogle,
      signInEmail,
      createUserByEmail,
      signOut,
      user,
      isSignedIn,
      valid,
      email,
      emailRules,
      passwordRules,
      password,
      myForm,
      validate () {
        myForm.value.validate()
      }
    }
  }
})
</script>

<style>
</style>
