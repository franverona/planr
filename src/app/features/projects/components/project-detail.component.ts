import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { switchMap } from 'rxjs'
import { ProjectsService } from '../../../core/services/projects.service'
import { TasksService } from '../../../core/services/tasks.service'
import { Project, UpdateProjectDto } from '../../../core/models/project.model'
import { Task } from '../../../core/models/task.model'
import { ProjectFormComponent } from './project-form.component'
import { KanbanBoardComponent } from '../../tasks/components/kanban-board.component'

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ProjectFormComponent, KanbanBoardComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      @if (loading()) {
        <div class="animate-pulse">
          <div class="h-7 bg-gray-200 rounded w-48 mb-3"></div>
          <div class="h-4 bg-gray-200 rounded w-96 mb-6"></div>
        </div>
      }

      @if (!loading() && project()) {
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <a routerLink="/projects" class="hover:text-primary-600 transition-colors">Projects</a>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="text-gray-900 font-medium">{{ project()!.name }}</span>
        </nav>

        <!-- Project header -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-start gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h1 class="text-2xl font-bold text-gray-900">{{ project()!.name }}</h1>
                <span
                  [class]="statusBadgeClass()"
                  class="text-xs font-medium px-2.5 py-1 rounded-full"
                >
                  {{ project()!.status }}
                </span>
              </div>
              <p class="text-gray-500">
                {{ project()!.description || 'No description provided.' }}
              </p>
              <p class="text-xs text-gray-400 mt-2">
                Created {{ project()!.createdAt | date: 'mediumDate' }}
              </p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button
                (click)="showEditForm.set(true)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                  />
                </svg>
                Edit
              </button>
              <button
                (click)="onDelete()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
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
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Kanban board -->
        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Board</h2>
          <app-kanban-board [projectId]="project()!.id" [tasks]="tasks()" />
        </div>
      }

      @if (!loading() && !project()) {
        <div class="text-center py-16">
          <p class="text-gray-500">Project not found.</p>
          <a
            routerLink="/projects"
            class="mt-4 inline-block text-primary-600 hover:underline text-sm"
          >
            Back to projects
          </a>
        </div>
      }
    </div>

    @if (showEditForm() && project()) {
      <app-project-form
        [project]="project()"
        (saved)="onProjectSaved($event)"
        (cancelled)="showEditForm.set(false)"
      />
    }
  `,
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

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = Number(params.get('id'))
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

  private loadTasks(projectId: number): void {
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

    this.projectsService
      .update(p.id, dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
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
