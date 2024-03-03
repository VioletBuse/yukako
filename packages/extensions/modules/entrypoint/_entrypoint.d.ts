export type Event = {
    type: string;
};

export type ScheduledEvent = {
    type: 'scheduled';
    cron: string;
    name: string;
};

export type Batch<T> = {
    type: 'batch';
    queue: string;
    items: T[];
    ackAll: () => Promise<void>;
    retryAll: () => Promise<void>;
};

export type Context = {};

type EntrypointFetch = (
    req: Request,
    env: any,
    ctx: Context,
) => Promise<Response>;

type EntrypointScheduled = (
    event: ScheduledEvent,
    env: any,
    ctx: Context,
) => Promise<any>;

type EntrypointQueue = (
    event: Batch<Event>,
    env: any,
    ctx: Context,
) => Promise<void>;

declare module './_entrypoint.js' {
    const _entrypoint: {
        fetch?: EntrypointFetch | undefined;
        scheduled?: EntrypointScheduled | undefined;
        queue?: EntrypointQueue | undefined;
    };

    export default _entrypoint;
}
