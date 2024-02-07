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
import { AlertCircle, Server, Terminal } from 'lucide-react';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const ProjectsPage: React.FC = () => {
    const [projects, fetchProjectsError, loadingProjects] = useListProjects();

    console.log({ projects, fetchProjectsError, loadingProjects });

    return (
        <>
            <MainLayout selectedTab='projects'>
                <h1 className='text-3xl font-medium mb-2'>Projects</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className='mb-2'>Create New Project</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Project</DialogTitle>
                            <DialogDescription>
                                You can create a new project here, or use
                                &#96;yukactl projects create&#96; from the CLI.
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
                {fetchProjectsError && (
                    <Alert variant='destructive' className='mb-2'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {fetchProjectsError ?? 'An unknown error occurred.'}
                        </AlertDescription>
                    </Alert>
                )}
                <div className='grid gap-2 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 xl2:grid-cols-4 xl3:grid-cols-5'>
                    {loadingProjects &&
                        Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton className='w-full h-52' key={i} />
                        ))}
                    {projects?.map((project) => (
                        <Link href={`/projects/${project.id}`} key={project.id}>
                            <Card
                                className='hover:bg-accent transition-all duration-200 ease-in-out cursor-pointer '
                                key={project.id}>
                                <CardHeader className='space-y-1 pb-2'>
                                    <CardTitle className='text-lg'>
                                        {project.name}
                                    </CardTitle>
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
                                            <Alert>
                                                <Server className='h-4 w-4' />
                                                <AlertTitle>
                                                    Version{' '}
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
