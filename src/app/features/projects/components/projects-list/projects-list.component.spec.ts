import { ComponentFixture, TestBed } from '@angular/core/testing'
import { of } from 'rxjs'
import { provideRouter } from '@angular/router'
import { ProjectsListComponent } from './projects-list.component'
import { ProjectsService } from '@core/services/projects.service'
import { TasksService } from '@core/services/tasks.service'
import { NotificationService } from '@core/services/notification.service'
import { Project, CreateProjectDto } from '@core/models/project.model'

function makeProject(partial: Partial<Project> = {}): Project {
  return {
    id: 'p1',
    name: 'Project 1',
    description: 'desc',
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
    ...partial,
  }
}

describe('ProjectsListComponent', () => {
  let fixture: ComponentFixture<ProjectsListComponent>
  let component: ProjectsListComponent
  let projectsService: jasmine.SpyObj<ProjectsService>
  let tasksService: jasmine.SpyObj<TasksService>
  let notifications: jasmine.SpyObj<NotificationService>

  beforeEach(async () => {
    projectsService = jasmine.createSpyObj('ProjectsService', ['getAll', 'create'])
    tasksService = jasmine.createSpyObj('TasksService', ['getByProjectId'])
    notifications = jasmine.createSpyObj('NotificationService', ['showToast'])

    projectsService.getAll.and.returnValue(of([]))
    tasksService.getByProjectId.and.returnValue(of([]))

    await TestBed.configureTestingModule({
      imports: [ProjectsListComponent],
      providers: [
        { provide: ProjectsService, useValue: projectsService },
        { provide: TasksService, useValue: tasksService },
        { provide: NotificationService, useValue: notifications },
        provideRouter([]),
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(ProjectsListComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  describe('filteredProjects', () => {
    it('returns all projects when the filter is "all"', () => {
      component.projects.set([
        makeProject({ id: 'p1', status: 'active' }),
        makeProject({ id: 'p2', status: 'archived' }),
      ])
      expect(component.filteredProjects().length).toBe(2)
    })

    it('returns only active projects when filter is "active"', () => {
      component.projects.set([
        makeProject({ id: 'p1', status: 'active' }),
        makeProject({ id: 'p2', status: 'archived' }),
      ])
      component.activeFilter.set('active')
      const result = component.filteredProjects()
      expect(result.length).toBe(1)
      expect(result[0].status).toBe('active')
    })

    it('returns only archived projects when filter is "archived"', () => {
      component.projects.set([
        makeProject({ id: 'p1', status: 'active' }),
        makeProject({ id: 'p2', status: 'archived' }),
      ])
      component.activeFilter.set('archived')
      const result = component.filteredProjects()
      expect(result.length).toBe(1)
      expect(result[0].status).toBe('archived')
    })
  })

  describe('onProjectSaved', () => {
    it('prepends the new project to the list', () => {
      component.projects.set([makeProject({ id: 'existing' })])
      const created = makeProject({ id: 'new' })
      projectsService.create.and.returnValue(of(created))

      const dto: CreateProjectDto = { name: 'New', description: '', status: 'active' }
      component.onProjectSaved(dto)

      expect(component.projects()[0].id).toBe('new')
      expect(component.projects()[1].id).toBe('existing')
    })

    it('shows a success toast after creation', () => {
      projectsService.create.and.returnValue(of(makeProject({ id: 'new' })))
      component.onProjectSaved({ name: 'New', description: '', status: 'active' })
      expect(notifications.showToast).toHaveBeenCalledWith('Project created', 'success')
    })

    it('closes the form after creation', () => {
      component.showForm.set(true)
      projectsService.create.and.returnValue(of(makeProject({ id: 'new' })))
      component.onProjectSaved({ name: 'New', description: '', status: 'active' })
      expect(component.showForm()).toBeFalse()
    })

    it('resets isSubmitting after creation', () => {
      projectsService.create.and.returnValue(of(makeProject({ id: 'new' })))
      component.onProjectSaved({ name: 'New', description: '', status: 'active' })
      expect(component.isSubmitting()).toBeFalse()
    })
  })
})
