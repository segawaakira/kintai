// 状態管理したい要素に名前をつけて、stateとしてexportする
export const state = () => ({
  project: '',
  dark: true
})

// 状態を変更する処理は mutationとしてexportする
export const mutations = {
  // 状態（値）を変更する処理を定義
  setProjectFromStore (state: any, value: any) {
    state.project = value
  },
  setDarkFromStore (state: any, value: any) {
    state.dark = value
  }
}

// 実際に各コンポーネントから呼び出す処理をactionとしてexportする
export const actions = {
  writeProject (context: any, value: any) {
    console.log('context')
    console.log(context)
    console.log('value')
    console.log(value)
    // コミットすることで状態変更が反映される
    context.commit('setProjectFromStore', value)
  },
  writeDark (context: any, value: any) {
    console.log('context')
    console.log(context)
    console.log('value')
    console.log(value)
    // コミットすることで状態変更が反映される
    context.commit('setDarkFromStore', value)
  }
}
