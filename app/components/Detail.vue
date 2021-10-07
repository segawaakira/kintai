<template>
  <div>
    <v-btn
      type="button"
      @click="update()"
    >
      退勤
    </v-btn>

    <hr>

    <v-form ref="myForm" lazy-validation>
      <v-container>
        <v-row>
          <v-col
            cols="12"
            sm="12"
            md="12"
          >
            <v-text-field
              v-model="description"
              label="やること・やったことなど"
              required
            />
          </v-col>
        </v-row>
      </v-container>
    </v-form>

    <hr>
    <v-btn
      color="primary"
      nuxt
      to="/calendar"
    >
      カレンダーに戻る
    </v-btn>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, Ref, ref, useStore } from '@nuxtjs/composition-api'
import firebase from 'firebase'

export default defineComponent({
  setup (_props, context) {
    const store = useStore()
    const currentUser: Ref<any> = ref(null)
    // @ts-ignore
    const currentProject: Ref<any> = ref(store.state.project.id)
    const db = firebase.firestore()

    const placeName: Ref<string> = ref('')
    const placeLat: Ref<number | null> = ref(null)
    const placeLng: Ref<number | null> = ref(null)
    const description: Ref<string> = ref('')

    // 更新
    const update = () => {
      // 退勤情報をupdateで記録する
      // const end = new Date()
      // db.collection(`users/${currentUser.value.uid}/projects/${currentProject.value}/items`).doc(inAttendance.item_id)
      //   .update({
      //     start: inAttendance.start,
      //     start_place_name: inAttendance.start_place_name,
      //     start_place_lat: inAttendance.start_place_lat,
      //     start_place_lng: inAttendance.start_place_lng,
      //     end,
      //     end_place_name: placeName.value,
      //     end_place_lat: placeLat.value,
      //     end_place_lng: placeLng.value,
      //     description: description.value
      //   })
      //   .then(() => {
      //     // in_attendanceを削除する。
      //     db.collection(`users/${currentUser.value.uid}/projects/${currentProject.value}/in_attendance`).doc(inAttendance.id)
      //       .delete()
      //       .then((ref) => {
      //         console.log('del: ', ref)
      //       })
      //     description.value = ''
      //   })
    }

    onMounted(() => {
      firebase.auth().onAuthStateChanged((data) => {
        if (data) {
          currentUser.value = firebase.auth().currentUser
          const docRef = db.collection(`users/${currentUser.value.uid}/projects/${currentProject.value}/items`).doc(context.root.$route.query.id as string)

          docRef.get().then((doc) => {
            if (doc.exists) {
              console.log('Document data:', doc.data())
            } else {
              // doc.data() will be undefined in this case
              console.log('No such document!')
            }
          }).catch((error) => {
            console.log('Error getting document:', error)
          })
        } else {
          currentUser.value = {}
        }
      })
    })

    return {
      update,
      currentUser,
      currentProject,
      placeName,
      placeLat,
      placeLng,
      description
    }
  }
})
</script>

<style>
</style>
