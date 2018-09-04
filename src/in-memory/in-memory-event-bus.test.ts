import "jest";
import { IEvent } from "../event";
import { IEventBus } from "../event-bus";
import { InMemoryEventBus } from "./in-memory-event-bus";
import { getUtcNow } from "../utilities/date-helpers";
import { Guid } from "../utilities/guid";

let handled = 0;
let eventId = Guid.newGuid();
let eventName = 'TestEvent';
let evt: IEvent = { id: eventId, name: eventName, dateTime: getUtcNow() };
let handler1 = (event: IEvent) => {
    return new Promise<void>((resolve, reject) => {
        handled += 1;
        resolve();
    });
};
let handler2 = (event: IEvent) => {
    return new Promise<void>((resolve, reject) => {
        handled += 2;
        resolve();
    });
};
let eventBus: IEventBus = new InMemoryEventBus();

test('returns empty list for unsubscribed', () => {
    let handlers = eventBus.getHandlers(eventName);
    expect(handlers.length).toBeLessThanOrEqual(0);
    expect(handlers).not.toContain(handler1);
    expect(handlers).not.toContain(handler2);
});

test('accepts new subscription(s)', () => {
    let handlers = eventBus.getHandlers(eventName);
    expect(handlers).not.toContain(handler1);
    eventBus.subscribe<IEvent>(eventName, handler1);
    handlers = eventBus.getHandlers<IEvent>(eventName);
    expect(handlers).toContain(handler1);
    expect(handlers).not.toContain(handler2);
    eventBus.subscribe<IEvent>(eventName, handler2);
    handlers = eventBus.getHandlers<IEvent>(eventName);
    expect(handlers).toContain(handler2);
    expect(handlers).toContain(handler1);
});

test('publishes event to all subscribers', async () => {
    expect(handled).toEqual(0);
    await eventBus.publishAsync(evt);
    expect(handled).toEqual(3); // handled by both 1 + 2
    handled = 0;
}, 500);

test('honors subscription removal', async () => {
    let handlers = eventBus.getHandlers<IEvent>(eventName);
    expect(handlers).toContain(handler1);
    expect(handlers).toContain(handler2);
    eventBus.unsubscribe(eventName, handler1);
    handlers = eventBus.getHandlers<IEvent>(eventName);
    expect(handlers).not.toContain(handler1);
    expect(handlers).toContain(handler2);
    expect(handled).toEqual(0);
    await eventBus.publishAsync(evt);
    expect(handled).toEqual(2); // handled by 2 only
}, 500);