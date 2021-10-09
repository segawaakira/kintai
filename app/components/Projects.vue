<template>
  <div>
    <v-form ref="myForm" lazy-validation>
      <v-container>
        <v-row>
          <v-col
            cols="12"
            sm="12"
            md="12"
          >
            <v-text-field
              v-model="projectName"
              :rules="projectNameRules"
              label="プロジェクト名"
              required
            />
          </v-col>
        </v-row>
        <v-btn
          type="button"
          @click="createProject()"
        >
          createProject
        </v-btn>
      </v-container>
    </v-form>

    <hr>

    <v-list three-line>
      <template v-for="(item, index) in projects">
        <v-list-item
          :key="index"
          class="timeline"
        >
          <div v-if="editProjectId === item.id">
            <v-text-field v-model="item.name" />
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
    <loading-overlay :p-loading="loading" />
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
    const loading: Ref<boolean> = ref(false)
    const projectNameRules = [
      (v: any) => !!v || 'projectName is required'
    ]
    const projectName: Ref<string> = ref('')

    const createProject = () => {
      loading.value = true
      db.collection(`users/${currentUser.value.uid}/projects/`)
        .add({
          name: projectName.value
        })
        .then((ref) => {
          console.log('Add ID: ', ref.id)
          loading.value = false
        })
        .catch((error) => {
          console.log(error)
          loading.value = false
        })
    }

    const deleteProject = (id: string) => {
      loading.value = true
      db.collection(`users/${currentUser.value.uid}/projects/`).doc(id)
        .delete()
        .then((ref) => {
          console.log('del: ', ref)
          loading.value = false
        })
        .catch((error) => {
          console.log(error)
          loading.value = false
        })
    }

    const editProjectId: Ref<string | null> = ref(null)
    const editProject = (id: string) => {
      editProjectId.value = id
    }

    const saveProject = (id: string, name: string) => {
      loading.value = true
      db.collection(`users/${currentUser.value.uid}/projects/`).doc(id)
        .update({
          name
        })
        .then((ref) => {
          console.log('del: ', ref)
          editProjectId.value = null
          loading.value = false
        })
        .catch((error) => {
          console.log(error)
          loading.value = false
        })
    }

    onMounted(() => {
      loading.value = true
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
            loading.value = false
          })
        } else {
          currentUser.value = {}
          loading.value = false
        }
      })
    })

    return {
      createProject,
      deleteProject,
      editProject,
      saveProject,
      editProjectId,
      currentUser,
      projects,
      projectName,
      projectNameRules,
      loading
    }
  }
})
</script>

<style>
</style>
