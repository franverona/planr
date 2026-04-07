import { Injectable, signal } from '@angular/core'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly error = signal<string | null>(null)
  readonly toasts = signal<Toast[]>([])
  readonly dismissingIds = signal<Set<string>>(new Set())

  setError(message: string): void {
    this.error.set(message)
  }

  clearError(): void {
    this.error.set(null)
  }

  showToast(message: string, type: ToastType = 'info', duration = 4000): void {
    const id = crypto.randomUUID()
    this.toasts.update((toasts) => [...toasts, { id, message, type }])
    setTimeout(() => this.dismissToast(id), duration)
  }

  dismissToast(id: string): void {
    this.dismissingIds.update((ids) => new Set([...ids, id]))
    setTimeout(() => {
      this.toasts.update((toasts) => toasts.filter((t) => t.id !== id))
      this.dismissingIds.update((ids) => {
        const next = new Set(ids)
        next.delete(id)
        return next
      })
    }, 150)
  }
}
