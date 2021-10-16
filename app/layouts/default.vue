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
      flat
      class="header-bar"
    >
      <v-app-bar-nav-icon v-if="!isPC" class="header-btn" @click.stop="drawer = !drawer" />
      <v-toolbar-title class="pl-0">
        <div class="d-flex align-center">
          <img src="logo_text.svg" height="28" class="mr-2" />
        </div>
      </v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container style="max-width: 960px;">
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
import LoadingOverlay from '../components/common/LoadingOverlay.vue'
import { BREAK_POINT } from '../common/constants'
import { IState } from '../interfaces/'

export default defineComponent({
  components: { LoadingOverlay },
  setup (_props, context: any) {
    const drawer: Ref<Boolean> = ref(false)
    const store = useStore()
    const state: IState = store.state as IState
    const theme: Ref<boolean> = ref(true)
    const themeIcon: Ref<string> = ref('dark_mode')
    const isPC: Ref<boolean> = ref(true)

    /* ログアウト */
    const handleLogout = () => {
      store.dispatch('writeLoading', true)
      firebase.auth().signOut().then(() => {
        console.log('ログアウトしました')
        store.dispatch('writeDefaultState')
        location.href = '/login'
        // context.root.$router.push('/login')
      }).catch((error) => {
        console.log('ログアウト失敗', error)
        store.dispatch('writeLoading', false)
      })
    }

    /* ログインしないと見れないページの場合loginにリダイレクト */
    const onCheckIsLogined = () => {
      if (!state.user) {
        switch (context.root.$route.path) {
          case '/input':
          case '/projects':
          case '/calendar':
          case '/detail':
          case '/settings':
            location.href = '/login'
            break
          default:
            break
        }
      }
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

    onMounted(() => {
      onCheckIsLogined()
      theme.value = state.dark
      onCheckIsPC()
      onResize()
    })

    /* ダークモードかライトモードか */
    watch(
      () => theme.value,
      (n, _o) => {
        context.root.$vuetify.theme.dark = theme.value
        themeIcon.value = n ? 'dark_mode' : 'light_mode'
        store.dispatch('writeDark', n)
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
          title: '案件一覧',
          to: '/projects'
        },
        {
          icon: 'settings',
          title: '設定',
          to: '/settings'
        }
      ],
      title: 'WORKLOG',
      state,
      theme,
      themeIcon,
      handleLogout,
      isPC
    }
  }
})
</script>

<style lang="scss">
@import '../assets/form.scss';
.header-btn {
  position: absolute;
  left: 16px;
}
@media (max-width: $break-point) {
  .header-bar {
    > .v-toolbar__content {
      justify-content: center;
    }
  }
}
</style>
