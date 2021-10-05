<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
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
      :clipped-left="clipped"
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
    const themeIcon: Ref<string> = ref('mdi-weather-night')

    // @ts-ignore
    // console.log(store.state.project)

    const onChangeProject = (e: any) => {
      store.dispatch('writeProject', e)
      // @ts-ignore
      // console.log(store.state.project)
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
        themeIcon.value = n ? 'mdi-weather-night' : 'mdi-weather-sunny'
        store.dispatch('writeDark', n)
      }
    )

    return {
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'signup',
          to: '/signup',
          isLogin: false
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'login',
          to: '/login',
          isLogin: false
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'input',
          to: '/input',
          isLogin: true
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'calendar',
          to: '/calendar',
          isLogin: true
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'projects',
          to: '/projects',
          isLogin: true
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
      themeIcon
    }
  }
})
</script>
