import { MainLayout } from '@/layouts/main';
import { useListProjects } from '@/lib/hooks/data-hooks/list-projects';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Server, Terminal } from 'lucide-react';
import { Link } from 'wouter';

export const ProjectsPage: React.FC = () => {
    const [projects, fetchProjectsError, loadingProjects] = useListProjects();

    console.log({ projects, fetchProjectsError, loadingProjects });

    return (
        <>
            <MainLayout selectedTab='projects'>
                <h1>Projects</h1>
                <div className='grid gap-2 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 xl2:grid-cols-4 xl3:grid-cols-5'>
                    {projects?.map((project) => (
                        <Link href={`/projects/${project.id}`} key={project.id}>
                            <Card
                                className='hover:bg-accent transition-all duration-200 ease-in-out cursor-pointer'
                                key={project.id}>
                                <CardHeader>
                                    <CardTitle>{project.name}</CardTitle>
                                    <CardDescription>
                                        Project Created{' '}
                                        {new Date(
                                            project.created_at,
                                        ).toLocaleDateString()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {project.latest_version && (
                                        <>
                                            {/*<div className='border border-border p-4 bg-background'>*/}
                                            {/*    <h2 className='font-medium'>*/}
                                            {/*        Last Deployed: Version{' '}*/}
                                            {/*        {*/}
                                            {/*            project.latest_version*/}
                                            {/*                .version*/}
                                            {/*        }*/}
                                            {/*    </h2>*/}
                                            {/*    <p className='text-sm'>*/}
                                            {/*        (id){' '}*/}
                                            {/*        {project.latest_version.id}*/}
                                            {/*    </p>*/}
                                            {/*    <p className='text-sm'>*/}
                                            {/*        Deployed at:{' '}*/}
                                            {/*        {new Date(*/}
                                            {/*            project.latest_version.created_at,*/}
                                            {/*        ).toLocaleDateString()}*/}
                                            {/*    </p>*/}
                                            {/*</div>*/}
                                            <Alert>
                                                <Server className='h-4 w-4' />
                                                <AlertTitle>
                                                    Last Deployed: Version{' '}
                                                    {
                                                        project.latest_version
                                                            .version
                                                    }
                                                </AlertTitle>
                                                <AlertDescription>
                                                    <span className='font-medium'>
                                                        (id)
                                                    </span>{' '}
                                                    {project.latest_version.id}
                                                    <br />
                                                    <span className='font-medium'>
                                                        (deployed)
                                                    </span>{' '}
                                                    {new Date(
                                                        project.latest_version.created_at,
                                                    ).toLocaleDateString()}
                                                </AlertDescription>
                                            </Alert>
                                        </>
                                    )}
                                    {project.latest_version === null && (
                                        <>
                                            <Alert>
                                                <Terminal className='h-4 w-4' />
                                                <AlertTitle>
                                                    This project has not been
                                                    deployed yet
                                                </AlertTitle>
                                                <AlertDescription>
                                                    Use the command &#96;yukactl
                                                    projects deploy&#96; to
                                                    deploy your project!
                                                </AlertDescription>
                                            </Alert>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </MainLayout>
        </>
    );
};
