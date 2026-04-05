export type ProjectStatus = 'active' | 'archived'

export interface Project {
  id: number
  name: string
  description: string
  status: ProjectStatus
  createdAt: string
}

export interface CreateProjectDto {
  name: string
  description: string
  status: ProjectStatus
}

export type UpdateProjectDto = Partial<CreateProjectDto>
