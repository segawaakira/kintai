module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended'
  ],
  plugins: [
  ],
  // add your custom rules here
  rules: {
    'no-new': 'off',
    'quote-props': 'off',
    'camelcase': 'off',
    'promise/param-names': 'off'
  }
}
