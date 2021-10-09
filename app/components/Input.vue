<template>
  <div>
    <v-btn
      type="button"
      @click="attendance()"
      :disabled="isInAttendance"
    >
      出勤
    </v-btn>
    <v-btn
      type="button"
      @click="departure()"
      :disabled="!isInAttendance"
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
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, Ref, ref, useStore } from '@nuxtjs/composition-api'
import firebase from 'firebase'

export default defineComponent({
  setup (_props, _context) {
    const store = useStore()
    const currentUser: Ref<any> = ref(null)
    // @ts-ignore
    const currentProject: Ref<any> = ref(store.state.project)
    const db = firebase.firestore()

    const placeName: Ref<string> = ref('')
    const placeLat: Ref<number | null> = ref(null)
    const placeLng: Ref<number | null> = ref(null)
    const description: Ref<string> = ref('')
    const isInAttendance: Ref<boolean> = ref(false)

    // 出勤
    const attendance = () => {
      const start = new Date()
      const end = new Date()

      const dbUsers = db.collection(`users/${currentUser.value.uid}/projects/${currentProject.value.id}/items`)
      dbUsers
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
          // 稼働中の出勤情報をin_attendanceに記録する。
          console.log('Add ID: ', ref.id)
          const dbUsers = db.collection(`users/${currentUser.value.uid}/projects/${currentProject.value.id}/in_attendance`)
          dbUsers
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
            })
          // 稼働中のプロジェクト情報をin_attendance_projectに記録する。
          const dbUsers2 = db.collection(`users/${currentUser.value.uid}/in_attendance_project`)
          dbUsers2
            .add({
              item_id: currentProject.value.id,
              name: currentProject.value.name
            })
            .then((ref) => {
              console.log('Add ID: ', ref.id)
            })
        })
    }

    // 退勤
    const departure = () => {
      // in_attendanceから稼働情報を取得する
      const inAttendanceArray: any = []
      db.collection(`users/${currentUser.value.uid}/projects/${currentProject.value.id}/in_attendance`).onSnapshot((docs) => {
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
        db.collection(`users/${currentUser.value.uid}/projects/${currentProject.value.id}/items`).doc(inAttendance.item_id)
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
            db.collection(`users/${currentUser.value.uid}/projects/${currentProject.value.id}/in_attendance`).doc(inAttendance.id)
              .delete()
              .then((ref) => {
                console.log('del: ', ref)
              })
            description.value = ''
          })
      })
    }

    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(
        // [第1引数] 取得に成功した場合の関数
        function (position) {
          // 取得したデータの整理
          const data = position.coords

          // データの整理
          const lat = data.latitude
          const lng = data.longitude
          // const alt = data.altitude
          // const accLatlng = data.accuracy
          // const accAlt = data.altitudeAccuracy
          // const heading = data.heading
          // const speed = data.speed

          // HTMLへの書き出し
          // document.getElementById('result').innerHTML = '<dl><dt>緯度</dt><dd>' + lat + '</dd><dt>経度</dt><dd>' + lng + '</dd><dt>高度</dt><dd>' + alt + '</dd><dt>緯度、経度の精度</dt><dd>' + accLatlng + '</dd><dt>高度の精度</dt><dd>' + accAlt + '</dd><dt>方角</dt><dd>' + heading + '</dd><dt>速度</dt><dd>' + speed + '</dd></dl>'

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
              // for (const i in results) {
              //   console.log(results[i].formatted_address)
              //   document.getElementById('address').innerHTML += (results[i].formatted_address + '<br />')
              // }
            } else {
              window.alert('google.maps.GeocoderStatus is not OK. due to ' + status)
            }
          })

          // 変数に代入
          placeLat.value = lat
          placeLng.value = lng
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
            '原因不明のエラーが発生しました…。',
            '位置情報の取得が許可されませんでした…。',
            '電波状況などで位置情報が取得できませんでした…。',
            '位置情報の取得に時間がかかり過ぎてタイムアウトしました…。'
          ]

          // エラー番号
          const errorNo = error.code

          // エラーメッセージ
          const errorMessage = '[エラー番号: ' + errorNo + ']\n' + errorInfo[errorNo]

          // アラート表示
          alert(errorMessage)

          // HTMLに書き出し
          // document.getElementById('result').innerHTML = errorMessage
        },

        // [第3引数] オプション
        {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 2000
        }

      )
    }

    onMounted(() => {
      firebase.auth().onAuthStateChanged((data) => {
        if (data) {
          currentUser.value = firebase.auth().currentUser
          db.collection(`users/${currentUser.value.uid}/projects/${currentProject.value.id}/in_attendance`).onSnapshot((docs) => {
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
        } else {
          currentUser.value = {}
        }
      })
      getLocation()
    })

    return {
      attendance,
      departure,
      currentUser,
      currentProject,
      getLocation,
      placeName,
      placeLat,
      placeLng,
      description,
      isInAttendance
    }
  }
})
</script>

<style>
#map-canvas {
  width: 100%;
  height: 100vh;
}
</style>
