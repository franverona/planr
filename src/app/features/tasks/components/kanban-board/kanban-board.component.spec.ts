import { ComponentFixture, TestBed } from '@angular/core/testing'
import { of, throwError } from 'rxjs'
import { CdkDragDrop } from '@angular/cdk/drag-drop'
import { KanbanBoardComponent } from './kanban-board.component'
import { TasksService } from '@core/services/tasks.service'
import { NotificationService } from '@core/services/notification.service'
import { Task } from '@core/models/task.model'

function makeTask(partial: Partial<Task> = {}): Task {
  return {
    id: 't1',
    projectId: 'p1',
    title: 'Test Task',
    description: '',
    status: 'todo',
    priority: 'medium',
    createdAt: '2024-01-01T00:00:00.000Z',
    ...partial,
  }
}

describe('KanbanBoardComponent', () => {
  let fixture: ComponentFixture<KanbanBoardComponent>
  let component: KanbanBoardComponent
  let tasksService: jasmine.SpyObj<TasksService>
  let notifications: jasmine.SpyObj<NotificationService>

  beforeEach(async () => {
    tasksService = jasmine.createSpyObj('TasksService', ['update', 'create', 'delete'])
    notifications = jasmine.createSpyObj('NotificationService', ['showToast', 'setError'])

    await TestBed.configureTestingModule({
      imports: [KanbanBoardComponent],
      providers: [
        { provide: TasksService, useValue: tasksService },
        { provide: NotificationService, useValue: notifications },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(KanbanBoardComponent)
    component = fixture.componentInstance
    fixture.componentRef.setInput('projectId', 'p1')
    fixture.componentRef.setInput('tasks', [])
    fixture.detectChanges()
  })

  describe('tasksByStatus', () => {
    it('groups input tasks by status', () => {
      fixture.componentRef.setInput('tasks', [
        makeTask({ id: 't1', status: 'todo' }),
        makeTask({ id: 't2', status: 'in-progress' }),
        makeTask({ id: 't3', status: 'done' }),
      ])

      const grouped = component.tasksByStatus()
      expect(grouped['todo'].length).toBe(1)
      expect(grouped['in-progress'].length).toBe(1)
      expect(grouped['done'].length).toBe(1)
    })

    it('prefers localTasks over input tasks when localTasks is non-empty', () => {
      fixture.componentRef.setInput('tasks', [makeTask({ id: 't1', status: 'todo' })])
      component.localTasks.set([makeTask({ id: 't2', status: 'done' })])

      const grouped = component.tasksByStatus()
      expect(grouped['todo'].length).toBe(0)
      expect(grouped['done'].length).toBe(1)
    })
  })

  describe('onDrop', () => {
    it('ignores drops within the same container', () => {
      const col = { data: [makeTask()] }
      const event = {
        previousContainer: col,
        container: col,
        previousIndex: 0,
      } as unknown as CdkDragDrop<Task[]>
      component.onDrop(event, 'todo')
      expect(tasksService.update).not.toHaveBeenCalled()
    })

    it('optimistically updates the task status', () => {
      const task = makeTask({ id: 't1', status: 'todo' })
      fixture.componentRef.setInput('tasks', [task])
      tasksService.update.and.returnValue(of({ ...task, status: 'done' }))

      const event = {
        previousContainer: { data: [task] },
        container: { data: [] },
        previousIndex: 0,
      } as unknown as CdkDragDrop<Task[]>
      component.onDrop(event, 'done')

      expect(component.localTasks()[0].status).toBe('done')
      expect(tasksService.update).toHaveBeenCalledWith('t1', { status: 'done' })
    })

    it('rolls back the optimistic update on error', () => {
      const task = makeTask({ id: 't1', status: 'todo' })
      fixture.componentRef.setInput('tasks', [task])
      tasksService.update.and.returnValue(throwError(() => new Error('fail')))

      const event = {
        previousContainer: { data: [task] },
        container: { data: [] },
        previousIndex: 0,
      } as unknown as CdkDragDrop<Task[]>
      component.onDrop(event, 'done')

      expect(component.localTasks()[0].status).toBe('todo')
    })
  })

  describe('onDeleteTask', () => {
    it('optimistically removes the task from the list', () => {
      fixture.componentRef.setInput('tasks', [makeTask({ id: 't1' })])
      tasksService.delete.and.returnValue(of(undefined))

      component.onDeleteTask('t1')

      expect(component.localTasks().find((t) => t.id === 't1')).toBeUndefined()
    })

    it('shows a success toast after deletion', () => {
      fixture.componentRef.setInput('tasks', [makeTask({ id: 't1' })])
      tasksService.delete.and.returnValue(of(undefined))

      component.onDeleteTask('t1')

      expect(notifications.showToast).toHaveBeenCalledWith('Task deleted', 'success')
    })

    it('rolls back the optimistic removal on error', () => {
      const task = makeTask({ id: 't1' })
      fixture.componentRef.setInput('tasks', [task])
      tasksService.delete.and.returnValue(throwError(() => new Error('fail')))

      component.onDeleteTask('t1')

      expect(component.localTasks().find((t) => t.id === 't1')).toBeDefined()
    })
  })

  describe('onTaskSaved', () => {
    it('creates a new task and injects the projectId', () => {
      const newTask = makeTask({ id: 'new', status: 'todo' })
      tasksService.create.and.returnValue(of(newTask))

      component.onTaskSaved({ title: 'New', description: '', status: 'todo', priority: 'low' })

      expect(tasksService.create).toHaveBeenCalledWith(
        jasmine.objectContaining({ projectId: 'p1' }),
      )
      expect(component.localTasks().find((t) => t.id === 'new')).toBeDefined()
    })

    it('shows a success toast after task creation', () => {
      tasksService.create.and.returnValue(of(makeTask({ id: 'new' })))
      component.onTaskSaved({ title: 'New', description: '', status: 'todo', priority: 'low' })
      expect(notifications.showToast).toHaveBeenCalledWith('Task created', 'success')
    })

    it('updates an existing task in localTasks', () => {
      const task = makeTask({ id: 't1', title: 'Old' })
      fixture.componentRef.setInput('tasks', [task])
      component.editingTask.set(task)
      tasksService.update.and.returnValue(of({ ...task, title: 'Updated' }))

      component.onTaskSaved({ title: 'Updated' })

      expect(tasksService.update).toHaveBeenCalledWith('t1', { title: 'Updated' })
      expect(component.localTasks().find((t) => t.id === 't1')!.title).toBe('Updated')
    })

    it('resets isSubmitting after create', () => {
      tasksService.create.and.returnValue(of(makeTask({ id: 'x' })))
      component.onTaskSaved({ title: 'Task', description: '', status: 'todo', priority: 'low' })
      expect(component.isSubmitting()).toBeFalse()
    })

    it('resets isSubmitting after update', () => {
      const task = makeTask({ id: 't1' })
      fixture.componentRef.setInput('tasks', [task])
      component.editingTask.set(task)
      tasksService.update.and.returnValue(of(task))

      component.onTaskSaved({ title: 'Updated' })

      expect(component.isSubmitting()).toBeFalse()
    })
  })
})
