import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NotificationService } from '@core/services/notification.service'

@Component({
  selector: 'app-error-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-banner.component.html',
})
export class ErrorBannerComponent {
  readonly notifications = inject(NotificationService)
}
