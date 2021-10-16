/**
 * 案件情報
 */

export interface IProject {
  id: string
  name: string
  /* ▽ in_attendance_projectに保存されている出勤中の案件情報の場合のみ必要 */
  item_id?: string
}
