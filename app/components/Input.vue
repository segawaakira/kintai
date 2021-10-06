<template>
  <div>
    <v-btn
      type="button"
      @click="attendance()"
    >
      出勤
    </v-btn>
    <v-btn
      type="button"
      @click="departure()"
    >
      退勤
    </v-btn>

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
    const currentProject: Ref<any> = ref(store.state.project.id)
    const db = firebase.firestore()

    const placeName: Ref<string> = ref('')
    const placeLat: Ref<number> = ref()
    const placeLng: Ref<number> = ref()
    const description: Ref<string> = ref('')

    // 出勤
    const attendance = () => {
      const start = new Date()
      const end = new Date()

      const dbUsers = db.collection(`users/${currentUser.value.uid}/projects/${currentProject.value}/items`)
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
          description: '何やってたかを記入します。'
        })
        .then((ref) => {
          console.log('Add ID: ', ref.id)
        })
    }

    // 退勤
    const departure = () => {
      const start = new Date()
      const end = new Date()
      end.setHours(start.getHours() + 5)

      const dbUsers = db.collection(`users/${currentUser.value.uid}/projects/${currentProject.value}/items`)
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

    const submit = () => {
      const start = new Date()
      const end = new Date()
      end.setHours(start.getHours() + 5)

      const dbUsers = db.collection(`users/${currentUser.value.uid}/projects/${currentProject.value}/items`)
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

    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(
        // [第1引数] 取得に成功した場合の関数
        function (position) {
          // 取得したデータの整理
          const data = position.coords

          // データの整理
          const lat = data.latitude
          const lng = data.longitude
          const alt = data.altitude
          const accLatlng = data.accuracy
          const accAlt = data.altitudeAccuracy
          const heading = data.heading
          const speed = data.speed

          // HTMLへの書き出し
          document.getElementById('result').innerHTML = '<dl><dt>緯度</dt><dd>' + lat + '</dd><dt>経度</dt><dd>' + lng + '</dd><dt>高度</dt><dd>' + alt + '</dd><dt>緯度、経度の精度</dt><dd>' + accLatlng + '</dd><dt>高度の精度</dt><dd>' + accAlt + '</dd><dt>方角</dt><dd>' + heading + '</dd><dt>速度</dt><dd>' + speed + '</dd></dl>'

          // 位置情報
          const latlng = new google.maps.LatLng(lat, lng)

          // Google Mapsに書き出し
          const map = new google.maps.Map(document.getElementById('map-canvas'), {
            zoom: 15, // ズーム値
            center: latlng // 中心座標 [latlng]
          })

          // マーカーの新規出力
          new google.maps.Marker({
            map,
            position: latlng
          })

          const currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
          map.setCenter(currentLocation)

          const geocoder = new google.maps.Geocoder()
          geocoder.geocode({ latLng: currentLocation }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              placeName.value = results[0].formatted_address // 一番最初の住所を登録する。
              for (const i in results) {
                console.log(results[i].formatted_address)
                document.getElementById('address').innerHTML += (results[i].formatted_address + '<br />')
              }
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
          document.getElementById('result').innerHTML = errorMessage
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
        } else {
          currentUser.value = {}
        }
      })
      getLocation()
    })

    return {
      submit,
      attendance,
      departure,
      currentUser,
      currentProject,
      getLocation,
      placeName,
      placeLat,
      placeLng,
      description
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
