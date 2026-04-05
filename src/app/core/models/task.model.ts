export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: number
  projectId: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  createdAt: string
}

export interface CreateTaskDto {
  projectId: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
}

export type UpdateTaskDto = Partial<Omit<CreateTaskDto, 'projectId'>>
