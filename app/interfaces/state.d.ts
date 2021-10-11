/**
 * store.state
 */
import { IProject } from './project'
import { IUser } from './user'

export interface IState {
  project: IProject
  dark: boolean
  user: IUser
  loading: boolean
}
