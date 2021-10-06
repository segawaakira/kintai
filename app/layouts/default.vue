<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      fixed
      app
    >
      <!-- ログイン中のメニュー -->
      <v-list v-if="isSignedIn">
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
          @click="signOut"
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
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
      <v-spacer />
    </v-app-bar>
    <v-main>
      <v-select
        v-model="selectedProject"
        :items="projects"
        filled
        label="Select project"
        item-text="name"
        item-value="id"
        return-object
        @change="onChangeProject"
      />
      <hr>

      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <v-footer
      :absolute="!fixed"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, useStore, watch } from '@nuxtjs/composition-api'
import firebase from 'firebase'

export default defineComponent({
  setup (_props, context: any) {
    const isSignedIn: Ref<Boolean> = ref(false)
    const projects: Ref<any> = ref([])
    const selectedProject: Ref<any> = ref({})
    const currentUser: Ref<any> = ref(null)
    const store = useStore()
    const theme: Ref<boolean> = ref(true)
    const themeIcon: Ref<string> = ref('dark_mode')

    // @ts-ignore
    // console.log(store.state.project)

    const onChangeProject = (e: any) => {
      store.dispatch('writeProject', e)
      // @ts-ignore
      // console.log(store.state.project)
    }

    const signOut = () => {
      firebase.auth().signOut().then(() => {
        console.log('ログアウトしました')
        // Todo:location.hrefでなく、Nuxtでの書き方あればそれにする
        location.href = '/login'
      }).catch((error) => {
        console.log('ログアウト失敗', error)
      })
    }

    onMounted(() => {
      // @ts-ignore
      theme.value = store.state.dark
      // @ts-ignore
      selectedProject.value = store.state.project
      firebase.auth().onAuthStateChanged((data) => {
        if (data) {
          isSignedIn.value = true
          currentUser.value = firebase.auth().currentUser
          const db = firebase.firestore()

          db.collection(`users/${currentUser.value.uid}/projects`).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
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

    watch(
      () => theme.value,
      (n, _) => {
        context.root.$vuetify.theme.dark = theme.value
        themeIcon.value = n ? 'dark_mode' : 'light_mode'
        store.dispatch('writeDark', n)
      }
    )

    return {
      drawer: false,
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
      isSignedIn,
      selectedProject,
      projects,
      currentUser,
      onChangeProject,
      store,
      theme,
      themeIcon,
      signOut
    }
  }
})
</script>
