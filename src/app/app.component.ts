import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { NavbarComponent } from './shared/components/navbar/navbar.component'
import { ErrorBannerComponent } from './shared/components/error-banner/error-banner.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ErrorBannerComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {}
