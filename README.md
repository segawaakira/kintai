# WORKLOG

## デモサイト
https://kintai-4b623.web.app/login/

※出退勤入力画面で、`google.maps.GeocoderStatus is not OK. due to REQUEST_DENIED`とアラートが出ますが、テスト用のAPIキーによるものです。

---

### 概要

#### 何をするアプリか
- いつどこで稼働したのかを記録できます。
- 入力したデータをもとに、月別稼働実績のエクセルを生成できます。

#### どんな人向けか
- すき間時間に副業している正社員やギグワーカー。
- 納品ベースで報酬を得ているけど、何に何時間かかっているのか把握したいフリーランスや自営業者。

#### なんでこれを作ったか
- 副業・兼業のブームにより、すき間時間を活用して働くことが増えてきていて、日別に休憩1hを入力する想定の従来のフォーマットでは、管理しづらい。
- 働く場所に関しても、出社・リモートワーク・ワーケーションなど多様なため、場所も併せて記録できるようにしたい。

---

### 使用技術
- Firebase
	- Authentication
	- Firestore Database
	- Hosting
- Google Maps API
- Nuxt.js
- Vuetify
- TypeScript

---

### スクリーンショット

##### 想定：正社員で、土日や隙間時間を利用して副業をしているWebデザイナー

- 出退勤入力
  ![1](https://user-images.githubusercontent.com/25876135/137626976-c99cb420-8dae-4a50-bc77-e93f6557e847.png)
  通常のタイムカード（出退勤のみ）に加えて、どこで何をやったかを記録できます。場所は自動で現在地を取得します。

- カレンダー
  ![2](https://user-images.githubusercontent.com/25876135/137627025-9a105663-51aa-4537-972b-ef807da4b4f0.png)
  月次でいつ何時間稼働したかを確認できます。

- 稼働詳細
  ![3](https://user-images.githubusercontent.com/25876135/137627069-67721823-e30e-424e-9174-f1a670c8a3c8.png)
  カレンダーのタイムラインをクリックするとその時間どこで何をやったか確認可能で、編集や削除も可能です。

- 月別稼働実績のエクセル
  <img width="1400" alt="スクリーンショット 2021-10-17 21 16 26" src="https://user-images.githubusercontent.com/25876135/137627104-179fbf92-21f6-4592-b7a2-e11005658bd8.png">
  カレンダーから、表示中の月の稼働実績エクセルをエクスポートできます。

- 案件一覧
  ![4](https://user-images.githubusercontent.com/25876135/137627445-cfb722ff-f671-4333-b2f1-68be38ccce02.png)
  案件は複数登録可能です。

