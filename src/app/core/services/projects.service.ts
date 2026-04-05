import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Project, CreateProjectDto, UpdateProjectDto } from '../models/project.model'

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly http = inject(HttpClient)
  private readonly apiUrl = 'http://localhost:3001/projects'

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl)
  }

  getById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`)
  }

  create(dto: CreateProjectDto): Observable<Project> {
    const payload: Omit<Project, 'id'> = {
      ...dto,
      createdAt: new Date().toISOString(),
    }
    return this.http.post<Project>(this.apiUrl, payload)
  }

  update(id: number, dto: UpdateProjectDto): Observable<Project> {
    return this.http.patch<Project>(`${this.apiUrl}/${id}`, dto)
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }
}
