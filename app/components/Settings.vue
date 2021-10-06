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
        </v-row>
        <v-btn
          type="button"
          @click="save()"
        >
          save
        </v-btn>
      </v-container>
    </v-form>

    <hr>

    <v-btn
      type="button"
      @click="leave()"
    >
      退会する
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
    const currentUser: Ref<any> = ref(null)
    const user: Ref<any> = ref({})
    const valid: Ref<boolean> = ref(true)
    const myForm = ref(null)
    const email: Ref<string> = ref('')
    const emailRules = [
      (v: any) => !!v || 'E-mail is required',
      (v: any) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
    ]
    const isEditEmail: Ref<boolean> = ref(false)

    const save = () => {
      currentUser.value.updateEmail(email.value).then(() => {
        console.log('メアドを変更しました')
      }).catch((error) => {
        console.log('メアドを変更失敗しました', error)
      })
    }

    const leave = () => {
      currentUser.value.delete().then(() => {
        console.log('退会しました')
      }).catch((error) => {
        console.log('退会失敗しました', error)
      })
    }

    onMounted(() => {
      firebase.auth().onAuthStateChanged((data) => {
        if (data) {
          isSignedIn.value = true
          currentUser.value = firebase.auth().currentUser
          user.value = data
          email.value = data.email
        } else {
          isSignedIn.value = false
          user.value = {}
        }
      })
    })

    return {
      user,
      isSignedIn,
      valid,
      email,
      emailRules,
      isEditEmail,
      myForm,
      save,
      leave,
      currentUser
    }
  }
})
</script>

<style>
</style>
