import { MainLayout } from '@/layouts/main';
import { useGetProjectById } from '@/lib/hooks/data-hooks/get-project-by-id';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, Terminal, TerminalSquare } from 'lucide-react';
import { useState } from 'react';
import { useGetVersionsForProject } from '@/lib/hooks/data-hooks/get-versions-paginated';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

type VersionsCardPageProps = {
    projectId: string;
    limit: number;
    page: number;
};

const VersionsCardPage: React.FC<VersionsCardPageProps> = ({
    projectId,
    limit,
    page,
}) => {
    const [versionData, versionLoadError, loadingVersion] =
        useGetVersionsForProject({
            projectId,
            limit,
            page,
        });

    console.log({ versionData, versionLoadError, loadingVersion });

    return (
        <>
            {loadingVersion && (
                <div className='flex flex-row gap-x-2 items-center'>
                    <Loader2 className='w-6 h-6 mr-2 animate-spin' /> Loading...
                </div>
            )}
            {versionLoadError && (
                <Alert variant='destructive'>
                    <AlertCircle className='w-4 h-4 mr-2' />
                    <AlertTitle>
                        An Error has Occurred loading page {page}
                    </AlertTitle>
                </Alert>
            )}
            {versionData &&
                versionData.map((version, idx) => (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-xl flex flex-row items-center'>
                                    V{version.version}
                                    {idx === 0 && page === 1 && (
                                        <Badge className='ml-2'>
                                            Current Version
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    Deployed{' '}
                                    {new Date(
                                        version.deployed_at,
                                    ).toUTCString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type='multiple'>
                                    <AccordionItem value='artifacts'>
                                        <AccordionTrigger>
                                            Artifacts
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            artifact list
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value='bindings'>
                                        <AccordionTrigger>
                                            Bindings
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <Accordion
                                                className='pl-4'
                                                type='multiple'>
                                                <AccordionItem value='json-bindings'>
                                                    <AccordionTrigger>
                                                        Json Bindings
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        content...
                                                    </AccordionContent>
                                                </AccordionItem>
                                                <AccordionItem value='text-bindings'>
                                                    <AccordionTrigger>
                                                        Text Bindings
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        content...
                                                    </AccordionContent>
                                                </AccordionItem>
                                                <AccordionItem value='data-bindings'>
                                                    <AccordionTrigger>
                                                        data Bindings
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        content...
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>
                    </>
                ))}
        </>
    );
};

type VersionsCardProps = {
    projectId: string;
    latestVersion: number | null;
};

const VersionsCard: React.FC<VersionsCardProps> = ({
    projectId,
    latestVersion,
}) => {
    const limit = 5;
    const maxPage =
        latestVersion !== null ? Math.ceil(latestVersion / limit) : 1;

    const [loadedPageCount, setLoadedPageCount] = useState(1);
    const maxPagesReached = loadedPageCount >= maxPage;

    const loadMore = () => {
        if (loadedPageCount < maxPage) {
            setLoadedPageCount(loadedPageCount + 1);
        }
    };

    return (
        <>
            <h1 className='text-2xl font-medium mb-2'>Versions</h1>
            {latestVersion === null && (
                <Alert>
                    <Terminal className='w-6 h-6 mr-2' />
                    <AlertTitle>
                        You have not yet deployed this project!
                    </AlertTitle>
                    <AlertDescription>
                        You can use the &#96;yukactl projects deploy&#96;
                        command to deploy your project. For further information
                        you can reference the docs.
                    </AlertDescription>
                </Alert>
            )}
            {latestVersion !== null && (
                <>
                    <div className='flex flex-col gap-y-2'>
                        {Array.from(
                            { length: loadedPageCount },
                            (_, i) => i + 1,
                        ).map((page) => (
                            <VersionsCardPage
                                key={page}
                                projectId={projectId}
                                limit={limit}
                                page={page}
                            />
                        ))}
                    </div>
                    <Button
                        className='mt-2'
                        disabled={maxPagesReached}
                        onClick={loadMore}>
                        Load More
                    </Button>
                </>
            )}
        </>
    );
};

type Props = {
    id: string;
};

export const ProjectByIdPage: React.FC<Props> = ({ id }) => {
    const [projectData, projectLoadError, loadingProject] =
        useGetProjectById(id);

    return (
        <MainLayout selectedTab='projects'>
            {projectData && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>{projectData.name}</CardTitle>
                            <CardDescription>
                                (id) {projectData.id}
                                <br />
                                (created at){' '}
                                {new Date(
                                    projectData.created_at,
                                ).toDateString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <VersionsCard
                                projectId={id}
                                latestVersion={
                                    projectData.latest_version?.version ?? null
                                }
                            />
                        </CardContent>
                    </Card>
                </>
            )}
        </MainLayout>
    );
};
