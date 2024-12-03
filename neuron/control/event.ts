type Fn = (...args: any[]) => void

export class EventBus {
  private events: { [key: string]: Fn[] } = {}

  on(event: string, listener: Fn) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(listener)
  }

  emit(event: string, ...args: unknown[]) {
    const listeners = this.events[event]
    if (listeners) {
      for (const listener of listeners) {
        listener(...args)
      }
    }
  }

  off(event: string, listener: Fn) {
    const listeners = this.events[event]
    if (listeners) {
      this.events[event] = listeners.filter((l) => l !== listener)
    }
  }
}
