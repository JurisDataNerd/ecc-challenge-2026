export type GameEventHandler = (...args: any[]) => void;

class EventBus {
  private events: Record<string, GameEventHandler[]> = {};

  on(event: string, handler: GameEventHandler) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
    return () => this.off(event, handler);
  }

  off(event: string, handler: GameEventHandler) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(h => h !== handler);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    this.events[event].forEach(handler => handler(...args));
  }
}

export const GameEventBus = new EventBus();
