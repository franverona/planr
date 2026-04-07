import { Component, inject, input, output, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms'
import { Project, CreateProjectDto, UpdateProjectDto } from '@core/models/project.model'
import { SpinnerComponent } from '@shared/components/spinner/spinner.component'

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './project-form.component.html',
})
export class ProjectFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder)

  readonly project = input<Project | null>(null)
  readonly saved = output<CreateProjectDto | UpdateProjectDto>()
  readonly cancelled = output<void>()
  readonly loading = input(false)

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    status: ['active' as 'active' | 'archived'],
  })

  ngOnInit(): void {
    const p = this.project()
    if (p) {
      this.form.patchValue({
        name: p.name,
        description: p.description,
        status: p.status,
      })
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
