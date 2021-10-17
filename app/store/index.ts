import { IProject, IUser } from '../interfaces/'

const defaultState = {
  project: null,
  dark: true,
  user: null,
  loading: false
}

export const state = () => (defaultState)

export const mutations = {
  setProjectFromStore (state: any, value: IProject) {
    state.project = value
  },
  setDarkFromStore (state: any, value: boolean) {
    state.dark = value
  },
  setUserFromStore (state: any, value: IUser) {
    state.user = value
  },
  setLoadingFromStore (state: any, value: boolean) {
    state.loading = value
  },
  setDefaultState (state: any) {
    state.project = defaultState.project
    state.dark = defaultState.dark
    state.user = defaultState.user
    state.loading = defaultState.loading
    // console.log(state)
  }
}

// 各コンポーネントから呼び出す処理をactionとしてexport
export const actions = {
  writeProject (context: any, value: IProject) {
    // console.log(value)
    context.commit('setProjectFromStore', value)
  },
  writeDark (context: any, value: boolean) {
    // console.log(value)
    context.commit('setDarkFromStore', value)
  },
  writeUser (context: any, value: IUser) {
    // console.log(value)
    context.commit('setUserFromStore', value)
  },
  writeLoading (context: any, value: boolean) {
    // console.log(value)
    context.commit('setLoadingFromStore', value)
  },
  // 全てのstateをdefaultに戻す
  writeDefaultState (context: any) {
    context.commit('setDefaultState')
  }
}
