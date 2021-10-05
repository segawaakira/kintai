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
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-btn
        icon
        @click.stop="miniVariant = !miniVariant"
      >
        <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="clipped = !clipped"
      >
        <v-icon>mdi-application</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="fixed = !fixed"
      >
        <v-icon>mdi-minus</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-btn
        icon
        @click.stop="rightDrawer = !rightDrawer"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      {{ store.state.project }}
      <v-select
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
        <v-btn
          color="primary"
          nuxt
          to="/signup"
        >
          signup
        </v-btn>
        <v-btn
          color="primary"
          nuxt
          to="/login"
        >
          login
        </v-btn>
        <v-btn
          color="primary"
          nuxt
          to="/input"
        >
          input
        </v-btn>
        <v-btn
          color="primary"
          nuxt
          to="/calendar"
        >
          calendar
        </v-btn>
        <v-btn
          color="primary"
          nuxt
          to="/detail"
        >
          detail
        </v-btn>
        <v-btn
          color="primary"
          nuxt
          to="/projects"
        >
          projects
        </v-btn>
        <hr>
        <Nuxt />
      </v-container>
    </v-main>
    <v-navigation-drawer
      v-model="rightDrawer"
      :right="right"
      temporary
      fixed
    >
      <v-list>
        <v-list-item @click.native="right = !right">
          <v-list-item-action>
            <v-icon light>
              mdi-repeat
            </v-icon>
          </v-list-item-action>
          <v-list-item-title>Switch drawer (click me)</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-footer
      :absolute="!fixed"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, useStore } from '@nuxtjs/composition-api'
import firebase from 'firebase'

export default defineComponent({
  setup (_props, _context) {
    const projects: Ref<any> = ref([])
    const currentUser: Ref<any> = ref(null)
    const store = useStore()

    // @ts-ignore
    // console.log(store.state.project)

    const onChangeProject = (e: any) => {
      store.dispatch('writeProject', e)
      // @ts-ignore
      // console.log(store.state.project)
    }

    onMounted(() => {
      firebase.auth().onAuthStateChanged((data) => {
        if (data) {
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

    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/'
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Inspire',
          to: '/inspire'
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Vuetify.js',
      projects,
      currentUser,
      onChangeProject,
      store
    }
  }
})
</script>
