import { TestBed } from '@angular/core/testing'
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { errorInterceptor } from './error.interceptor'
import { NotificationService } from '../services/notification.service'

describe('errorInterceptor', () => {
  let httpTesting: HttpTestingController
  let http: HttpClient
  let notifications: NotificationService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    })
    httpTesting = TestBed.inject(HttpTestingController)
    http = TestBed.inject(HttpClient)
    notifications = TestBed.inject(NotificationService)
  })

  afterEach(() => httpTesting.verify())

  it('calls setError with status and message from the error body', () => {
    spyOn(notifications, 'setError')
    http.get('/test').subscribe({ error: () => {} })
    httpTesting
      .expectOne('/test')
      .flush({ message: 'Not Found' }, { status: 404, statusText: 'Not Found' })
    expect(notifications.setError).toHaveBeenCalledWith('Error 404: Not Found')
  })

  it('falls back to error.message when the body has no message property', () => {
    spyOn(notifications, 'setError')
    http.get('/test').subscribe({ error: () => {} })
    httpTesting.expectOne('/test').flush(null, { status: 500, statusText: 'Internal Server Error' })
    expect(notifications.setError).toHaveBeenCalledWith(jasmine.stringContaining('Error 500:'))
  })

  it('re-throws the error so components can handle it', (done) => {
    http.get('/test').subscribe({
      error: (err) => {
        expect(err.status).toBe(403)
        done()
      },
    })
    httpTesting.expectOne('/test').flush(null, { status: 403, statusText: 'Forbidden' })
  })
})
