<template>
  <div class="my-16">
    <h1 class="headline mb-12">
      {{ pTitle }}
    </h1>

    <v-simple-table v-if="projects.length" class="mb-8">
      <tbody>
        <tr
          v-for="(item, index) in projects"
          :key="index"
        >
          <td class="pa-4">
            <div v-if="editProjectId === item.id">
              <v-text-field
                v-model="item.name"
                :error-messages="editProjectError"
              />
              <div class="mt-4 text-right">
                <v-btn
                  depressed
                  type="button"
                  @click="editProjectId = null"
                >
                  キャンセル
                </v-btn>
                <v-btn
                  depressed
                  type="button"
                  color="primary"
                  class="ml-2"
                  :disabled="!item.name"
                  @click="handleSaveProject(item.id, item.name)"
                >
                  保存
                </v-btn>
              </div>
            </div>
            <div v-else>
              <div>
                {{ item.name }}
              </div>
              <div class="mt-4 text-right">
                <v-btn
                  depressed
                  type="button"
                  color="primary"
                  @click="handleEditProject(item.id)"
                >
                  編集
                </v-btn>
                <v-btn
                  depressed
                  type="button"
                  class="ml-2"
                  @click="handleDeleteProject(item.id)"
                >
                  削除
                </v-btn>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </v-simple-table>

    <v-form lazy-validation>
      <v-text-field
        v-model="projectName"
        label="案件名"
        required
        :error-messages="projectNameError"
      />
      <div class="mb-8">
        <v-btn
          depressed
          type="button"
          color="primary"
          :disabled="!projectName"
          @click="handleCreateProject()"
        >
          追加する
        </v-btn>
      </div>
    </v-form>
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
  props: {
    pTitle: {
      type: String,
      default: ''
    }
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

    /* 案件作成 */
    const handleCreateProject = () => {
      store.dispatch('writeLoading', true)
      db.collection(`users/${state.user.uid}/projects/`)
        .add({
          name: projectName.value
        })
        .then((ref) => {
          console.log('Add ID: ', ref.id)
          projectName.value = ''
          store.dispatch('writeLoading', false)
        })
        .catch((error) => {
          console.log(error)
          projectNameError.value = error.message
          store.dispatch('writeLoading', false)
        })
    }

    /**
     * 案件削除
     * @param  {string} id  削除する案件id
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
     * 案件編集
     * @param  {string} id  編集する案件id
     */
    const handleEditProject = (id: string) => {
      editProjectId.value = id
    }

    /**
     * 案件更新
     * @param  {string} id  編集する案件id
     * @param  {string} name  編集した案件名
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
