import { useUser } from '@/lib/hooks/data-hooks/auth.ts';
import { MainLayout } from '@/layouts/main.tsx';
import { useGetRecentVersions } from '@/lib/hooks/data-hooks/versions/get-recent-versions-pagted';
import { useUsersList } from '@/lib/hooks/data-hooks/users/users';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from 'wouter';
import { useListProjects } from '@/lib/hooks/data-hooks/projects/list-projects';
import { useMemo } from 'react';
import { ProjectVersionsDataResponseBodyType } from '@yukako/types';
import { useGetProjectById } from '@/lib/hooks/data-hooks/projects/get-project-by-id';
import { Skeleton } from '@/components/ui/skeleton';

type HomePageCardProps = {
    title: string;
    children?: React.ReactNode | undefined;
    loading?:
        | {
              text: string | undefined;
          }
        | undefined;
    error?:
        | {
              text: string | undefined;
          }
        | undefined;
};

const HomePageCard: React.FC<HomePageCardProps> = ({
    title,
    children,
    loading,
    error,
}) => {
    return (
        <>
            <div className='h-full w-full bg-accent/50 border border-border border-t-transparent'>
                <div className='border-t border-t-border p-2 bg-gradient-to-b from-background from-75% to-transparent top-0 sticky z-50'>
                    <h1 className='text-xl font-medium'>{title}</h1>
                </div>
                <div className='p-2 pt-0'>
                    {loading?.text && (
                        <div className='w-full h-[50vh] flex items-center justify-center'>
                            <p className='flex flex-row items-center'>
                                <Loader2 className='w-4 h-4 mr-2 animate-spin' />{' '}
                                {loading?.text ?? 'Loading...'}{' '}
                            </p>
                        </div>
                    )}
                    {error?.text && (
                        <Alert variant='destructive'>
                            <AlertCircle className='w-4 h-4 mr-2' />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                {error?.text ?? 'An unknown error occurred.'}
                            </AlertDescription>
                        </Alert>
                    )}
                    {!loading?.text && !error?.text && children}
                </div>
            </div>
        </>
    );
};

type VersionsCardSpecificVersionCardProps = {
    versionData: ProjectVersionsDataResponseBodyType;
};

const VersionsCardSpecificVersionCard: React.FC<
    VersionsCardSpecificVersionCardProps
> = ({ versionData }) => {
    const [projectData, projectDataError, loadingProjectData] =
        useGetProjectById(versionData.projectId);

    return (
        <>
            {loadingProjectData && (
                <div className='border border-border p-2 hover:bg-accent/30'>
                    <Skeleton className='h-8 w-20 mb-1' />
                    <Skeleton className='h-6 w-full' />
                </div>
            )}
            {projectDataError && (
                <div className='border border-border p-2 hover:bg-accent/30'>
                    <Alert variant='destructive'>
                        <AlertCircle className='w-4 h-4 mr-2' />
                        <AlertTitle>
                            Error Loading V{versionData.version}
                        </AlertTitle>
                        <AlertDescription>
                            {projectDataError ?? 'An unknown error occurred.'}{' '}
                            <br />
                            Project Id: {versionData.projectId}
                        </AlertDescription>
                    </Alert>
                </div>
            )}
            {projectData && (
                <Link
                    href={`/projects/${
                        projectData.id
                    }?version=${encodeURIComponent(versionData.id)}`}>
                    <div className='border border-border p-2 hover:bg-accent'>
                        <h1 className='text-xl font-normal'>
                            V{versionData.version} of {projectData.name}
                        </h1>
                        <h3 className='text-sm font-light'>
                            Deployed At{' '}
                            {new Date(versionData.deployed_at).toUTCString()}
                        </h3>
                    </div>
                </Link>
            )}
        </>
    );
};

const VersionsCard: React.FC = () => {
    const [recentVersionsList, versionsFetchError, loadingVersions] =
        useGetRecentVersions({
            limit: 10,
            page: 1,
        });

    return (
        <>
            <HomePageCard
                loading={{
                    text: loadingVersions
                        ? 'Loading Recent Versions...'
                        : undefined,
                }}
                error={{
                    text: versionsFetchError ?? undefined,
                }}
                title='Recent Deployments'>
                {recentVersionsList !== null && (
                    <>
                        <div className='flex flex-col gap-2 pt-2'>
                            {recentVersionsList.map((version) => (
                                <VersionsCardSpecificVersionCard
                                    key={version.id}
                                    versionData={version}
                                />
                            ))}
                        </div>
                    </>
                )}
            </HomePageCard>
        </>
    );
};

const ProjectsCard: React.FC = () => {
    const [projectsList, errorLoadingProjects, loadingProjects] =
        useListProjects();

    const sortedProjectsList = useMemo(() => {
        if (projectsList === null) {
            return null;
        }
        return projectsList.sort((a, b) => {
            if (a.latest_version === null) {
                return 1;
            }
            if (b.latest_version === null) {
                return -1;
            }

            return b.latest_version.created_at - a.latest_version.created_at;
        });
    }, [projectsList]);

    return (
        <>
            <HomePageCard
                loading={{
                    text: loadingProjects
                        ? 'Loading Project List...'
                        : undefined,
                }}
                error={{
                    text: errorLoadingProjects ?? undefined,
                }}
                title={'Projects'}>
                {sortedProjectsList !== null && (
                    <>
                        <div className='flex flex-col gap-2 pt-2'>
                            {sortedProjectsList.map((project) => (
                                <Link
                                    href={`/projects/${project.id}`}
                                    key={project.id}>
                                    <div className='border border-border p-2 hover:bg-accent'>
                                        <h1 className='text-xl font-normal'>
                                            {project.name}
                                        </h1>
                                        <h3 className='text-sm font-light'>
                                            Created At{' '}
                                            {new Date(
                                                project.created_at,
                                            ).toDateString()}
                                            {project.latest_version
                                                ? `, V${
                                                      project.latest_version
                                                          .version
                                                  } deployed at ${new Date(
                                                      project.latest_version.created_at,
                                                  ).toUTCString()}`
                                                : ', Not Deployed Yet'}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </HomePageCard>
        </>
    );
};

const UsersCard: React.FC = () => {
    const [usersList, errorLoadingUsers, loadingUsers] = useUsersList();

    return (
        <>
            <HomePageCard
                loading={{
                    text: loadingUsers ? 'Loading User List...' : undefined,
                }}
                error={{
                    text: errorLoadingUsers ?? undefined,
                }}
                title={'Users'}>
                {usersList !== null && (
                    <>
                        <div className='flex flex-col gap-2 pt-2'>
                            {usersList.map((user) => (
                                <Link
                                    href={`/users/${user.uid}`}
                                    key={user.uid}>
                                    <div className='border border-border p-2 hover:bg-accent'>
                                        <h1 className='text-xl font-normal'>
                                            {user.username}
                                        </h1>
                                        <h3 className='text-sm font-light'>
                                            Joined{' '}
                                            {new Date(
                                                user.createdAt,
                                            ).toDateString()}
                                            {user.invitedBy
                                                ? `, Invited By ${user.invitedBy.username}`
                                                : ''}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </HomePageCard>
        </>
    );
};

export const HomePage: React.FC = () => {
    const [recentVersions, fetchVersionsError, loadingRecentVersions] =
        useGetRecentVersions({
            limit: 20,
            page: 1,
        });

    console.log(recentVersions, fetchVersionsError, loadingRecentVersions);

    return (
        <>
            <MainLayout
                breadcrumbs={[{ loading: false, name: 'home', href: '/' }]}
                selectedTab='home'>
                <>
                    <div className='mb-2'>
                        <h1 className='text-3xl font-medium'>Home</h1>
                    </div>
                    <div className='grid gap-2 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3'>
                        <VersionsCard />
                        <ProjectsCard />
                        <UsersCard />
                    </div>
                </>
            </MainLayout>
        </>
    );
};
