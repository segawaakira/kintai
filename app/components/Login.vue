<template>
  <div>
    <pre>{{ user }}</pre>
    <v-btn
      type="button"
      @click="createUserByEmail()"
    >
      createUserByEmail
    </v-btn>
    <v-btn
      type="button"
      @click="signInEmail()"
    >
      signInEmail
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

    const loginGoogle = () => {
      const provider = new firebase.auth.GoogleAuthProvider()
      firebase.auth().signInWithRedirect(provider)
        .then((res) => {
          console.log('ログインしました')
          console.log(res)
        })
    }

    const createUserByEmail = async () => {
      const res = await firebase.auth().createUserWithEmailAndPassword('hasegawazlight@gmail.com', 'password')
      user.value = res.user
    }

    const signInEmail = async () => {
      const res = await firebase.auth().signInWithEmailAndPassword('hasegawazlight@gmail.com', 'password')
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
      isSignedIn
    }
  }
})
</script>

<style>
</style>
