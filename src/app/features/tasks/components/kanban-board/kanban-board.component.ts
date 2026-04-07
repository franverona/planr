import { Component, inject, input, signal, computed, DestroyRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { TasksService } from '../../../../core/services/tasks.service'
import { NotificationService } from '../../../../core/services/notification.service'
import { Task, TaskStatus, CreateTaskDto, UpdateTaskDto } from '../../../../core/models/task.model'
import { TaskCardComponent } from '../task-card/task-card.component'
import { TaskFormComponent } from '../task-form/task-form.component'
import { finalize } from 'rxjs'

interface KanbanColumn {
  id: TaskStatus
  label: string
  colorClass: string
  headerClass: string
}

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskCardComponent, TaskFormComponent],
  templateUrl: './kanban-board.component.html',
})
export class KanbanBoardComponent {
  private readonly tasksService = inject(TasksService)
  private readonly notifications = inject(NotificationService)
  private readonly destroyRef = inject(DestroyRef)

  readonly projectId = input.required<string>()
  readonly tasks = input.required<Task[]>()

  readonly localTasks = signal<Task[]>([])
  readonly showForm = signal(false)
  readonly editingTask = signal<Task | null>(null)
  readonly formDefaultStatus = signal<TaskStatus>('todo')
  readonly isSubmitting = signal(false)

  readonly columns: KanbanColumn[] = [
    { id: 'todo', label: 'To Do', colorClass: 'bg-gray-400', headerClass: 'bg-gray-50' },
    {
      id: 'in-progress',
      label: 'In Progress',
      colorClass: 'bg-amber-400',
      headerClass: 'bg-amber-50',
    },
    { id: 'done', label: 'Done', colorClass: 'bg-green-400', headerClass: 'bg-green-50' },
  ]

  readonly connectedLists: TaskStatus[] = ['todo', 'in-progress', 'done']

  readonly tasksByStatus = computed<Record<TaskStatus, Task[]>>(() => {
    const source = this.localTasks().length > 0 ? this.localTasks() : this.tasks()
    return {
      todo: source.filter((t) => t.status === 'todo'),
      'in-progress': source.filter((t) => t.status === 'in-progress'),
      done: source.filter((t) => t.status === 'done'),
    }
  })

  private getEffectiveTasks(): Task[] {
    return this.localTasks().length > 0 ? [...this.localTasks()] : [...this.tasks()]
  }

  onDrop(event: CdkDragDrop<Task[]>, targetStatus: TaskStatus): void {
    if (event.previousContainer === event.container) return

    const movedTask: Task = event.previousContainer.data[event.previousIndex]
    const updatedTask: Task = { ...movedTask, status: targetStatus }
    const allTasks = this.getEffectiveTasks()

    // Optimistic update
    this.localTasks.set(allTasks.map((t) => (t.id === movedTask.id ? updatedTask : t)))

    this.tasksService
      .update(movedTask.id, { status: targetStatus })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => this.localTasks.set(allTasks),
      })
  }

  openCreateForm(status: TaskStatus): void {
    this.editingTask.set(null)
    this.formDefaultStatus.set(status)
    this.showForm.set(true)
  }

  openEditForm(task: Task): void {
    this.editingTask.set(task)
    this.formDefaultStatus.set(task.status)
    this.showForm.set(true)
  }

  closeForm(): void {
    this.showForm.set(false)
    this.editingTask.set(null)
  }

  onTaskSaved(dto: CreateTaskDto | UpdateTaskDto): void {
    const existing = this.editingTask()
    this.isSubmitting.set(true)

    if (existing) {
      this.tasksService
        .update(existing.id, dto as UpdateTaskDto)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => this.isSubmitting.set(false)),
        )
        .subscribe({
          next: (updated: Task) => {
            const base = this.getEffectiveTasks()
            this.localTasks.set(base.map((t) => (t.id === updated.id ? updated : t)))
            this.closeForm()
          },
        })
    } else {
      const createDto: CreateTaskDto = {
        projectId: this.projectId(),
        ...(dto as Omit<CreateTaskDto, 'projectId'>),
      }
      this.tasksService
        .create(createDto)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => this.isSubmitting.set(false)),
        )
        .subscribe({
          next: (created: Task) => {
            this.localTasks.set([...this.getEffectiveTasks(), created])
            this.notifications.showToast('Task created', 'success')
            this.closeForm()
          },
        })
    }
  }

  onDeleteTask(taskId: string): void {
    const base = this.getEffectiveTasks()
    this.localTasks.set(base.filter((t) => t.id !== taskId))

    this.tasksService
      .delete(taskId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.notifications.showToast('Task deleted', 'success'),
        error: () => this.localTasks.set(base),
      })
  }
}
