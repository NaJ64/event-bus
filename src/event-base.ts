import { IEvent } from "./event";
import { getUtcNow } from "./utilities/date-helpers";
import { Guid } from "./utilities/guid";

export abstract class EventBase implements IEvent { 
    public abstract name: string;
    protected _id: string;
    protected _dateTime: Date;
    public get id(): string {
        return this._id;
    }
    public get dateTime(): Date {
        return this._dateTime;
    }
    public constructor(dateTime?: Date, id?: string) {
        this._dateTime = dateTime || getUtcNow();
        this._id = id || Guid.newGuid();
    }
}