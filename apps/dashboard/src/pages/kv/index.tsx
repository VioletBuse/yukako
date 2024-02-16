import { MainLayout } from '@/layouts/main';
import { useListKvDatabases } from '@/lib/hooks/data-hooks/kv/list-kv-databases';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuthToken, useServerUrl } from '@/lib/hooks/wrapper';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Wrapper } from '@yukako/wrapper';
import { Link, useLocation } from 'wouter';

const CreateNewKvForm: React.FC = () => {
    const [, setLocation] = useLocation();
    const [open, setOpen] = useState(false);

    const server = useServerUrl();
    const authToken = useAuthToken();

    const [loading, setLoading] = useState(false);

    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            if (!authToken) {
                throw new Error('No auth token found.');
            }

            if (loading) return;

            const wrapper = Wrapper(server, authToken);

            if (!name) {
                setError('Name cannot be empty.');
            }

            setLoading(true);

            const [res, err] = await wrapper.kv.create(name);

            setLoading(false);

            if (err) {
                setError(err);
            } else {
                setName('');
                setError('');
                toast.success('Kv Database created successfully!');
                setOpen(false);
                setLocation(`/kv/${res?.id}`);
            }
        } catch (e) {
            let message = 'An error occurred while creating the Kv Database.';

            if (e instanceof Error) {
                message = e.message;
            }

            toast.error(message);
            setError(message);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className='w-4 h-4 mr-2' />
                        New Kv Database
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a new Kv Database</DialogTitle>
                        <DialogDescription>
                            You can create a new Kv Database here. You can also
                            use the &#96;yukactl kv create&#96; command to
                            create a new Kv Database.
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <form onSubmit={handleSubmit}>
                            <Label htmlFor='new-kv-name'>Name</Label>
                            <Input
                                id='new-kv-name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <Button
                                disabled={loading}
                                type='submit'
                                className='mt-4'>
                                {loading && (
                                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                )}
                                Create Kv Database
                            </Button>
                            {error && (
                                <Alert variant='destructive' className='mt-4'>
                                    <AlertCircle className='h-4 w-4 mr-2' />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>
                                        {error ?? 'An unknown error occurred.'}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export const KvMainPage: React.FC = () => {
    const [kvDatabases, kvFetchError, loadingKvs] = useListKvDatabases();

    return (
        <>
            <MainLayout
                breadcrumbs={[{ name: 'kv', href: '/kv', loading: false }]}
                selectedTab='kv'>
                <div className='pb-4 top-0 sticky z-10 bg-gradient-to-b from-background from-80% to-transparent'>
                    <h1 className='text-3xl font-medium mb-2'>Kv Databases</h1>
                    <CreateNewKvForm />
                </div>
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
                {kvDatabases !== null && (
                    <>
                        <div className='grid grid-cols-1 gap-2'>
                            {kvDatabases.map((kv) => (
                                <Link href={`/kv/${kv.id}`} key={kv.id}>
                                    <div className='border border-border p-2 hover:bg-accent'>
                                        <h2 className='text-xl font-medium'>
                                            {kv.name}
                                        </h2>
                                        <p className='text-sm text-gray-500'>
                                            {kv.id}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </MainLayout>
        </>
    );
};
