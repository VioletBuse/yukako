import { AsyncTask, ToadScheduler, SimpleIntervalJob } from 'toad-scheduler';
import { checkLock } from '../leader';
import wait from 'wait';
import { getDatabase } from '@yukako/state';
import { eq } from 'drizzle-orm';
import { cronJobs, projects } from '@yukako/state/src/db/schema';
import Cron from 'croner';

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

    private cronJobs: { name: string; cron: string }[] = [];

    public reloadConfig = async () => {
        if (!this.weHaveLock) return;

        const db = getDatabase();

        const project = await db.$primary.query.projects.findFirst({
            where: eq(projects.id, this.projectId),
            with: {
                cronJobs: true,
            },
        });

        if (!project) {
            console.error(
                'Could not load project with projectId',
                this.projectId,
            );
            return;
        }

        this.cronJobs = project.cronJobs
            .filter((job) => job.enabled)
            .map((job) => ({
                name: job.name,
                cron: job.cron,
            }));

        if (this.cronJobs.length > 0) {
            console.log('cron jobs', this.cronJobs);
        }
    };

    private reloadConfigTask = new AsyncTask(
        'Reload Project Config',
        this.reloadConfig,
    );

    private reloadConfigJob = new SimpleIntervalJob(
        { minutes: 2, runImmediately: false },
        this.reloadConfigTask,
        {
            id: 'reloadConfigJob',
            preventOverrun: true,
        },
    );

    private checkProjectLockStatus = async () => {
        const minimumWait = 500;
        const maximumWait = 5000;

        const waitSeconds =
            Math.floor(Math.random() * (maximumWait - minimumWait + 1)) +
            minimumWait;

        await wait(waitSeconds);

        this.weHaveLock = await checkLock(`project:${this.projectId}`);
        this.onLockStatusChange(this.weHaveLock);
    };

    private checkProjectLockStatusTask = new AsyncTask(
        'Check Project Lock Status',
        this.checkProjectLockStatus,
    );

    private checkProjectLockStatusJob = new SimpleIntervalJob(
        {
            seconds: 20,
            runImmediately: true,
        },
        this.checkProjectLockStatusTask,
        { id: 'checkProjectLockStatusJob', preventOverrun: true },
    );

    private maintainCronJobs = async () => {
        if (!this.weHaveLock) return;

        for (const cronJob of this.cronJobs) {
            const cron = new Cron(cronJob.cron);
            const next = cron.nextRuns(100);

            console.log(
                'next runs',
                next.map((nxt) => nxt.toUTCString()),
            );
        }
    };

    private maintainCronJobsTask = new AsyncTask(
        'Maintain Cron Jobs',
        this.maintainCronJobs,
    );
    private maintainCronJobsJob = new SimpleIntervalJob(
        { seconds: 30, runImmediately: true },
        this.maintainCronJobsTask,
        {
            id: 'maintainCronJobsJob',
            preventOverrun: true,
        },
    );

    public start = async () => {
        console.log(
            'Starting single project manager, project id:',
            this.projectId,
        );

        this.scheduler.addSimpleIntervalJob(this.checkProjectLockStatusJob);
        this.scheduler.addSimpleIntervalJob(this.reloadConfigJob);
        this.scheduler.addSimpleIntervalJob(this.maintainCronJobsJob);
    };

    public stop = async () => {
        console.log(
            'Stopping single project manager, project id:',
            this.projectId,
        );

        this.scheduler.removeById('checkProjectLockStatusJob');
        this.scheduler.removeById('reloadConfigJob');
        this.scheduler.removeById('maintainCronJobsJob');
    };
}
