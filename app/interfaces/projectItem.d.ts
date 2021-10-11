/**
 * 出退勤情報
 */

/* Firestoreから取得したTimestamp型も配慮
 * TODO:anyじゃなくてunionで、以下にしたいけどうまくいかなった。
 * {
 *   seconds: number
 *   nanoseconds: number
 * }
*/
type Timestamp = Date | any

export interface IProjectItem {
  start: Timestamp
  start_place_name: string
  start_place_lat: number
  start_place_lng: number
  end: Timestamp
  end_place_name: string
  end_place_lat: number
  end_place_lng: number
  description: string
  /* ▽ add以外の場合のみ必要 */
  id?: string
  /* ▽ in_attendanceに保存されている出勤中の情報の場合のみ必要 */
  item_id?: string
}
