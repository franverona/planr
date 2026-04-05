import { Component, inject, input, signal, computed, DestroyRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { TasksService } from '../../../core/services/tasks.service'
import { Task, TaskStatus, CreateTaskDto, UpdateTaskDto } from '../../../core/models/task.model'
import { TaskCardComponent } from './task-card.component'
import { TaskFormComponent } from './task-form.component'

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
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      @for (col of columns; track col.id) {
        <div class="flex flex-col min-h-0">
          <!-- Column header -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span [class]="col.colorClass" class="w-2.5 h-2.5 rounded-full"></span>
              <h3 class="text-sm font-semibold text-gray-700">{{ col.label }}</h3>
              <span class="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                {{ tasksByStatus()[col.id].length }}
              </span>
            </div>
            <button
              (click)="openCreateForm(col.id)"
              class="text-gray-400 hover:text-primary-600 transition-colors p-1 rounded"
              title="Add task"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>

          <!-- Drop zone -->
          <div
            cdkDropList
            [id]="col.id"
            [cdkDropListData]="tasksByStatus()[col.id]"
            [cdkDropListConnectedTo]="connectedLists"
            (cdkDropListDropped)="onDrop($event, col.id)"
            [class]="col.headerClass"
            class="flex-1 min-h-24 rounded-xl p-2 space-y-2 transition-colors"
          >
            @for (task of tasksByStatus()[col.id]; track task.id) {
              <div cdkDrag>
                <app-task-card
                  [task]="task"
                  (deleted)="onDeleteTask($event)"
                  (edited)="openEditForm($event)"
                />
                <div
                  *cdkDragPlaceholder
                  class="h-20 rounded-lg bg-gray-200 border-2 border-dashed border-gray-300"
                ></div>
              </div>
            }

            @if (tasksByStatus()[col.id].length === 0) {
              <div class="text-center py-6 text-xs text-gray-400">Drop tasks here</div>
            }
          </div>
        </div>
      }
    </div>

    <!-- Task form modal -->
    @if (showForm()) {
      <app-task-form
        [task]="editingTask()"
        [defaultStatus]="formDefaultStatus()"
        (saved)="onTaskSaved($event)"
        (cancelled)="closeForm()"
      />
    }
  `,
})
export class KanbanBoardComponent {
  private readonly tasksService = inject(TasksService)
  private readonly destroyRef = inject(DestroyRef)

  readonly projectId = input.required<number>()
  readonly tasks = input.required<Task[]>()

  readonly localTasks = signal<Task[]>([])
  readonly showForm = signal(false)
  readonly editingTask = signal<Task | null>(null)
  readonly formDefaultStatus = signal<TaskStatus>('todo')

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

    if (existing) {
      this.tasksService
        .update(existing.id, dto as UpdateTaskDto)
        .pipe(takeUntilDestroyed(this.destroyRef))
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
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (created: Task) => {
            this.localTasks.set([...this.getEffectiveTasks(), created])
            this.closeForm()
          },
        })
    }
  }

  onDeleteTask(taskId: number): void {
    const base = this.getEffectiveTasks()
    this.localTasks.set(base.filter((t) => t.id !== taskId))

    this.tasksService
      .delete(taskId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => this.localTasks.set(base),
      })
  }
}
