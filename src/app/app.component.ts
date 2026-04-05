import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { NavbarComponent } from './shared/components/navbar.component'
import { ErrorBannerComponent } from './shared/components/error-banner.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ErrorBannerComponent],
  template: `
    <app-error-banner />
    <app-navbar />
    <main class="min-h-screen bg-gray-50">
      <router-outlet />
    </main>
  `,
  styles: [],
})
export class AppComponent {}
