import { AsyncTask, ToadScheduler, SimpleIntervalJob } from 'toad-scheduler';
import { checkLock } from '../leader';
import wait from 'wait';
import { getDatabase } from '@yukako/state';
import { and, asc, desc, eq, isNotNull, or } from 'drizzle-orm';
import {
    cronJobLogs,
    cronJobs,
    cronJobStatuses,
    projects,
} from '@yukako/state/src/db/schema';
import Cron from 'croner';
import { nanoid } from 'nanoid';
import { inArray } from 'drizzle-orm/sql/expressions/conditions';
import * as util from 'util';
import { run } from '@yukako/cli';
import path from 'path';
import * as http from 'http';

export class SingleProjectManager {
    private projectId: string;
    private projectName: string | null = null;
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

    private cronJobs: { name: string; cron: string; projectId: string }[] = [];

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

        this.projectName = project.name;

        this.cronJobs = project.cronJobs
            .filter((job) => job.enabled)
            .map((job) => ({
                name: job.name,
                cron: job.cron,
                projectId: job.projectId,
            }));

        if (this.cronJobs.length > 0) {
            // console.log('cron jobs', this.cronJobs);
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

        const prev = this.weHaveLock;
        this.weHaveLock = await checkLock(`project:${this.projectId}`);
        this.onLockStatusChange(this.weHaveLock);

        if (prev !== this.weHaveLock) {
            await this.reloadConfig();
        }
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

        const db = getDatabase();

        await db.$primary.transaction(async (txn) => {
            for (const cronJob of this.cronJobs) {
                const cron = new Cron(cronJob.cron);

                const lastInvocation = await txn.query.cronJobLogs.findFirst({
                    where: and(
                        eq(cronJobLogs.cronJobName, cronJob.name),
                        eq(cronJobLogs.cronJobProjectId, cronJob.projectId),
                        eq(cronJobLogs.status, 'completed'),
                    ),
                    orderBy: desc(cronJobLogs.scheduledAt),
                });

                const lastScheduledDate = lastInvocation?.scheduledAt;

                const next20Runs = cron.nextRuns(20, lastScheduledDate);

                const scheduled = await txn.query.cronJobLogs.findMany({
                    where: and(
                        eq(cronJobLogs.cronJobName, cronJob.name),
                        eq(cronJobLogs.cronJobProjectId, cronJob.projectId),
                        eq(cronJobLogs.status, 'scheduled'),
                    ),
                });

                const scheduledToDelete = scheduled.filter(
                    (log) =>
                        !next20Runs.some(
                            (run) =>
                                run.getTime() === log.scheduledAt.getTime(),
                        ),
                );

                const scheduledToCreate = next20Runs.filter(
                    (run) =>
                        !scheduled.some(
                            (log) =>
                                log.scheduledAt.getTime() === run.getTime(),
                        ),
                );

                // console.log(
                //     util.inspect(
                //         {
                //             scheduledToDelete,
                //             scheduledToCreate,
                //         },
                //         true,
                //         4,
                //         true,
                //     ),
                // );

                if (scheduledToCreate.length > 0) {
                    await txn.insert(cronJobLogs).values(
                        scheduledToCreate.map((scheduledAt) => ({
                            id: nanoid(),
                            cronJobProjectId: cronJob.projectId,
                            cronJobName: cronJob.name,
                            scheduledAt,
                            status: 'scheduled' as const,
                        })),
                    );
                }

                if (scheduledToDelete.length > 0) {
                    await txn.delete(cronJobLogs).where(
                        inArray(
                            cronJobLogs.id,
                            scheduledToDelete.map((log) => log.id),
                        ),
                    );
                }
            }
        });
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

    private runCronJobs = async () => {
        if (!this.weHaveLock) return;
        if (this.cronJobs.length === 0) return;

        if (!this.projectName) return;

        const cli = run();
        const engine = path.resolve(
            cli.directory,
            './1',
            './engine',
            './engine.sock',
        );

        const db = getDatabase();

        for (const cronJob of this.cronJobs) {
            try {
                await db.$primary.transaction(async (txn) => {
                    const nextJobInvocation =
                        await txn.query.cronJobLogs.findFirst({
                            where: and(
                                eq(cronJobLogs.cronJobName, cronJob.name),
                                eq(
                                    cronJobLogs.cronJobProjectId,
                                    cronJob.projectId,
                                ),
                                eq(cronJobLogs.status, 'scheduled'),
                            ),
                            orderBy: asc(cronJobLogs.scheduledAt),
                        });

                    if (!nextJobInvocation) return;

                    console.log(util.inspect(nextJobInvocation, true, 4, true));
                    console.log('cur', Date.now());
                    console.log('sch', nextJobInvocation.scheduledAt.getTime());

                    const scheduledTimeIsGreaterThanCurrentTime =
                        nextJobInvocation.scheduledAt.getTime() > Date.now();

                    console.log(
                        'scheduled time is greater than current time',
                        scheduledTimeIsGreaterThanCurrentTime,
                    );

                    if (scheduledTimeIsGreaterThanCurrentTime) return;

                    await txn
                        .update(cronJobLogs)
                        .set({
                            status: 'running' as const,
                            ranAt: new Date(Date.now()),
                        })
                        .where(eq(cronJobLogs.id, nextJobInvocation.id));

                    const res = await new Promise<{
                        statusCode: number;
                        data: string;
                    }>((resolve, reject) => {
                        const data = {
                            type: 'scheduled',
                            cron: cronJob.cron,
                            name: cronJob.name,
                        };

                        const str = JSON.stringify(data);
                        const byteLength = Buffer.byteLength(str);

                        const _req = http.request(
                            {
                                socketPath: engine,
                                path: '/__yukako/scheduled',
                                headers: {
                                    'Content-type': 'application/json',
                                    'Content-length': byteLength,
                                    'x-forwarded-to-worker':
                                        this.projectName ??
                                        'dummy project name',
                                },
                            },
                            (_cb) => {
                                let buffers: Buffer[] = [];

                                _cb.on('error', reject);
                                _cb.on('data', (buffer) =>
                                    buffers.push(buffer),
                                );
                                _cb.on('end', () =>
                                    resolve({
                                        statusCode: _cb.statusCode ?? 500,
                                        data: Buffer.concat(buffers).toString(),
                                    }),
                                );
                            },
                        );

                        _req.write(str);
                        _req.end();
                    });

                    const json = JSON.parse(res.data);

                    const newLog = await txn
                        .update(cronJobLogs)
                        .set({
                            status: 'completed' as const,
                            completedAt: new Date(Date.now()),
                            result: json,
                        })
                        .where(eq(cronJobLogs.id, nextJobInvocation.id))
                        .returning();

                    console.log(util.inspect(newLog, true, 4, true));
                    console.log(res);
                });
            } catch (err) {
                console.error(err);
            }
        }
    };

    private runCronJobsTask = new AsyncTask('Run Cron Jobs', this.runCronJobs);
    private runCronJobsJob = new SimpleIntervalJob(
        {
            seconds: 10,
            runImmediately: true,
        },
        this.runCronJobsTask,
        { id: 'runCronJobsJob' },
    );

    public start = async () => {
        console.log(
            'Starting single project manager, project id:',
            this.projectId,
        );

        this.scheduler.addSimpleIntervalJob(this.checkProjectLockStatusJob);
        this.scheduler.addSimpleIntervalJob(this.reloadConfigJob);
        this.scheduler.addSimpleIntervalJob(this.maintainCronJobsJob);
        this.scheduler.addSimpleIntervalJob(this.runCronJobsJob);
    };

    public stop = async () => {
        console.log(
            'Stopping single project manager, project id:',
            this.projectId,
        );

        this.scheduler.removeById('checkProjectLockStatusJob');
        this.scheduler.removeById('reloadConfigJob');
        this.scheduler.removeById('maintainCronJobsJob');
        this.scheduler.removeById('runCronJobsJob');
    };
}
