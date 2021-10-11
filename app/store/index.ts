import { IProject, IUser } from '../interfaces/'

// 状態管理したい要素に名前をつけて、stateとしてexportする
export const state = () => ({
  project: {
    id: '',
    name: ''
  },
  dark: true,
  user: {
    uid: '',
    email: ''
  },
  loading: false
})

// 状態を変更する処理は mutationとしてexportする
export const mutations = {
  // 状態（値）を変更する処理を定義
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
  }
}

// 実際に各コンポーネントから呼び出す処理をactionとしてexportする
export const actions = {
  writeProject (context: any, value: IProject) {
    console.log('context')
    console.log(context)
    console.log('value')
    console.log(value)
    // コミットすることで状態変更が反映される
    context.commit('setProjectFromStore', value)
  },
  writeDark (context: any, value: boolean) {
    console.log('context')
    console.log(context)
    console.log('value')
    console.log(value)
    // コミットすることで状態変更が反映される
    context.commit('setDarkFromStore', value)
  },
  writeUser (context: any, value: IUser) {
    console.log('context')
    console.log(context)
    console.log('value')
    console.log(value)
    // コミットすることで状態変更が反映される
    context.commit('setUserFromStore', value)
  },
  writeLoading (context: any, value: boolean) {
    console.log('context')
    console.log(context)
    console.log('value')
    console.log(value)
    // コミットすることで状態変更が反映される
    context.commit('setLoadingFromStore', value)
  }
}
