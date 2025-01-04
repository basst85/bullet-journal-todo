export type TaskType = 'task' | 'deadline' | 'event' | 'idea' | 'important' | 'note'

export interface TaskItem {
  id: string
  content: string
  isDone: boolean
  type: TaskType
  subTasks: TaskItem[]
  isSubTask: boolean
  archived: boolean
}

