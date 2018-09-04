import { IEvent } from "../event";
import { AsyncEventHandler, IEventBus } from "../event-bus";

interface EventSubscription<TEvent extends IEvent> {
    eventName: string;
    asyncHandler: AsyncEventHandler<TEvent>;
}

export class InMemoryEventBus implements IEventBus {

    private readonly _subscriptions: Map<string, EventSubscription<IEvent>[]>;

    public constructor() {
        this._subscriptions = new Map<string, EventSubscription<IEvent>[]>();
    }

    public dispose(): void {
        // loop through all events
        this._subscriptions.forEach((subscription, key, map) => {
            // empty the subscriber collection for the current event
            subscription.length = 0;
        });
        // clear all mapped event subscriptions
        this._subscriptions.clear();
    }

    private getSubscriptions<TEvent extends IEvent>(eventName: string): EventSubscription<TEvent>[] {
        // check if the current event signature/key already exists
        if (!this._subscriptions.has(eventName)) {
            // set to new collection
            this._subscriptions.set(eventName, []);
        }
        // return the subscription list
        return this._subscriptions.get(eventName) || [];
    }

    public getHandlers<TEvent extends IEvent>(eventName: string): AsyncEventHandler<TEvent>[] {
        // get subscription list
        let subscriptions = this.getSubscriptions<TEvent>(eventName);
        // return projection to list of handler functions
        return subscriptions.map(x => x.asyncHandler);

    }

    public async publishAsync<TEvent extends IEvent>(evt: TEvent): Promise<void> {
        // Get all subscribers for the current event key
        let subscriptions = this.getSubscriptions<TEvent>(evt.name);
        // Loop through the subscribers
        for(let subscription of subscriptions) {
            // invoke the handler(s)
            await subscription.asyncHandler(evt);
        }
    }
    
    public subscribe<TEvent extends IEvent>(eventName: string, asyncHandler: (evt: TEvent) => Promise<void>) {
        // Get all subscribers for the current event key
        let subscriptions = this.getSubscriptions<TEvent>(eventName);
        // Add a new handler
        subscriptions.push({ eventName: eventName, asyncHandler: asyncHandler });
    }
    
    public unsubscribe<TEvent extends IEvent>(eventName: string, asyncHandler: (evt: TEvent) => Promise<void>) {
        // Get all subscribers for the current event key
        let subscriptions = this.getSubscriptions<TEvent>(eventName);
        // Find an index to remove where subscription.handler has reference equality
        let removeIndex = -1;
        for (let i=0; i < subscriptions.length; i++) {
            if (subscriptions[i].asyncHandler == asyncHandler) {
                removeIndex = i;
                break;
            }
        }
        // If the handler index was obtained
        if (removeIndex >= 0) {
            // remove the subscription from the collection
            subscriptions.splice(removeIndex, 1);
        }
    }

}