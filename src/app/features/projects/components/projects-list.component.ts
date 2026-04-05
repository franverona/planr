import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ProjectsService } from '../../../core/services/projects.service'
import { TasksService } from '../../../core/services/tasks.service'
import {
  Project,
  ProjectStatus,
  CreateProjectDto,
  UpdateProjectDto,
} from '../../../core/models/project.model'
import { Task } from '../../../core/models/task.model'
import { ProjectFormComponent } from './project-form.component'

type FilterStatus = 'all' | ProjectStatus

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ProjectFormComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Projects</h1>
          <p class="text-sm text-gray-500 mt-1">{{ filteredProjects().length }} project(s)</p>
        </div>
        <button
          (click)="openCreateForm()"
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
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
          New Project
        </button>
      </div>

      <!-- Filter tabs -->
      <div class="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        @for (f of filters; track f.value) {
          <button
            (click)="setFilter(f.value)"
            [class.bg-white]="activeFilter() === f.value"
            [class.shadow-sm]="activeFilter() === f.value"
            [class.text-gray-900]="activeFilter() === f.value"
            [class.text-gray-500]="activeFilter() !== f.value"
            class="px-4 py-1.5 text-sm font-medium rounded-md transition-all"
          >
            {{ f.label }}
          </button>
        }
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (i of [1, 2, 3]; track i) {
            <div class="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div class="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          }
        </div>
      }

      <!-- Projects grid -->
      @if (!loading()) {
        @if (filteredProjects().length === 0) {
          <div class="text-center py-16">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12 mx-auto text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p class="text-gray-500 text-sm">No projects found. Create your first one!</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (project of filteredProjects(); track project.id) {
              <div
                class="bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
              >
                <a [routerLink]="['/projects', project.id]" class="block p-5">
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <h3
                      class="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors leading-tight"
                    >
                      {{ project.name }}
                    </h3>
                    <span
                      [class]="statusBadgeClass(project.status)"
                      class="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
                    >
                      {{ project.status }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-500 line-clamp-2 mb-4">
                    {{ project.description || 'No description' }}
                  </p>
                  <div class="flex items-center gap-1 text-xs text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-3.5 w-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path
                        fill-rule="evenodd"
                        d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    {{ taskCounts()[project.id] || 0 }} task(s)
                  </div>
                </a>
              </div>
            }
          </div>
        }
      }
    </div>

    <!-- Create form modal -->
    @if (showForm()) {
      <app-project-form
        [project]="null"
        (saved)="onProjectSaved($event)"
        (cancelled)="closeForm()"
      />
    }
  `,
})
export class ProjectsListComponent implements OnInit {
  private readonly projectsService = inject(ProjectsService)
  private readonly tasksService = inject(TasksService)
  private readonly destroyRef = inject(DestroyRef)

  readonly projects = signal<Project[]>([])
  readonly taskCounts = signal<Record<number, number>>({})
  readonly loading = signal(true)
  readonly activeFilter = signal<FilterStatus>('all')
  readonly showForm = signal(false)

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
    projects.forEach((project) => {
      this.tasksService
        .getByProjectId(project.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (tasks: Task[]) => {
            this.taskCounts.update((counts) => ({ ...counts, [project.id]: tasks.length }))
          },
        })
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
    this.projectsService
      .create(dto as CreateProjectDto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created: Project) => {
          this.projects.update((list) => [created, ...list])
          this.closeForm()
        },
      })
  }

  statusBadgeClass(status: ProjectStatus): string {
    return status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
  }
}
