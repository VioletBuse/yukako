export * from './versions';
export type * from './versions';

export type ProjectType = {
    id: string;
    name: string;
    latest_version: number | null;
};
