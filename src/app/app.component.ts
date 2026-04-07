import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { NavbarComponent } from './shared/components/navbar/navbar.component'
import { ErrorBannerComponent } from './shared/components/error-banner/error-banner.component'
import { ToastComponent } from './shared/components/toast/toast.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ErrorBannerComponent, ToastComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {}
