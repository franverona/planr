import { Component, inject, input, output, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms'
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskStatus,
  TaskPriority,
} from '../../../../core/models/task.model'

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
})
export class TaskFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder)

  readonly task = input<Task | null>(null)
  readonly defaultStatus = input<TaskStatus>('todo')
  readonly saved = output<CreateTaskDto | UpdateTaskDto>()
  readonly cancelled = output<void>()

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    priority: ['medium' as TaskPriority],
    status: ['todo' as TaskStatus],
  })

  ngOnInit(): void {
    const t = this.task()
    if (t) {
      this.form.patchValue({
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
      })
    } else {
      this.form.patchValue({ status: this.defaultStatus() })
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    this.saved.emit(this.form.getRawValue())
  }

  onCancel(): void {
    this.cancelled.emit()
  }
}
