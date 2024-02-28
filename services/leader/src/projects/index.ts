import { getDatabase, getSql } from '@yukako/state/src/db/init';
import postgres from 'postgres';
import { SingleProjectManager } from './single-project-manager';

let listen: postgres.ListenMeta | null = null;

const ProjectManagers: Record<string, SingleProjectManager> = {};
const ProjectLocks: Record<string, boolean> = {};

export const SidecarProjectsManager = {
    start: async () => {
        const db = getDatabase();

        const reload = async () => {
            const projects = await db.$primary.query.projects.findMany();

            const removedProjects = Object.keys(ProjectManagers).filter(
                (projectId) => !projects.some((p) => p.id === projectId),
            );

            const newProjects = projects.filter(
                (project) => !Object.keys(ProjectManagers).includes(project.id),
            );

            for (const projectId of removedProjects) {
                await ProjectManagers[projectId].stop();
                delete ProjectManagers[projectId];
            }

            for (const project of newProjects) {
                const manager = new SingleProjectManager(project.id, {
                    onLockStatusChange: (status) => {
                        ProjectLocks[project.id] = status;
                    },
                });
                await manager.start();
                ProjectManagers[project.id] = manager;
            }

            for (const project of projects) {
                const manager = ProjectManagers[project.id];

                if (manager) {
                    await manager.reloadConfig();
                }
            }
        };

        const sql = getSql();

        listen = await sql.listen('project_versions', reload, reload);
    },
    stop: async () => {
        await listen?.unlisten();
    },
    locks: (): string[] =>
        Object.entries(ProjectLocks)
            .filter(([_, locked]) => locked)
            .map(([id]) => id),
};
