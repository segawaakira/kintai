<template>
  <div>
    <div v-if="store.state.project">
      <v-btn
        type="button"
        :disabled="isInAttendance"
        @click="attendance()"
      >
        出勤
      </v-btn>
      <v-btn
        type="button"
        :disabled="!isInAttendance"
        @click="departure()"
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
    </div>

    <hr>

    <div>
      <v-btn
        type="button"
        @click="getLocation()"
      >
        現在地を取得し直す
      </v-btn>
      <hr>
      <dl id="result" />
      <hr>
      <div id="address" />
      <hr>
      <div class="map-wrapper">
        <div id="map-canvas" />
      </div>
    </div>
    <Confirm ref="confirmRef" />
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, Ref, ref, useStore } from '@nuxtjs/composition-api'
import firebase from 'firebase'

export default defineComponent({
  setup (_props, _context) {
    const store = useStore()
    const db = firebase.firestore()

    const placeName: Ref<string> = ref('')
    const placeLat: Ref<number | null> = ref(null)
    const placeLng: Ref<number | null> = ref(null)
    const description: Ref<string> = ref('')
    const isInAttendance: Ref<boolean> = ref(false)
    const confirmRef = ref(null)

    // 出勤
    const attendance = () => {
      store.dispatch('writeLoading', true)
      const start = new Date()
      const end = new Date()

      // @ts-ignore
      db.collection(`users/${store.state.user.uid}/projects/${store.state.project.id}/items`)
        .add({
          start,
          start_place_name: placeName.value,
          start_place_lat: placeLat.value,
          start_place_lng: placeLng.value,
          end,
          end_place_name: placeName.value,
          end_place_lat: placeLat.value,
          end_place_lng: placeLng.value,
          description: description.value
        })
        .then((ref) => {
          console.log('Add ID: ', ref.id)
          // 稼働中の出勤情報をin_attendanceに記録する。
          // @ts-ignore
          db.collection(`users/${store.state.user.uid}/projects/${store.state.project.id}/in_attendance`)
            .add({
              item_id: ref.id,
              start,
              start_place_name: placeName.value,
              start_place_lat: placeLat.value,
              start_place_lng: placeLng.value,
              end,
              end_place_name: placeName.value,
              end_place_lat: placeLat.value,
              end_place_lng: placeLng.value,
              description: description.value
            })
            .then((ref) => {
              console.log('Add ID: ', ref.id)
              // 稼働中のプロジェクト情報をin_attendance_projectに記録する。
              // @ts-ignore
              db.collection(`users/${store.state.user.uid}/in_attendance_project`)
                .add({
                  item_id: store.state.project.id,
                  name: store.state.project.name
                })
                .then(async (ref) => {
                  if (await confirmRef.value.open('出勤しました', false)) {
                    store.dispatch('writeLoading', false)
                  }
                  console.log('Add ID: ', ref.id)
                })
                .catch(async (error: any) => {
                  console.log(error)
                  // if (await confirmRef.value.open('出勤に失敗しました', false)) {
                  //   store.dispatch('writeLoading', false)
                  // }
                })
            })
            .catch(async (error: any) => {
              console.log(error)
              // if (await confirmRef.value.open('出勤に失敗しました', false)) {
              //   store.dispatch('writeLoading', false)
              // }
            })
        })
        .catch(async (error: any) => {
          console.log(error)
          // if (await confirmRef.value.open('出勤に失敗しました', false)) {
          //   store.dispatch('writeLoading', false)
          // }
        })
    }

    // 退勤
    const departure = () => {
      store.dispatch('writeLoading', true)
      // in_attendanceから稼働情報を取得する
      const inAttendanceArray: any = []
      // @ts-ignore
      db.collection(`users/${store.state.user.uid}/projects/${store.state.project.id}/in_attendance`).onSnapshot((docs) => {
        docs.forEach((doc) => {
          inAttendanceArray.push({
            ...doc.data(),
            id: doc.id
          })
        })
        console.log(inAttendanceArray[0])

        // 退勤情報をupdateで記録する
        const inAttendance: any = inAttendanceArray[0]
        const end = new Date()
        // @ts-ignore
        db.collection(`users/${store.state.user.uid}/projects/${store.state.project.id}/items`).doc(inAttendance.item_id)
          .update({
            start: inAttendance.start,
            start_place_name: inAttendance.start_place_name,
            start_place_lat: inAttendance.start_place_lat,
            start_place_lng: inAttendance.start_place_lng,
            end,
            end_place_name: placeName.value,
            end_place_lat: placeLat.value,
            end_place_lng: placeLng.value,
            description: description.value
          })
          .then(() => {
            // in_attendanceを削除する。
            // @ts-ignore
            db.collection(`users/${store.state.user.uid}/projects/${store.state.project.id}/in_attendance`).doc(inAttendance.id)
              .delete()
              .then(async (ref) => {
                console.log('del: ', ref)
                description.value = ''
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
          })
          .catch(async (error: any) => {
            console.log(error)
            // if (await confirmRef.value.open('退勤に失敗しました', false)) {
            //   store.dispatch('writeLoading', false)
            // }
          })
      })
    }

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
          const map = new google.maps.Map(document.getElementById('map-canvas'), {
            zoom: 15, // ズーム値
            center: latlng // 中心座標 [latlng]
          })

          // マーカーの新規出力
          // @ts-ignore
          new google.maps.Marker({
            map,
            position: latlng
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
          console.log(errorMessage)
          // confirmRef.value.open(errorMessage, false)
          store.dispatch('writeLoading', false)
        },

        // [第3引数] オプション
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 2000
        }

      )
    }

    onMounted(() => {
      firebase.auth().onAuthStateChanged((data) => {
        if (data) {
          // @ts-ignore
          db.collection(`users/${store.state.user.uid}/projects/${store.state.project.id}/in_attendance`).onSnapshot((docs) => {
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
      getLocation()
    })

    return {
      attendance,
      departure,
      getLocation,
      placeName,
      placeLat,
      placeLng,
      description,
      isInAttendance,
      confirmRef,
      store
    }
  }
})
</script>

<style>
#map-canvas {
  width: 100%;
  height: 320px;
}
</style>
