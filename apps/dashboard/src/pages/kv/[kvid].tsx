import { MainLayout } from '@/layouts/main';
import { useGetKvById } from '@/lib/hooks/data-hooks/kv/get-kv-by-id';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from 'wouter';

type KvByIdPageProps = {
    id: string;
};

export const KvByIdPage: React.FC<KvByIdPageProps> = ({ id }) => {
    const [kvData, kvFetchError, loadingKvs] = useGetKvById(id);

    return (
        <>
            <MainLayout
                breadcrumbs={[
                    { name: 'kv', href: '/kv', loading: false },
                    kvData
                        ? {
                              name: kvData.name,
                              href: `/kv/${kvData.id}`,
                              loading: false,
                          }
                        : { loading: true },
                ]}
                selectedTab='kv'>
                <div>
                    {loadingKvs && (
                        <>
                            <div className='w-full h-[75vh] flex items-center justify-center'>
                                <p className='flex flex-row items-center'>
                                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                    Loading Kv Databases...
                                </p>
                            </div>
                        </>
                    )}
                    {kvFetchError && (
                        <>
                            <div className='w-full h-[75vh] flex items-center justify-center'>
                                <Alert variant='destructive' className='w-fit'>
                                    <AlertCircle className='h-4 w-4' />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>
                                        {kvFetchError ??
                                            'An unknown error occurred.'}
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </>
                    )}
                    {kvData && (
                        <div>
                            <h1 className='text-3xl font-medium mb-2'>
                                {kvData.name}
                            </h1>
                            <p>{kvData.id}</p>
                            <h3 className='text-xl font-medium mt-4'>
                                Projects
                            </h3>
                            <p className='text-sm font-light'>
                                These are the projects that are bound to this
                                database.
                            </p>
                            <ul>
                                {kvData.projects.map((project) => (
                                    <Link
                                        href={`/projects/${project.id}`}
                                        key={project.id}>
                                        <li
                                            className='border border-border p-2 hover:bg-accent mt-2 text-xl'
                                            key={project.id}>
                                            {project.name} V{project.version}
                                        </li>
                                    </Link>
                                ))}
                                {kvData.projects.length === 0 && (
                                    <p className='text-sm font-light mt-2'>
                                        No projects are bound to this database.
                                    </p>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </MainLayout>
        </>
    );
};
