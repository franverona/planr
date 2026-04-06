import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { finalize, switchMap } from 'rxjs'
import { ProjectsService } from '../../../../core/services/projects.service'
import { TasksService } from '../../../../core/services/tasks.service'
import { Project, UpdateProjectDto } from '../../../../core/models/project.model'
import { Task } from '../../../../core/models/task.model'
import { ProjectFormComponent } from '../project-form/project-form.component'
import { KanbanBoardComponent } from '../../../tasks/components/kanban-board/kanban-board.component'

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ProjectFormComponent, KanbanBoardComponent],
  templateUrl: './project-detail.component.html',
})
export class ProjectDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly projectsService = inject(ProjectsService)
  private readonly tasksService = inject(TasksService)
  private readonly destroyRef = inject(DestroyRef)

  readonly project = signal<Project | null>(null)
  readonly tasks = signal<Task[]>([])
  readonly loading = signal(true)
  readonly showEditForm = signal(false)
  readonly isSubmitting = signal(false)

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id')!
          this.loading.set(true)
          return this.projectsService.getById(id)
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (project: Project) => {
          this.project.set(project)
          this.loading.set(false)
          this.loadTasks(project.id)
        },
        error: () => this.loading.set(false),
      })
  }

  private loadTasks(projectId: string): void {
    this.tasksService
      .getByProjectId(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tasks: Task[]) => this.tasks.set(tasks),
      })
  }

  statusBadgeClass(): string {
    return this.project()?.status === 'active'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-500'
  }

  onProjectSaved(dto: UpdateProjectDto): void {
    const p = this.project()
    if (!p) return

    this.isSubmitting.set(true)
    this.projectsService
      .update(p.id, dto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: (updated: Project) => {
          this.project.set(updated)
          this.showEditForm.set(false)
        },
      })
  }

  onDelete(): void {
    const p = this.project()
    if (!p || !confirm(`Delete project "${p.name}"? This cannot be undone.`)) return

    this.projectsService
      .delete(p.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(['/projects']),
      })
  }
}
