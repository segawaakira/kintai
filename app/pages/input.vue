<template>
  <div>
    <Input />
  </div>
</template>

<script>
import { defineComponent, onMounted } from '@nuxtjs/composition-api'
import firebase from 'firebase'
import Input from '../components/Input.vue'

export default defineComponent({
  components: { Input },
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
