<template>
  <div>
    <v-form ref="myForm" lazy-validation>
      <v-container>
        <v-row>
          <v-col
            cols="12"
            sm="12"
            md="12"
          >
            <v-text-field
              v-model="startTime"
              label="開始時間"
              type="datetime-local"
            />
          </v-col>
          <v-col
            cols="12"
            sm="12"
            md="12"
          >
            <v-text-field
              v-model="startPlaceName"
              label="開始場所"
              required
            />
          </v-col>
          <v-col
            cols="12"
            sm="12"
            md="12"
          >
            <v-text-field
              v-model="endTime"
              label="終了時間"
              type="datetime-local"
            />
          </v-col>
          <v-col
            cols="12"
            sm="12"
            md="12"
          >
            <v-text-field
              v-model="endPlaceName"
              label="終了場所"
              required
            />
          </v-col>
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

      <hr>

      <v-btn
        type="button"
        @click="update()"
      >
        更新する
      </v-btn>

      <hr>

      <v-btn
        type="button"
        @click="onDelete()"
      >
        削除する
      </v-btn>
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
import dayjs from 'dayjs'

export default defineComponent({
  setup (_props, context) {
    const store = useStore()
    // @ts-ignore
    const currentProject: Ref<any> = ref(store.state.project)
    const db = firebase.firestore()

    const startTime: Ref<any> = ref()
    const start: Ref<any> = ref()
    const startPlaceName: Ref<string> = ref('')
    const startPlaceLat: Ref<number | null> = ref(null)
    const startPlaceLng: Ref<number | null> = ref(null)
    const endTime: Ref<any> = ref()
    const end: Ref<any> = ref()
    const endPlaceName: Ref<string> = ref('')
    const endPlaceLat: Ref<number | null> = ref(null)
    const endPlaceLng: Ref<number | null> = ref(null)
    const description: Ref<string> = ref('')

    // 更新
    const update = () => {
      store.dispatch('writeLoading', true)
      // 退勤情報をupdateで記録する
      // @ts-ignore
      db.collection(`users/${store.state.user.uid}/projects/${currentProject.value.id}/items`).doc(context.root.$route.query.id as string)
        .update({
          start: new Date(startTime.value),
          start_place_name: startPlaceName.value,
          start_place_lat: startPlaceLat.value,
          start_place_lng: startPlaceLng.value,
          end: new Date(endTime.value),
          end_place_name: endPlaceName.value,
          end_place_lat: endPlaceLat.value,
          end_place_lng: endPlaceLng.value,
          description: description.value
        })
        .then(() => {
          console.log('更新した')
          store.dispatch('writeLoading', false)
        })
        .catch((error) => {
          console.log(error)
          store.dispatch('writeLoading', false)
        })
    }

    // 削除
    const onDelete = () => {
      store.dispatch('writeLoading', true)
      // @ts-ignore
      db.collection(`users/${store.state.user.uid}/projects/${currentProject.value.id}/items`).doc(context.root.$route.query.id as string)
        .delete()
        .then(() => {
          console.log('削除した')
          // Todo:location.hrefでなく、Nuxtでの書き方あればそれにする
          location.href = '/calendar'
        })
        .catch((error) => {
          console.log(error)
          store.dispatch('writeLoading', false)
        })
    }

    onMounted(() => {
      // 今登録されている稼働情報を取得
      firebase.auth().onAuthStateChanged((data) => {
        if (data) {
          store.dispatch('writeLoading', true)
          // @ts-ignore
          const docRef = db.collection(`users/${store.state.user.uid}/projects/${currentProject.value.id}/items`).doc(context.root.$route.query.id as string)

          docRef.get()
            .then((doc) => {
              if (doc.exists) {
                console.log('Document data:', doc.data())
                const data: any = doc.data()
                startTime.value = dayjs(new Date(data.start.seconds * 1000)).format('YYYY-MM-DDTHH:MM')
                start.value = data.start
                startPlaceName.value = data.start_place_name
                startPlaceLat.value = data.start_place_lat
                startPlaceLng.value = data.start_place_lng
                endTime.value = dayjs(new Date(data.end.seconds * 1000)).format('YYYY-MM-DDTHH:MM')
                end.value = data.end
                endPlaceName.value = data.end_place_name
                endPlaceLat.value = data.end_place_lat
                endPlaceLng.value = data.end_place_lng
                description.value = data.description
              } else {
                // doc.data() will be undefined in this case
                console.log('No such document!')
              }
              store.dispatch('writeLoading', false)
            })
            .catch((error) => {
              console.log('Error getting document:', error)
              store.dispatch('writeLoading', false)
            })
        } else {
          store.dispatch('writeLoading', false)
        }
      })
    })

    return {
      update,
      onDelete,
      currentProject,
      startTime,
      start,
      startPlaceName,
      startPlaceLat,
      startPlaceLng,
      endTime,
      end,
      endPlaceName,
      endPlaceLat,
      endPlaceLng,
      description
    }
  }
})
</script>

<style>
</style>
