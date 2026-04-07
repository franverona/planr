import { TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { ProjectsService } from './projects.service'
import { Project, CreateProjectDto } from '../models/project.model'

describe('ProjectsService', () => {
  let service: ProjectsService
  let httpTesting: HttpTestingController
  const API = 'http://localhost:3001/projects'

  const mockProject: Project = {
    id: '1',
    name: 'Test Project',
    description: 'desc',
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    })
    service = TestBed.inject(ProjectsService)
    httpTesting = TestBed.inject(HttpTestingController)
  })

  afterEach(() => httpTesting.verify())

  it('getAll() makes a GET request to /projects', () => {
    service.getAll().subscribe()
    const req = httpTesting.expectOne(API)
    expect(req.request.method).toBe('GET')
    req.flush([mockProject])
  })

  it('getById() makes a GET request to /projects/:id', () => {
    service.getById('1').subscribe()
    const req = httpTesting.expectOne(`${API}/1`)
    expect(req.request.method).toBe('GET')
    req.flush(mockProject)
  })

  it('create() POSTs to /projects with a createdAt timestamp', () => {
    const dto: CreateProjectDto = { name: 'New', description: 'desc', status: 'active' }
    service.create(dto).subscribe()
    const req = httpTesting.expectOne(API)
    expect(req.request.method).toBe('POST')
    expect(req.request.body.name).toBe('New')
    expect(req.request.body.createdAt).toBeDefined()
    req.flush(mockProject)
  })

  it('update() makes a PATCH request to /projects/:id', () => {
    service.update('1', { name: 'Updated' }).subscribe()
    const req = httpTesting.expectOne(`${API}/1`)
    expect(req.request.method).toBe('PATCH')
    req.flush(mockProject)
  })

  it('delete() makes a DELETE request to /projects/:id', () => {
    service.delete('1').subscribe()
    const req = httpTesting.expectOne(`${API}/1`)
    expect(req.request.method).toBe('DELETE')
    req.flush(null)
  })
})
