import createPersistedState from 'vuex-persistedstate'

export default ({ store }) => {
  createPersistedState({
    key: 'Vuex',
    paths: [
      'project',
      'dark',
      'user'
    ]
  })(store)
}
