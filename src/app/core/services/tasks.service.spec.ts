import { TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TasksService } from './tasks.service'
import { Task, CreateTaskDto } from '../models/task.model'

describe('TasksService', () => {
  let service: TasksService
  let httpTesting: HttpTestingController
  const API = 'http://localhost:3001/tasks'

  const mockTask: Task = {
    id: 't1',
    projectId: 'p1',
    title: 'Do something',
    description: '',
    status: 'todo',
    priority: 'medium',
    createdAt: '2024-01-01T00:00:00.000Z',
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    })
    service = TestBed.inject(TasksService)
    httpTesting = TestBed.inject(HttpTestingController)
  })

  afterEach(() => httpTesting.verify())

  it('getByProjectId() makes a GET request with the projectId query param', () => {
    service.getByProjectId('p1').subscribe()
    const req = httpTesting.expectOne(`${API}?projectId=p1`)
    expect(req.request.method).toBe('GET')
    req.flush([mockTask])
  })

  it('getById() makes a GET request to /tasks/:id', () => {
    service.getById('t1').subscribe()
    const req = httpTesting.expectOne(`${API}/t1`)
    expect(req.request.method).toBe('GET')
    req.flush(mockTask)
  })

  it('create() POSTs to /tasks with a createdAt timestamp', () => {
    const dto: CreateTaskDto = {
      projectId: 'p1',
      title: 'Task',
      description: '',
      status: 'todo',
      priority: 'low',
    }
    service.create(dto).subscribe()
    const req = httpTesting.expectOne(API)
    expect(req.request.method).toBe('POST')
    expect(req.request.body.title).toBe('Task')
    expect(req.request.body.createdAt).toBeDefined()
    req.flush(mockTask)
  })

  it('update() makes a PATCH request to /tasks/:id', () => {
    service.update('t1', { status: 'done' }).subscribe()
    const req = httpTesting.expectOne(`${API}/t1`)
    expect(req.request.method).toBe('PATCH')
    req.flush(mockTask)
  })

  it('delete() makes a DELETE request to /tasks/:id', () => {
    service.delete('t1').subscribe()
    const req = httpTesting.expectOne(`${API}/t1`)
    expect(req.request.method).toBe('DELETE')
    req.flush(null)
  })
})
