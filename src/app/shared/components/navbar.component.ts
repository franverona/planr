import { Component } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-primary-700 text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <a
            routerLink="/"
            class="flex items-center gap-2 text-xl font-bold tracking-tight hover:text-primary-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 32 32">
              <rect width="32" height="32" rx="6" fill="white" opacity="0.25" />
              <rect x="5" y="7" width="6" height="3" rx="1" fill="white" />
              <rect x="5" y="12" width="6" height="3" rx="1" fill="white" />
              <rect x="5" y="17" width="6" height="3" rx="1" fill="white" opacity="0.5" />
              <rect x="13" y="7" width="6" height="3" rx="1" fill="white" />
              <rect x="13" y="12" width="6" height="3" rx="1" fill="white" opacity="0.5" />
              <rect x="21" y="7" width="6" height="3" rx="1" fill="white" />
              <rect x="5" y="23" width="22" height="2" rx="1" fill="white" opacity="0.4" />
            </svg>
            Planr
          </a>
          <div class="flex items-center gap-1">
            <a
              routerLink="/projects"
              routerLinkActive="bg-primary-800"
              class="px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              Projects
            </a>
          </div>
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {}
