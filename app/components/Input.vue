<template>
  <div>
    <v-btn
      type="button"
      @click="submit()"
    >
      submit
    </v-btn>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from '@nuxtjs/composition-api'
import firebase from 'firebase'

export default defineComponent({
  setup (_props, _context) {
    const currentUser: Ref<any> = ref(null)
    const submit = () => {
      const db = firebase.firestore()
      const start = new Date()
      const end = new Date()
      end.setHours(start.getHours() + 5)

      const dbUsers = db.collection(`users/${currentUser.value.uid}/item`)
      dbUsers
        .add({
          start,
          end,
          place: '京都',
          place_lat: 35.0181617,
          place_lng: 135.7466834,
          description: '何やってたかを記入します。'
        })
        .then((ref) => {
          console.log('Add ID: ', ref.id)
        })
    }

    onMounted(() => {
      firebase.auth().onAuthStateChanged((data) => {
        if (data) {
          currentUser.value = firebase.auth().currentUser
        } else {
          currentUser.value = {}
        }
      })
    })

    return {
      submit,
      currentUser
    }
  }
})
</script>

<style>
</style>
