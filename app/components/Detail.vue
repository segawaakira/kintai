<template>
  <div class="my-16">
    <h1 class="headline mb-12">
      稼働詳細
    </h1>
    <v-form lazy-validation>
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

      <div class="mt-4 d-flex justify-space-between align-center">
        <v-btn
          type="button"
          depressed
          color="primary"
          @click="handleUpdateItem()"
        >
          更新する
        </v-btn>
        <v-btn
          type="button"
          depressed
          @click="handleDeleteItem()"
        >
          削除する
        </v-btn>
      </div>
    </v-form>

    <hr class="my-8">
    <v-btn
      depressed
      nuxt
      to="/calendar"
    >
      カレンダーに戻る
    </v-btn>
    <Confirm ref="confirmRef" />
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, Ref, ref, useStore } from '@nuxtjs/composition-api'
import firebase from 'firebase'
import dayjs from 'dayjs'
import { IState, IProject, IProjectItem } from '../interfaces/'
import Confirm from './common/Confirm.vue'

export default defineComponent({
  components: {
    Confirm
  },
  setup (_props, context) {
    const store = useStore()
    const state: IState = store.state as IState
    const currentProject: Ref<IProject> = ref(state.project)
    const db = firebase.firestore()

    const startTime: Ref<string> = ref('') // datetime-localで扱うYYYY-MM-DDThh:mm:ss
    const start: Ref<Date | null> = ref(null)
    const startPlaceName: Ref<string> = ref('')
    const startPlaceLat: Ref<number | null> = ref(null)
    const startPlaceLng: Ref<number | null> = ref(null)
    const endTime: Ref<string> = ref('') // datetime-localで扱うYYYY-MM-DDThh:mm:ss
    const end: Ref<Date | null> = ref(null)
    const endPlaceName: Ref<string> = ref('')
    const endPlaceLat: Ref<number | null> = ref(null)
    const endPlaceLng: Ref<number | null> = ref(null)
    const description: Ref<string> = ref('')
    const confirmRef: Ref<any> = ref()

    /* 更新 */
    const handleUpdateItem = () => {
      store.dispatch('writeLoading', true)
      // 退勤情報をupdateで記録する
      db.collection(`users/${state.user.uid}/projects/${currentProject.value.id}/items`).doc(context.root.$route.query.id as string)
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
        .then(async () => {
          if (await confirmRef.value.open('更新しました', false)) {
            store.dispatch('writeLoading', false)
          }
        })
        .catch(async (error) => {
          console.log(error)
          if (await confirmRef.value.open(error.message, false)) {
            store.dispatch('writeLoading', false)
          }
        })
    }

    /* 削除 */
    const handleDeleteItem = async () => {
      if (await confirmRef.value.open('本当に削除しますか？', true)) {
        store.dispatch('writeLoading', true)
        db.collection(`users/${state.user.uid}/projects/${currentProject.value.id}/items`).doc(context.root.$route.query.id as string)
          .delete()
          .then(() => {
            console.log('削除した')
            context.root.$router.push('/calendar')
          })
          .catch(async (error: any) => {
            console.log(error)
            if (await confirmRef.value.open(error.message, false)) {
              store.dispatch('writeLoading', false)
            }
          })
      }
    }

    onMounted(() => {
      // 今登録されている稼働情報を取得
      firebase.auth().onAuthStateChanged((data) => {
        if (data) {
          store.dispatch('writeLoading', true)
          db.collection(`users/${state.user.uid}/projects/${currentProject.value.id}/items`).doc(context.root.$route.query.id as string).get()
            .then((doc) => {
              if (doc.exists) {
                console.log('Document data:', doc.data())
                const data: IProjectItem = doc.data() as IProjectItem
                startTime.value = dayjs(data.start.toDate()).format('YYYY-MM-DDTHH:mm')
                start.value = data.start
                startPlaceName.value = data.start_place_name
                startPlaceLat.value = data.start_place_lat
                startPlaceLng.value = data.start_place_lng
                endTime.value = dayjs(data.end.toDate()).format('YYYY-MM-DDTHH:mm')
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
      handleUpdateItem,
      handleDeleteItem,
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
      description,
      confirmRef
    }
  }
})
</script>

<style>
</style>
