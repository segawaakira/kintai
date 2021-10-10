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
    <Confirm ref="confirmRef" />
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, Ref, ref, useStore } from '@nuxtjs/composition-api'
import firebase from 'firebase'

export default defineComponent({
  setup (_props, _context) {
    const store = useStore()
    const projects: Ref<any> = ref([])
    const db = firebase.firestore()
    const projectNameRules = [
      (v: any) => !!v || 'projectName is required'
    ]
    const projectName: Ref<string> = ref('')
    const confirmRef = ref(null)

    const createProject = () => {
      store.dispatch('writeLoading', true)
      // @ts-ignore
      db.collection(`users/${store.state.user.uid}/projects/`)
        .add({
          name: projectName.value
        })
        .then((ref) => {
          console.log('Add ID: ', ref.id)
          store.dispatch('writeLoading', false)
        })
        .catch((error) => {
          console.log(error)
          store.dispatch('writeLoading', false)
        })
    }

    const deleteProject = async (id: string) => {
      if (await confirmRef.value.open('本当に削除しますか？', true)) {
        store.dispatch('writeLoading', true)
        // @ts-ignore
        db.collection(`users/${store.state.user.uid}/projects/`).doc(id)
          .delete()
          .then((ref) => {
            console.log('del: ', ref)
            store.dispatch('writeLoading', false)
          })
          .catch((error) => {
            console.log(error)
            store.dispatch('writeLoading', false)
          })
      }
    }

    const editProjectId: Ref<string | null> = ref(null)
    const editProject = (id: string) => {
      editProjectId.value = id
    }

    const saveProject = (id: string, name: string) => {
      store.dispatch('writeLoading', true)
      // @ts-ignore
      db.collection(`users/${store.state.user.uid}/projects/`).doc(id)
        .update({
          name
        })
        .then(async (ref) => {
          console.log('del: ', ref)
          editProjectId.value = null
          if (await confirmRef.value.open('保存しました', false)) {
            store.dispatch('writeLoading', false)
          }
        })
        .catch((error) => {
          console.log(error)
          store.dispatch('writeLoading', false)
        })
    }

    onMounted(() => {
      store.dispatch('writeLoading', true)
      firebase.auth().onAuthStateChanged((data) => {
        if (data) {
          // @ts-ignore
          db.collection(`users/${store.state.user.uid}/projects`).onSnapshot((docs) => {
            projects.value = []
            docs.forEach((doc) => {
              projects.value.push({
                ...doc.data(),
                id: doc.id
              })
            })
            store.dispatch('writeLoading', false)
          })
        } else {
          store.dispatch('writeLoading', false)
        }
      })
    })

    return {
      createProject,
      deleteProject,
      editProject,
      saveProject,
      editProjectId,
      projects,
      projectName,
      projectNameRules,
      confirmRef
    }
  }
})
</script>

<style>
</style>
