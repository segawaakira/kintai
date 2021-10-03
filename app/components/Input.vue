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
    const currentProject: Ref<any> = ref('1jfBSj8AEMokZ1mBFnSu')
    const db = firebase.firestore()
    const submit = () => {
      const start = new Date()
      const end = new Date()
      end.setHours(start.getHours() + 5)

      const dbUsers = db.collection(`users/${currentUser.value.uid}/projects/${currentProject.value}/item`)
      dbUsers
        .add({
          start,
          start_place_name: '京都',
          start_place_lat: 35.0181617,
          start_place_lng: 135.7466834,
          end,
          end_place_name: '京都',
          end_place_lat: 35.0181617,
          end_place_lng: 135.7466834,
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
      currentUser,
      currentProject
    }
  }
})
</script>

<style>
</style>
