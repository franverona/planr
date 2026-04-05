import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Task, CreateTaskDto, UpdateTaskDto } from '../models/task.model'

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly http = inject(HttpClient)
  private readonly apiUrl = 'http://localhost:3001/tasks'

  getByProjectId(projectId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}?projectId=${projectId}`)
  }

  getById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`)
  }

  create(dto: CreateTaskDto): Observable<Task> {
    const payload: Omit<Task, 'id'> = {
      ...dto,
      createdAt: new Date().toISOString(),
    }
    return this.http.post<Task>(this.apiUrl, payload)
  }

  update(id: number, dto: UpdateTaskDto): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, dto)
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }
}
