import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ProjectsService } from '../../../../core/services/projects.service'
import { TasksService } from '../../../../core/services/tasks.service'
import {
  Project,
  ProjectStatus,
  CreateProjectDto,
  UpdateProjectDto,
} from '../../../../core/models/project.model'
import { Task } from '../../../../core/models/task.model'
import { ProjectFormComponent } from '../project-form/project-form.component'
import { NotificationService } from '../../../../core/services/notification.service'
import { finalize, forkJoin } from 'rxjs'

type FilterStatus = 'all' | ProjectStatus

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ProjectFormComponent],
  templateUrl: './projects-list.component.html',
})
export class ProjectsListComponent implements OnInit {
  private readonly projectsService = inject(ProjectsService)
  private readonly tasksService = inject(TasksService)
  private readonly notifications = inject(NotificationService)
  private readonly destroyRef = inject(DestroyRef)

  readonly projects = signal<Project[]>([])
  readonly taskCounts = signal<Record<string, number>>({})
  readonly loading = signal(true)
  readonly activeFilter = signal<FilterStatus>('all')
  readonly showForm = signal(false)
  readonly isSubmitting = signal(false)

  readonly filters: { label: string; value: FilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Archived', value: 'archived' },
  ]

  readonly filteredProjects = computed(() => {
    const filter = this.activeFilter()
    const all = this.projects()
    if (filter === 'all') return all
    return all.filter((p) => p.status === filter)
  })

  ngOnInit(): void {
    this.loadProjects()
  }

  private loadProjects(): void {
    this.loading.set(true)
    this.projectsService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (projects: Project[]) => {
          this.projects.set(projects)
          this.loading.set(false)
          this.loadTaskCounts(projects)
        },
        error: () => this.loading.set(false),
      })
  }

  private loadTaskCounts(projects: Project[]): void {
    if (!projects.length) return

    const requests = projects.map((project) => this.tasksService.getByProjectId(project.id))

    forkJoin(requests)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (results: Task[][]) => {
          const counts: Record<string, number> = {}
          results.forEach((tasks, i) => {
            counts[projects[i].id] = tasks.length
          })
          this.taskCounts.set(counts)
        },
      })
  }

  setFilter(filter: FilterStatus): void {
    this.activeFilter.set(filter)
  }

  openCreateForm(): void {
    this.showForm.set(true)
  }

  closeForm(): void {
    this.showForm.set(false)
  }

  onProjectSaved(dto: CreateProjectDto | UpdateProjectDto): void {
    this.isSubmitting.set(true)
    this.projectsService
      .create(dto as CreateProjectDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: (created: Project) => {
          this.projects.update((list) => [created, ...list])
          this.notifications.showToast('Project created', 'success')
          this.closeForm()
        },
      })
  }

  statusBadgeClass(status: ProjectStatus): string {
    return status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
  }
}
