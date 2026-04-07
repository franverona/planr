import { Component, inject } from '@angular/core'
import { NotificationService, ToastType } from '../../../core/services/notification.service'

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  readonly notifications = inject(NotificationService)

  containerClass(type: ToastType, dismissing: boolean): string {
    const base =
      'flex items-start gap-3 px-4 py-3 rounded-lg shadow-md text-sm font-medium w-80 border-l-4 bg-white'
    const colors: Record<ToastType, string> = {
      success: 'border-green-500 text-green-800',
      error: 'border-red-500 text-red-800',
      info: 'border-blue-500 text-blue-800',
      warning: 'border-amber-400 text-amber-800',
    }
    const animation = dismissing ? 'toast-leave' : 'toast-enter'
    return `${base} ${colors[type]} ${animation}`
  }
}
