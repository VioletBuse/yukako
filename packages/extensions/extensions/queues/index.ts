import { YukakoInternalQueuesCreateJobBodyType } from '@yukako/types';

export type QueueProducerEnv = {
    QUEUE_ID: string;

    __admin: {
        fetch: (
            url: string | Request,
            options?: RequestInit,
        ) => Promise<Response>;
    };
};

export type QueueProducer = {
    createJob: (data: any) => Promise<void>;
};

const makeQueueBinding = (env: QueueProducerEnv): QueueProducer => {
    const producer: QueueProducer = {
        createJob: async (data: any) => {
            const body: YukakoInternalQueuesCreateJobBodyType = { data };

            const res = await env.__admin.fetch(
                `/__yukako/queues/create/${env.QUEUE_ID}`,
                {
                    method: 'POST',
                    body: JSON.stringify(body),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );

            if (!res.ok) {
                throw new Error('Failed to create job');
            }

            return;
        },
    };

    return producer;
};

export default makeQueueBinding;
