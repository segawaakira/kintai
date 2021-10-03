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
          <div v-if="editProjectId === item.id">
            <v-text-field v-model="item.name"></v-text-field>
            <v-btn
              type="button"
              @click="saveProject(item.id, item.name)"
            >
              saveProject
            </v-btn>
          </div>
          <div v-else>
            {{ item.name }}
            <v-btn
              type="button"
              @click="editProject(item.id)"
            >
              editProject
            </v-btn>
            <v-btn
              type="button"
              @click="deleteProject(item.id)"
            >
              deleteProject
            </v-btn>
          </div>
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
    const deleteProject = (id: string) => {
      db.collection(`users/${currentUser.value.uid}/projects/`).doc(id)
        .delete()
        .then((ref) => {
          console.log('del: ', ref)
        })
    }
    const editProjectId: Ref<string | null> = ref(null)
    const editProject = (id: string) => {
      editProjectId.value = id
    }
    const saveProject = (id: string, name: string) => {
      db.collection(`users/${currentUser.value.uid}/projects/`).doc(id)
        .update({
          name
        })
        .then((ref) => {
          console.log('del: ', ref)
        })
    }

    onMounted(() => {
      firebase.auth().onAuthStateChanged((data) => {
        if (data) {
          currentUser.value = firebase.auth().currentUser
          db.collection(`users/${currentUser.value.uid}/projects`).onSnapshot((docs) => {
            projects.value = []
            docs.forEach((doc) => {
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
      deleteProject,
      editProject,
      saveProject,
      editProjectId,
      currentUser,
      projects
    }
  }
})
</script>

<style>
</style>
