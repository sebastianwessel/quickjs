export default `
if (typeof globalThis.Event === 'undefined') {
  class Event {
    constructor(type, eventInitDict = {}) {
      this.type = String(type);
      this.bubbles = Boolean(eventInitDict.bubbles);
      this.cancelable = Boolean(eventInitDict.cancelable);
      this.composed = Boolean(eventInitDict.composed);
      this.defaultPrevented = false;
      this.eventPhase = 0;
      this.target = null;
      this.currentTarget = null;
      this.isTrusted = false;
      this.timeStamp = Date.now();
    }

    preventDefault() {
      if (this.cancelable) {
        this.defaultPrevented = true;
      }
    }

    stopImmediatePropagation() {}

    stopPropagation() {}
  }

  globalThis.Event = Event;
}

if (typeof globalThis.CustomEvent === 'undefined') {
  class CustomEvent extends globalThis.Event {
    constructor(type, eventInitDict = {}) {
      super(type, eventInitDict);
      this.detail = eventInitDict.detail ?? null;
    }
  }

  globalThis.CustomEvent = CustomEvent;
}

if (typeof globalThis.EventTarget === 'undefined') {
  class EventTarget {
    constructor() {
      Object.defineProperty(this, '__quickjsListeners', {
        configurable: false,
        enumerable: false,
        value: new Map(),
        writable: false,
      });
    }

    addEventListener(type, callback, options = {}) {
      if (callback == null) {
        return;
      }

      const eventType = String(type);
      const listeners = this.__quickjsListeners.get(eventType) ?? [];

      if (!listeners.some((listener) => listener.callback === callback)) {
        listeners.push({
          callback,
          once: Boolean(typeof options === 'object' && options?.once),
        });
        this.__quickjsListeners.set(eventType, listeners);
      }
    }

    removeEventListener(type, callback) {
      const eventType = String(type);
      const listeners = this.__quickjsListeners.get(eventType);

      if (!listeners) {
        return;
      }

      const nextListeners = listeners.filter((listener) => listener.callback !== callback);

      if (nextListeners.length > 0) {
        this.__quickjsListeners.set(eventType, nextListeners);
      } else {
        this.__quickjsListeners.delete(eventType);
      }
    }

    dispatchEvent(event) {
      if (!event || typeof event.type === 'undefined') {
        throw new TypeError("Failed to execute 'dispatchEvent' on 'EventTarget': parameter 1 is not of type 'Event'.");
      }

      const eventType = String(event.type);
      const listeners = [...(this.__quickjsListeners.get(eventType) ?? [])];

      try {
        event.target = event.target ?? this;
        event.currentTarget = this;
      } catch {}

      for (const listener of listeners) {
        if (listener.once) {
          this.removeEventListener(eventType, listener.callback);
        }

        if (typeof listener.callback === 'function') {
          listener.callback.call(this, event);
        } else if (typeof listener.callback?.handleEvent === 'function') {
          listener.callback.handleEvent(event);
        }
      }

      try {
        event.currentTarget = null;
      } catch {}

      return !event.defaultPrevented;
    }
  }

  globalThis.EventTarget = EventTarget;
}

export const Event = globalThis.Event;
export const CustomEvent = globalThis.CustomEvent;
export default globalThis.EventTarget;
`
