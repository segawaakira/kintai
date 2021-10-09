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
import { defineComponent, onMounted, Ref, ref, useStore } from '@nuxtjs/composition-api'
import firebase from 'firebase'

export default defineComponent({
  setup (_props, _context) {
    const store = useStore()
    const currentUser: Ref<any> = ref(null)
    const valid: Ref<boolean> = ref(true)
    const myForm = ref(null)
    const email: Ref<string> = ref('')
    const emailRules = [
      (v: any) => !!v || 'E-mail is required',
      (v: any) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
    ]
    const isEditEmail: Ref<boolean> = ref(false)

    const save = () => {
      store.dispatch('writeLoading', true)
      currentUser.value.updateEmail(email.value)
        .then(() => {
          console.log('メアドを変更しました')
          store.dispatch('writeLoading', false)
        })
        .catch((error: any) => {
          console.log('メアドを変更失敗しました', error)
          store.dispatch('writeLoading', false)
        })
    }

    const leave = () => {
      store.dispatch('writeLoading', true)
      currentUser.value.delete()
        .then(() => {
          console.log('退会しました')
          store.dispatch('writeLoading', false)
        })
        .catch((error: any) => {
          console.log('退会失敗しました', error)
          store.dispatch('writeLoading', false)
        })
    }

    onMounted(() => {
      store.dispatch('writeLoading', true)
      firebase.auth().onAuthStateChanged((data) => {
        if (data) {
          currentUser.value = firebase.auth().currentUser
          email.value = data.email as string
        }
        store.dispatch('writeLoading', false)
      })
    })

    return {
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
