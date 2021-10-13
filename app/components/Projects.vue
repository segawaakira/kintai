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
              label="プロジェクト名"
              required
              :error-messages="projectNameError"
            />
          </v-col>
        </v-row>
        <v-btn
          type="button"
          :disabled="!projectName"
          @click="handleCreateProject()"
        >
          handleCreateProject
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
            <v-text-field
              v-model="item.name"
              :error-messages="editProjectError"
            />
            <v-btn
              type="button"
              @click="editProjectId = null"
            >
              CANCEL
            </v-btn>
            <v-btn
              type="button"
              :disabled="!item.name"
              @click="handleSaveProject(item.id, item.name)"
            >
              handleSaveProject
            </v-btn>
          </div>
          <div v-else>
            {{ item.name }}
            <v-btn
              type="button"
              @click="handleEditProject(item.id)"
            >
              handleEditProject
            </v-btn>
            <v-btn
              type="button"
              @click="handleDeleteProject(item.id)"
            >
              handleDeleteProject
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
import { IState, IProject } from '../interfaces/'
import Confirm from './common/Confirm.vue'

export default defineComponent({
  components: {
    Confirm
  },
  setup (_props, _context) {
    const store = useStore()
    const state: IState = store.state as IState
    const projects: Ref<IProject[]> = ref([])
    const db = firebase.firestore()
    const projectName: Ref<string> = ref('')
    const projectNameError: Ref<string> = ref('')
    const editProjectId: Ref<string | null> = ref(null)
    const editProjectError: Ref<string> = ref('')
    const confirmRef: Ref<any> = ref()

    /* プロジェクト作成 */
    const handleCreateProject = () => {
      store.dispatch('writeLoading', true)
      db.collection(`users/${state.user.uid}/projects/`)
        .add({
          name: projectName.value
        })
        .then((ref) => {
          console.log('Add ID: ', ref.id)
          store.dispatch('writeLoading', false)
        })
        .catch((error) => {
          console.log(error)
          projectNameError.value = error.message
          store.dispatch('writeLoading', false)
        })
    }

    /**
     * プロジェクト削除
     * @param  {string} id  削除するプロジェクトid
     */
    const handleDeleteProject = async (id: string) => {
      if (await confirmRef.value.open('本当に削除しますか？', true)) {
        store.dispatch('writeLoading', true)
        db.collection(`users/${state.user.uid}/projects/`).doc(id)
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

    /**
     * プロジェクト編集
     * @param  {string} id  編集するプロジェクトid
     */
    const handleEditProject = (id: string) => {
      editProjectId.value = id
    }

    /**
     * プロジェクト更新
     * @param  {string} id  編集するプロジェクトid
     * @param  {string} name  編集したプロジェクト名
     */
    const handleSaveProject = (id: string, name: string) => {
      store.dispatch('writeLoading', true)
      db.collection(`users/${state.user.uid}/projects/`).doc(id)
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
          editProjectError.value = error.message
          store.dispatch('writeLoading', false)
        })
    }

    onMounted(() => {
      store.dispatch('writeLoading', true)
      firebase.auth().onAuthStateChanged((data) => {
        if (data) {
          db.collection(`users/${state.user.uid}/projects`).onSnapshot((docs) => {
            projects.value = []
            docs.forEach((doc) => {
              projects.value.push({
                ...doc.data() as IProject,
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
      handleCreateProject,
      handleDeleteProject,
      handleEditProject,
      handleSaveProject,
      editProjectId,
      editProjectError,
      projects,
      projectName,
      projectNameError,
      confirmRef
    }
  }
})
</script>

<style>
</style>
