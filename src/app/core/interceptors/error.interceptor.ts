import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http'
import { inject } from '@angular/core'
import { catchError, throwError } from 'rxjs'
import { NotificationService } from '../services/notification.service'

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService)

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = error.error?.message ?? error.message ?? 'An unexpected error occurred'
      console.error('[HTTP Error]', error.status, message, error)
      notifications.setError(`Error ${error.status}: ${message}`)
      return throwError(() => error)
    }),
  )
}
