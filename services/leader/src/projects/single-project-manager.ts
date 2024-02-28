import { AsyncTask, ToadScheduler, SimpleIntervalJob } from 'toad-scheduler';
import { checkLock } from '../leader';
import wait from 'wait';

export class SingleProjectManager {
    private projectId: string;
    private onLockStatusChange: (status: boolean) => void = () => {};
    private scheduler = new ToadScheduler();

    private weHaveLock = false;

    constructor(
        projectId: string,
        opts?: {
            onLockStatusChange?: (status: boolean) => void;
        },
    ) {
        this.projectId = projectId;

        if (opts?.onLockStatusChange) {
            this.onLockStatusChange = opts.onLockStatusChange;
        }
    }

    public start = async () => {
        console.log(
            'Starting single project manager, project id:',
            this.projectId,
        );

        const checkProjectLockStatus = new AsyncTask(
            'Check Project Lock Status',
            async () => {
                const minimumWait = 1000;
                const maximumWait = 5000;

                const waitSeconds =
                    Math.floor(
                        Math.random() * (maximumWait - minimumWait + 1),
                    ) + minimumWait;

                await wait(waitSeconds);

                this.weHaveLock = await checkLock(`project:${this.projectId}`);
                this.onLockStatusChange(this.weHaveLock);
            },
        );

        const checkProjectLockStatusJob = new SimpleIntervalJob(
            {
                seconds: 30,
                runImmediately: true,
            },
            checkProjectLockStatus,
            { id: 'checkProjectLockStatusJob' },
        );

        this.scheduler.addSimpleIntervalJob(checkProjectLockStatusJob);
    };

    public stop = async () => {
        console.log(
            'Stopping single project manager, project id:',
            this.projectId,
        );

        this.scheduler.removeById('checkProjectLockStatusJob');
    };

    public reloadConfig = async () => {};
}
