import { Component, input, output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Task, TaskPriority } from '../../../core/models/task.model'

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="task-card bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <div class="flex items-start justify-between gap-2 mb-2">
        <h4 class="text-sm font-medium text-gray-900 leading-tight">{{ task().title }}</h4>
        <button
          (click)="deleted.emit(task().id)"
          class="shrink-0 text-gray-300 hover:text-red-500 transition-colors p-0.5 -mr-1 -mt-0.5"
          title="Delete task"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      @if (task().description) {
        <p class="text-xs text-gray-500 line-clamp-2 mb-2">{{ task().description }}</p>
      }

      <div class="flex items-center justify-between">
        <span
          [class]="priorityBadgeClass(task().priority)"
          class="text-xs font-medium px-2 py-0.5 rounded-full"
        >
          {{ task().priority }}
        </span>
        <button
          (click)="edited.emit(task())"
          class="text-xs text-gray-400 hover:text-primary-600 transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  `,
})
export class TaskCardComponent {
  readonly task = input.required<Task>()
  readonly deleted = output<number>()
  readonly edited = output<Task>()

  priorityBadgeClass(priority: TaskPriority): string {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700'
      case 'medium':
        return 'bg-amber-100 text-amber-700'
      case 'low':
        return 'bg-blue-100 text-blue-700'
    }
  }
}
