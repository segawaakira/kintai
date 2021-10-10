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
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, Ref, ref, useStore } from '@nuxtjs/composition-api'
import firebase from 'firebase'

export default defineComponent({
  setup (_props, context) {
    const store = useStore()
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

    const createUserByEmail = () => {
      store.dispatch('writeLoading', true)
      firebase.auth().createUserWithEmailAndPassword(email.value, password.value)
        .then((res) => {
          console.log('作成しました')
          console.log(res)
          context.root.$router.push('/projects')
        })
        .catch((error) => {
          console.log(error)
          store.dispatch('writeLoading', false)
        })
    }

    onMounted(() => {
      firebase.auth().onAuthStateChanged((data) => {
        if (data) {
          context.root.$router.push('/projects')
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
      myForm
    }
  }
})
</script>

<style>
</style>
