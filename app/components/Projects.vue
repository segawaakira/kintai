<template>
  <div>
    <v-btn
      type="button"
      @click="submit()"
    >
      submit
    </v-btn>
    <hr>
    <v-select
      :items="projects"
      filled
      label="Select project"
      item-text="name"
    />
    <hr>

    <v-list three-line>
      <template v-for="(item, index) in projects">
        <v-list-item
          :key="index"
          class="timeline"
        >
          {{ item.name }}
        </v-list-item>
      </template>
    </v-list>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from '@nuxtjs/composition-api'
import firebase from 'firebase'

export default defineComponent({
  setup (_props, _context) {
    const currentUser: Ref<any> = ref(null)
    const projects: Ref<any> = ref([])
    const db = firebase.firestore()
    const submit = () => {
      const dbUsers = db.collection(`users/${currentUser.value.uid}/projects/`)
      dbUsers
        .add({
          name: 'project_a'
        })
        .then((ref) => {
          console.log('Add ID: ', ref.id)
        })
    }

    onMounted(() => {
      firebase.auth().onAuthStateChanged((data) => {
        if (data) {
          currentUser.value = firebase.auth().currentUser
          db.collection(`users/${currentUser.value.uid}/projects`).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              console.log('ああああ')
              projects.value.push({
                ...doc.data(),
                id: doc.id
              })
            })
          })
        } else {
          currentUser.value = {}
        }
      })
    })

    return {
      submit,
      currentUser,
      projects
    }
  }
})
</script>

<style>
</style>
