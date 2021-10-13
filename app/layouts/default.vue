<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      fixed
      app
      width="320"
    >
      <!-- ログイン中のメニュー -->
      <v-list v-if="state.user">
        <v-list-item>
          <v-list-item-action>
            <v-icon>account_circle</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ state.user.email }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-for="(item, i) in isLoginItems"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          to="/settings"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>settings</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>設定</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          exact
          @click="handleLogout"
        >
          <v-list-item-action>
            <v-icon>logout</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>ログアウト</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-switch
              v-model="theme"
              :prepend-icon="themeIcon"
            />
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <!-- 未ログイン中のメニュー -->
      <v-list v-else>
        <v-list-item
          v-for="(item, i) in isLogoutItems"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-switch
              v-model="theme"
              :prepend-icon="themeIcon"
            />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      fixed
      app
    >
      <v-app-bar-nav-icon v-if="!isPC" @click.stop="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
      <v-spacer />
    </v-app-bar>
    <v-main>
      <v-container>
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
        <Nuxt />
      </v-container>
    </v-main>
    <v-footer
      :absolute="!fixed"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
    <LoadingOverlay />
  </v-app>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, useStore, watch } from '@nuxtjs/composition-api'
import firebase from 'firebase'
import dayjs from 'dayjs'
import LoadingOverlay from '../components/LoadingOverlay.vue'
import { BREAK_POINT } from '../common/constants'
import { IState, IProject, IProjectItem } from '../interfaces/'

export default defineComponent({
  components: { LoadingOverlay },
  setup (_props, context: any) {
    const drawer: Ref<Boolean> = ref(false)
    const projects: Ref<IProject[]> = ref([])
    const inAttendanceTime: Ref<string> = ref('')
    const inAttendanceProject: Ref<IProject | null> = ref(null)
    const selectedProject: Ref<IProject | null> = ref(null)
    const store = useStore()
    const state: IState = store.state as IState
    const theme: Ref<boolean> = ref(true)
    const themeIcon: Ref<string> = ref('dark_mode')
    const isShowSelectedProject: Ref<boolean> = ref(true)
    const isShowInputLink: Ref<boolean> = ref(true)
    const isPC: Ref<boolean> = ref(true)

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

    /* ログアウト */
    const handleLogout = () => {
      store.dispatch('writeLoading', true)
      firebase.auth().signOut().then(() => {
        console.log('ログアウトしました')
        store.dispatch('writeUser', null)
        store.dispatch('writeProject', null)
        location.href = '/login'
        // context.root.$router.push('/login')
      }).catch((error) => {
        console.log('ログアウト失敗', error)
        store.dispatch('writeLoading', false)
      })
    }

    /* 画面幅から、PCかSPか判定 */
    const onCheckIsPC = () => {
      if (window.innerWidth < BREAK_POINT) {
        isPC.value = false
      } else {
        isPC.value = true
        drawer.value = true
      }
    }

    /* 画面幅リサイズ */
    const onResize = () => {
      window.onresize = () => {
        onCheckIsPC()
      }
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
      theme.value = state.dark
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
      onCheckIsPC()
      onResize()
    })

    /* ダークモードかライトモードか */
    watch(
      () => theme.value,
      (n, _) => {
        context.root.$vuetify.theme.dark = theme.value
        themeIcon.value = n ? 'dark_mode' : 'light_mode'
        store.dispatch('writeDark', n)
      }
    )

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
      drawer,
      fixed: false,
      isLogoutItems: [
        {
          icon: 'login',
          title: 'ログイン',
          to: '/login'
        },
        {
          icon: 'person',
          title: '会員登録',
          to: '/signup'
        }
      ],
      isLoginItems: [
        {
          icon: 'timer',
          title: '出退勤入力',
          to: '/input'
        },
        {
          icon: 'event_note',
          title: 'カレンダー',
          to: '/calendar'
        },
        {
          icon: 'view_list',
          title: 'プロジェクト',
          to: '/projects'
        }
      ],
      title: 'Vuetify.js',
      selectedProject,
      projects,
      inAttendanceTime,
      inAttendanceProject,
      handleChangeProject,
      state,
      theme,
      themeIcon,
      handleLogout,
      isShowSelectedProject,
      isShowInputLink,
      isPC,
      dayjs
    }
  }
})
</script>

<style lang="scss">
@import '../assets/form.scss';
</style>
