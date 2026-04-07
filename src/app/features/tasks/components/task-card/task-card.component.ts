import { Component, input, output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Task, TaskPriority } from '@core/models/task.model'

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.component.html',
})
export class TaskCardComponent {
  readonly task = input.required<Task>()
  readonly deleted = output<string>()
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

  deleteTask(): void {
    const t = this.task()
    if (!t || !confirm(`Delete task "${t.title}"? This cannot be undone.`)) return

    this.deleted.emit(this.task().id)
  }
}
