import { TestBed, fakeAsync, tick } from '@angular/core/testing'
import { NotificationService } from './notification.service'

describe('NotificationService', () => {
  let service: NotificationService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(NotificationService)
  })

  describe('setError / clearError', () => {
    it('sets the error signal', () => {
      service.setError('something went wrong')
      expect(service.error()).toBe('something went wrong')
    })

    it('clears the error signal', () => {
      service.setError('oops')
      service.clearError()
      expect(service.error()).toBeNull()
    })
  })

  describe('showToast', () => {
    it('adds a toast with the given message and type', fakeAsync(() => {
      service.showToast('hello', 'success')
      expect(service.toasts().length).toBe(1)
      expect(service.toasts()[0].message).toBe('hello')
      expect(service.toasts()[0].type).toBe('success')
      tick(4150)
    }))

    it('defaults type to info', fakeAsync(() => {
      service.showToast('msg')
      expect(service.toasts()[0].type).toBe('info')
      tick(4150)
    }))

    it('auto-dismisses after the given duration', fakeAsync(() => {
      service.showToast('bye', 'info', 1000)
      expect(service.toasts().length).toBe(1)
      tick(1000)
      tick(150)
      expect(service.toasts().length).toBe(0)
    }))

    it('assigns unique ids to multiple toasts', fakeAsync(() => {
      service.showToast('first', 'success')
      service.showToast('second', 'error')
      const ids = service.toasts().map((t) => t.id)
      expect(new Set(ids).size).toBe(2)
      tick(4150)
    }))
  })

  describe('dismissToast', () => {
    it('marks toast as dismissing immediately', fakeAsync(() => {
      service.showToast('test', 'info', 99999)
      const id = service.toasts()[0].id
      service.dismissToast(id)
      expect(service.dismissingIds().has(id)).toBeTrue()
      tick(150)
      tick(99999)
    }))

    it('removes toast and clears dismissingIds after 150ms', fakeAsync(() => {
      service.showToast('test', 'info', 99999)
      const id = service.toasts()[0].id
      service.dismissToast(id)
      tick(150)
      expect(service.toasts().length).toBe(0)
      expect(service.dismissingIds().has(id)).toBeFalse()
      tick(99999)
    }))
  })
})
