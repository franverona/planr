import { Routes } from '@angular/router'

export const PROJECTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/projects-list/projects-list.component').then(
        (m) => m.ProjectsListComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/project-detail/project-detail.component').then(
        (m) => m.ProjectDetailComponent,
      ),
  },
]
