import {EventEmitter} from 'node:events';

class PubSub<TEvents extends Record<string, object>> {
  private _emitter = new EventEmitter();

  publish<TEvent extends keyof TEvents>(
    eventName: TEvent,
    args: TEvents[TEvent],
  ) {
    this._emitter.emit(eventName as string, args);
  }

  subscribe<TEvent extends keyof TEvents>(
    eventName: TEvent,
    listener: (args: TEvents[TEvent]) => void,
  ) {
    const handler = listener as (...args: unknown[]) => void;

    this._emitter.on(eventName as string, handler);

    return () => {
      this._emitter.off(eventName as string, handler);
    };
  }
}

type EventMap = {
  'customer.created': {
  };

  'customer.deleted': {
    customerId: string;
  };

  'job.created': {
    id: string;
    customerId: string;
    quoteAmount: string;
  };
};

export const eventBus = new PubSub<EventMap>();
