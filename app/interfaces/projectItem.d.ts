/**
 * 出退勤情報
 */

export interface IProjectItem {
  start: Date
  start_place_name: string
  start_place_lat: number
  start_place_lng: number
  end: Date
  end_place_name: string
  end_place_lat: number
  end_place_lng: number
  description: string
  /* ▽ add以外の場合のみ必要 */
  id?: string
  /* ▽ in_attendanceに保存されている出勤中の情報の場合のみ必要 */
  item_id?: string
}
