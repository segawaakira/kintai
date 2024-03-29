<template>
  <div class="my-16">
    <h1 class="headline mb-12">
      {{ pTitle }}
    </h1>
    <ProjectSelect />
    <div v-if="state.project" class="mt-8">
      <div class="clock-upper" v-text="clockUpper" />
      <div class="clock-lower" v-text="clockLower" />
      <div class="my-8">
        <v-btn
          x-large
          depressed
          type="button"
          color="primary"
          class="mr-2"
          :disabled="isInAttendance"
          @click="handleAttendance()"
        >
          出勤
        </v-btn>
        <v-btn
          x-large
          depressed
          type="button"
          color="primary"
          :disabled="!isInAttendance"
          @click="handleDeparture()"
        >
          退勤
        </v-btn>
      </div>

      <v-form lazy-validation>
        <v-text-field
          v-model="description"
          label="やること・やったことなど"
          required
        />
      </v-form>
    </div>

    <v-alert
      v-else
      dense
      outlined
      type="warning"
      class="mt-8"
    >
      稼働する案件を選択してください。
    </v-alert>

    <!-- 現在地のGoogle Map -->
    <div class="mt-8">
      <v-btn
        class="my-8"
        type="button"
        depressed
        @click="getLocation()"
      >
        <v-icon class="mr-2">
          location_on
        </v-icon>
        現在地を取得し直す
      </v-btn>
      <div v-if="placeName" id="js-address" class="mb-4">
        現在地：{{ placeName }}
      </div>
      <div class="map-wrapper">
        <div id="js-map" />
      </div>
    </div>

    <Confirm ref="confirmRef" />
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, Ref, ref, useStore, watch } from '@nuxtjs/composition-api'
import firebase from 'firebase'
import dayjs from 'dayjs'
import { IProject, IProjectItem, IState } from '../interfaces/'
import { DAY_OF_WEEK } from '../common/constants'
import Confirm from './common/Confirm.vue'
import ProjectSelect from './parts/ProjectSelect.vue'

export default defineComponent({
  components: {
    Confirm, ProjectSelect
  },
  props: {
    pTitle: {
      type: String,
      default: ''
    }
  },
  setup (_props, _context) {
    const store = useStore()
    const state: IState = store.state as IState
    const db = firebase.firestore()

    const placeName: Ref<string> = ref('')
    const placeLat: Ref<number | null> = ref(null)
    const placeLng: Ref<number | null> = ref(null)
    const description: Ref<string> = ref('')
    const isInAttendance: Ref<boolean> = ref(false)
    const clockUpper: Ref<string> = ref('　')
    const clockLower: Ref<string> = ref('　')
    const confirmRef: Ref<any> = ref()

    /* 出勤 */
    const handleAttendance = () => {
      store.dispatch('writeLoading', true)
      const start = new Date()
      const end = new Date()
      const attendanceItem: IProjectItem = {
        start,
        start_place_name: placeName.value as string,
        start_place_lat: placeLat.value as number,
        start_place_lng: placeLng.value as number,
        end,
        end_place_name: placeName.value as string,
        end_place_lat: placeLat.value as number,
        end_place_lng: placeLng.value as number,
        description: description.value
      }

      db.collection(`users/${state.user.uid}/projects/${state.project.id}/items`)
        .add(attendanceItem)
        .then((ref) => {
          // console.log('Add ID: ', ref.id)
          const inAttendanceItem: IProjectItem = {
            item_id: ref.id,
            start,
            start_place_name: placeName.value as string,
            start_place_lat: placeLat.value as number,
            start_place_lng: placeLng.value as number,
            end,
            end_place_name: placeName.value as string,
            end_place_lat: placeLat.value as number,
            end_place_lng: placeLng.value as number,
            description: description.value
          }
          // 稼働中の出勤情報をin_attendanceに記録する。
          db.collection(`users/${state.user.uid}/projects/${state.project.id}/in_attendance`)
            .add(inAttendanceItem)
            .then(() => {
              // console.log('Add ID: ', ref.id)
              // 稼働中の案件情報をin_attendance_projectに記録する。
              const inAttendanceProject: IProject = {
                id: state.project.id,
                name: state.project.name
              }
              db.collection(`users/${state.user.uid}/in_attendance_project`)
                .add(inAttendanceProject)
                .then(async () => {
                  if (await confirmRef.value.open('出勤しました', false)) {
                    store.dispatch('writeLoading', false)
                  }
                  // console.log('Add ID: ', ref.id)
                })
                .catch(async (error: any) => {
                  console.log(error)
                  if (await confirmRef.value.open('出勤に失敗しました', false)) {
                    store.dispatch('writeLoading', false)
                  }
                })
            })
            .catch(async (error: any) => {
              console.log(error)
              if (await confirmRef.value.open('出勤に失敗しました', false)) {
                store.dispatch('writeLoading', false)
              }
            })
        })
        .catch(async (error: any) => {
          console.log(error)
          if (await confirmRef.value.open('出勤に失敗しました', false)) {
            store.dispatch('writeLoading', false)
          }
        })
    }

    /* 退勤 */
    const handleDeparture = () => {
      store.dispatch('writeLoading', true)
      // in_attendanceから稼働情報を取得する
      const inAttendanceArray: any = []
      db.collection(`users/${state.user.uid}/projects/${state.project.id}/in_attendance`).onSnapshot((docs) => {
        docs.forEach((doc) => {
          inAttendanceArray.push({
            ...doc.data(),
            id: doc.id
          })
        })
        // console.log(inAttendanceArray[0])

        // 退勤情報をupdateで記録する
        const inAttendance: any = inAttendanceArray[0]
        const end = new Date()
        const inAttendanceItem: IProjectItem = {
          start: inAttendance.start,
          start_place_name: inAttendance.start_place_name as string,
          start_place_lat: inAttendance.start_place_lat as number,
          start_place_lng: inAttendance.start_place_lng as number,
          end,
          end_place_name: placeName.value as string,
          end_place_lat: placeLat.value as number,
          end_place_lng: placeLng.value as number,
          description: description.value
        }
        db.collection(`users/${state.user.uid}/projects/${state.project.id}/items`).doc(inAttendance.item_id)
          .update(inAttendanceItem)
          .then(() => {
            // in_attendanceを削除する。
            db.collection(`users/${state.user.uid}/projects/${state.project.id}/in_attendance`).doc(inAttendance.id)
              .delete()
              .then(async () => {
                // console.log('del: ', ref)
                // in_attendance_projectも削除する。
                const inAttendanceProject = await db.collection(`users/${state.user.uid}/in_attendance_project`).get()
                inAttendanceProject.forEach((doc) => {
                  db.collection(`users/${state.user.uid}/in_attendance_project/`).doc(doc.id)
                    .delete()
                    .then(async () => {
                      // console.log('del: ', ref)
                      if (await confirmRef.value.open('退勤しました', false)) {
                        store.dispatch('writeLoading', false)
                      }
                    })
                    .catch(async (error: any) => {
                      console.log(error)
                      if (await confirmRef.value.open('退勤に失敗しました', false)) {
                        store.dispatch('writeLoading', false)
                      }
                    })
                  description.value = ''
                })
              })
              .catch(async (error: any) => {
                console.log(error)
                if (await confirmRef.value.open('退勤に失敗しました', false)) {
                  store.dispatch('writeLoading', false)
                }
              })
          })
          .catch(async (error: any) => {
            console.log(error)
            if (await confirmRef.value.open('退勤に失敗しました', false)) {
              store.dispatch('writeLoading', false)
            }
          })
      })
    }

    /* 現在地取得 */
    const getLocation = () => {
      store.dispatch('writeLoading', true)
      navigator.geolocation.getCurrentPosition(
        // [第1引数] 取得に成功した場合の関数
        function (position) {
          // 取得したデータの整理
          const data = position.coords

          // データの整理
          const lat = data.latitude
          const lng = data.longitude

          // 位置情報
          // @ts-ignore
          const latlng = new google.maps.LatLng(lat, lng)

          // Google Mapsに書き出し
          // @ts-ignore
          const map = new google.maps.Map(document.getElementById('js-map'), {
            zoom: 16, // ズーム値
            center: latlng, // 中心座標 [latlng]
            styles: [
              {
                featureType: 'all',
                elementType: 'all',
                stylers: [
                  { saturation: -100 } // 彩度に-100を指定してグレースケールに
                ]
              },
              {
                featureType: 'poi', // 観光スポット、施設、学校、公園等
                elementType: 'all',
                stylers: [
                  { visibility: 'off' }
                ]
              }
            ]
          })

          const icon = {
            url: '/logo.svg',
            // @ts-ignore
            scaledSize: new google.maps.Size(80, 80)
          }

          // マーカーの新規出力
          // @ts-ignore
          new google.maps.Marker({
            map,
            position: latlng,
            icon,
            // @ts-ignore
            animation: google.maps.Animation.DROP
          })

          // @ts-ignore
          const currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
          map.setCenter(currentLocation)

          // @ts-ignore
          const geocoder = new google.maps.Geocoder()
          geocoder.geocode({ latLng: currentLocation }, function (results: any, status: any) {
            // @ts-ignore
            if (status === google.maps.GeocoderStatus.OK) {
              placeName.value = results[0].formatted_address // 一番最初の住所を登録する。
            } else {
              window.alert('google.maps.GeocoderStatus is not OK. due to ' + status)
            }
            // 変数に代入
            placeLat.value = lat
            placeLng.value = lng
            store.dispatch('writeLoading', false)
          })
        },

        // [第2引数] 取得に失敗した場合の関数
        function (error) {
          // エラーコード(error.code)の番号
          // 0:UNKNOWN_ERROR 原因不明のエラー
          // 1:PERMISSION_DENIED 利用者が位置情報の取得を許可しなかった
          // 2:POSITION_UNAVAILABLE 電波状況などで位置情報が取得できなかった
          // 3:TIMEOUT 位置情報の取得に時間がかかり過ぎた…

          // エラーダイアログ
          const errorDialog = async (message: string) => {
            await confirmRef.value.open(message, false)
            store.dispatch('writeLoading', false)
          }

          // エラー番号に対応したメッセージ
          const errorInfo = [
            '原因不明のエラーが発生しました。',
            '位置情報の取得が許可されませんでした。',
            '電波状況などで位置情報が取得できませんでした。',
            '位置情報の取得に時間がかかり過ぎてタイムアウトしました。'
          ]

          // エラー番号
          const errorNo = error.code

          // エラーメッセージ
          const errorMessage = '[エラー番号: ' + errorNo + ']\n' + errorInfo[errorNo]
          errorDialog(errorMessage)
        },

        // [第3引数] オプション
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 2000
        }

      )
    }

    /* 稼働中があるかを確認する */
    const checkInAttendance = () => {
      firebase.auth().onAuthStateChanged((data) => {
        if (data && state.project) {
          db.collection(`users/${state.user.uid}/projects/${state.project.id}/in_attendance`).onSnapshot((docs) => {
            const inAttendanceArray: any = []
            isInAttendance.value = false
            docs.forEach((doc) => {
              isInAttendance.value = true
              inAttendanceArray.push({
                ...doc.data(),
                id: doc.id
              })
            })
            if (inAttendanceArray.length) {
              description.value = inAttendanceArray[0].description
            }
          })
        }
      })
    }

    /* 時計 */
    const clock = () => {
      const now = new Date()
      const ymd: string = dayjs(now).format('YYYY年MM月DD日')
      const dayOfWeek: string = DAY_OF_WEEK[now.getDay()]
      const time: string = dayjs(now).format('HH:mm:ss')
      clockUpper.value = ymd + '（' + dayOfWeek + '）'
      clockLower.value = time
    }

    onMounted(() => {
      setInterval(() => {
        clock()
      }, 1000)
      checkInAttendance()
      getLocation()
    })

    /* 案件変更時 */
    watch(
      () => state.project,
      (_n, _o) => {
        checkInAttendance()
      }
    )

    return {
      handleAttendance,
      handleDeparture,
      getLocation,
      placeName,
      placeLat,
      placeLng,
      description,
      isInAttendance,
      confirmRef,
      clockUpper,
      clockLower,
      state
    }
  }
})
</script>

<style lang="scss">
.clock {
  &-upper {
    font-size: 1.5rem;
    color: var(--v-secondary-lighten4);
  }
  &-lower {
    font-size: 4rem;
    color: var(--v-secondary-lighten4);
  }
}
#js-address {
  font-size: 0.8rem;
}
#js-map {
  width: 100%;
  height: 320px;
}
</style>
