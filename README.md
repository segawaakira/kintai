# WORKLOG

## デモサイト
https://kintai-4b623.web.app/login/

## 概要
### 何をするアプリか
- いつどこで稼働したのかを記録できます。
- 入力したデータをもとに、月別稼働実績のエクセルを生成できます。

### どんな人向けか
- すき間時間に副業している正社員やギグワーカー。
- 納品ベースで報酬を得ているけど、何に何時間かかっているのか把握したいフリーランスや自営業者。

### なんでこれを作ったか
- 副業・兼業のブームにより、すき間時間を活用して働くことが増えてきていて、日別に休憩1hを入力する想定の従来のフォーマットでは、管理しづらい。
- 働く場所に関しても、出社・リモートワーク・ワーケーションなど多様なため、場所も併せて記録できるようにしたい。

## 使用技術
- Firebase
	- Authentication
	- Firestore Database
	- Hosting
- Google Maps API
- Nuxt.js
- Vuetify
- TypeScript
