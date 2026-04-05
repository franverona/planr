import { Injectable, signal } from '@angular/core'

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly error = signal<string | null>(null)

  setError(message: string): void {
    this.error.set(message)
  }

  clearError(): void {
    this.error.set(null)
  }
}
