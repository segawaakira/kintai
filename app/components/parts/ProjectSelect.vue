<template>
  <div>
    <!-- プロジェクト選択メニュー -->
    <v-select
      v-if="state.user && isShowSelectedProject"
      v-model="selectedProject"
      :items="projects"
      filled
      label="Select project"
      item-text="name"
      item-value="id"
      return-object
      @change="handleChangeProject"
    />
    <v-alert
      v-if="state.user && isShowSelectedProject && inAttendanceTime"
      dense
      type="info"
    >
      {{ inAttendanceProject.name }}で{{ inAttendanceTime }}〜稼働中。
      <nuxt-link v-if="isShowInputLink" to="/input">
        退勤はこちらから
      </nuxt-link>
    </v-alert>
    <Confirm ref="confirmRef" />
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, Ref, ref, watch, useStore } from '@nuxtjs/composition-api'
import firebase from 'firebase'
import dayjs from 'dayjs'
import { IProject, IProjectItem, IState } from '../../interfaces/'
import Confirm from '../common/Confirm.vue'

export default defineComponent({
  components: {
    Confirm
  },
  setup (_props, context) {
    const store = useStore()
    const state: IState = store.state as IState
    const projects: Ref<IProject[]> = ref([])
    const inAttendanceTime: Ref<string> = ref('')
    const inAttendanceProject: Ref<IProject | null> = ref(null)
    const selectedProject: Ref<IProject | null> = ref(null)
    const isShowSelectedProject: Ref<boolean> = ref(true)
    const isShowInputLink: Ref<boolean> = ref(true)

    const db = firebase.firestore()

    /**
     * プロジェクト変更
     * @param  {IProject} project  選択したプロジェクト
     */
    const handleChangeProject = (project: IProject) => {
      store.dispatch('writeProject', project)
      onCheckInAttendanceProject()
      onCheckInAttendance()
    }

    /* 稼働中のプロジェクト情報を取得する */
    const onCheckInAttendanceProject = () => {
      // in_attendanceから稼働情報を取得する
      db.collection(`users/${state.user.uid}/in_attendance_project`).onSnapshot((docs) => {
        const inAttendanceProjectArray: IProject[] = []
        docs.forEach((doc) => {
          inAttendanceProjectArray.push({
            ...doc.data() as IProject,
            id: doc.id
          })
        })
        if (inAttendanceProjectArray.length) {
          inAttendanceProject.value = inAttendanceProjectArray[0]
        }
      })
    }

    /* 稼働中の情報を取得する */
    const onCheckInAttendance = () => {
      // in_attendanceから稼働情報を取得する
      db.collection(`users/${state.user.uid}/projects/${state.project.id}/in_attendance`).onSnapshot((docs) => {
        const inAttendanceArray: IProjectItem[] = []
        inAttendanceTime.value = ''
        docs.forEach((doc) => {
          inAttendanceArray.push({
            ...doc.data() as IProjectItem,
            id: doc.id
          })
        })
        if (inAttendanceArray.length) {
          const start = new Date(inAttendanceArray[0].start.seconds * 1000)
          inAttendanceTime.value = dayjs(start).format('MM月DD日 HH:MM')
          isShowInputLink.value = false
        }
      })
    }

    onMounted(() => {
      selectedProject.value = state.project
      firebase.auth().onAuthStateChanged((data) => {
        if (data) {
          db.collection(`users/${state.user.uid}/projects`).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              projects.value.push({
                ...doc.data() as IProject,
                id: doc.id
              })
            })
          })
          onCheckInAttendanceProject()
          onCheckInAttendance()
        } else {
          // TODO: ログインしてない時の処理
        }
      })
    })

    /* 画面によって要素の出しわけ */
    watch(
      () => context.root.$route.path,
      (n, _) => {
        if (n === '/settings') {
          isShowSelectedProject.value = false
        } else {
          isShowSelectedProject.value = true
        }
        if (n === '/input') {
          isShowInputLink.value = false
        } else {
          isShowInputLink.value = true
        }
      }
    )

    return {
      state,
      selectedProject,
      projects,
      inAttendanceTime,
      inAttendanceProject,
      handleChangeProject,
      isShowSelectedProject,
      isShowInputLink,
      dayjs
    }
  }
})
</script>
