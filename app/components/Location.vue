<template>
  <div>
    <v-btn
      type="button"
      @click="getLocation()"
    >
      ボタン
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
</template>
<script type="ts">
import { defineComponent } from '@nuxtjs/composition-api'
// import axios from 'axios'
// import { Client } from '@googlemaps/google-maps-services-js'

export default defineComponent({
  setup (_props, _context) {
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
              for (const i in results) {
                document.getElementById('address').innerHTML += (results[i].formatted_address + '<br />')
              }
            } else {
              window.alert('google.maps.GeocoderStatus is not OK. due to ' + status)
            }
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
    return {
      getLocation
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
