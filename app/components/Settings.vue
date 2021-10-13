<template>
  <div>
    <v-form lazy-validation>
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
              :error-messages="emailError"
              @input="emailError = ''"
            />
          </v-col>
        </v-row>
        <v-btn
          type="button"
          @click="handleSave()"
        >
          handleSave
        </v-btn>
      </v-container>
    </v-form>

    <hr>

    <v-btn
      type="button"
      @click="handleLeave()"
    >
      退会する
    </v-btn>
    <p v-if="leaveError">{{ leaveError }}</p>
    <Confirm ref="confirmRef" />
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, Ref, ref, useStore } from '@nuxtjs/composition-api'
import firebase from 'firebase'

export default defineComponent({
  setup (_props, _context) {
    const store = useStore()
    const currentUser: Ref<any> = ref(null)
    const email: Ref<string> = ref('')
    const emailError: Ref<string> = ref('')
    const isEditEmail: Ref<boolean> = ref(false)
    const leaveError: Ref<string> = ref('')
    const confirmRef: Ref<any> = ref()

    /* 保存 */
    const handleSave = () => {
      store.dispatch('writeLoading', true)
      currentUser.value.updateEmail(email.value)
        .then(async () => {
          if (await confirmRef.value.open('メールアドレスを変更しました', false)) {
            store.dispatch('writeLoading', false)
          }
        })
        .catch((error: any) => {
          console.log(error)
          emailError.value = error.message
          store.dispatch('writeLoading', false)
        })
    }

    /* 退会 */
    const handleLeave = async () => {
      leaveError.value = ''
      if (await confirmRef.value.open('本当に退会しますか？', true)) {
        store.dispatch('writeLoading', true)
        currentUser.value.delete()
          .then(() => {
            store.dispatch('writeDefaultState')
            // Todo:userに紐づいたfirestoreのデータ全て削除
            location.href = '/login'
          })
          .catch((error: any) => {
            console.log(error)
            leaveError.value = error.message
            store.dispatch('writeLoading', false)
          })
      }
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
      email,
      emailError,
      isEditEmail,
      leaveError,
      handleSave,
      handleLeave,
      currentUser,
      confirmRef
    }
  }
})
</script>

<style>
</style>
