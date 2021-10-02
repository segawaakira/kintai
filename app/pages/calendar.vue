<template>
  <v-row>
    <v-col class="text-center">
      <img
        src="/v.png"
        alt="Vuetify.js"
        class="mb-5"
      >
      <blockquote class="blockquote">
        &#8220;First, solve the problem. Then, write the code.&#8221;
        <footer>
          <small>
            <em>calendar</em>
          </small>
        </footer>
      </blockquote>
    </v-col>
  </v-row>
</template>

<script>
import { defineComponent, onMounted } from '@nuxtjs/composition-api'
import firebase from 'firebase'

export default defineComponent({
  setup (_props, _context) {
    onMounted(() => {
      // Todo:処理一元化する。
      firebase.auth().onAuthStateChanged((data) => {
        if (data) {
          console.log(data)
        } else {
          // Todo:location.hrefでなく、Nuxtでの書き方あればそれにする
          location.href = '/login'
        }
      })
    })

    return {
    }
  }
})
</script>
