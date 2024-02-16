import { MainLayout } from '@/layouts/main';
import { useUsersList } from '@/lib/hooks/data-hooks/users/users';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCaption,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
} from '@/components/ui/table';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { useAuthToken, useServerUrl } from '@/lib/hooks/wrapper';
import { Wrapper } from '@yukako/wrapper';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Link } from 'wouter';

const NewUserTokenForm: React.FC = () => {
    const [open, setOpen] = useState(false);
    const auth_token = useAuthToken();
    const server = useServerUrl();

    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState('');
    const [error, setError] = useState('');

    const onOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setToken('');
            setError('');
        }
        setOpen(isOpen);
    };

    const onGenerateToken = async () => {
        setLoading(true);
        const wrapper = Wrapper(server, auth_token ?? '');
        const [res, err] = await wrapper.auth.createNewUserToken();
        setLoading(false);

        if (res) {
            setError('');
            setToken(res.token);
        } else {
            setError(err);
            setToken('');
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogTrigger asChild>
                    <Button>Generate New User Token</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate New User Token</DialogTitle>
                        <DialogDescription>
                            This token will only be valid for 24 hours.
                            Alternatively you can create a token with
                            &#96;yukactl auth new-token&#96;.
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <Button
                            className='mb-2'
                            disabled={loading}
                            onClick={onGenerateToken}>
                            {loading && (
                                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                            )}
                            Generate
                        </Button>
                        {token && (
                            <p className='bg-accent p-2 w-full'>{token}</p>
                        )}
                        {error && (
                            <Alert variant='destructive'>
                                <AlertCircle className='w-4 h-4 mr-2' />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            <p className='text-muted-foreground'>
                Want to invite a new user? Press this button to generate a new
                user token. This token can be used to create a new user account.
            </p>
        </>
    );
};

export const UsersPage: React.FC = () => {
    const [userList, usersFetchError, loadingUsers] = useUsersList();

    return (
        <>
            <MainLayout
                breadcrumbs={[
                    { name: 'users', href: '/users', loading: false },
                ]}
                selectedTab='users'>
                <>
                    <div className='mb-2'>
                        <h1 className='text-3xl font-medium mb-2'>Users</h1>
                        <NewUserTokenForm />
                    </div>
                    {loadingUsers && (
                        <div className='w-full h-[70vh] flex items-center justify-center'>
                            <Loader2 className='w-8 h-8 animate-spin' />
                        </div>
                    )}
                    {usersFetchError && (
                        <Alert variant='destructive' className='mb-2'>
                            <AlertCircle className='h-4 w-4 mr-2' />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                {usersFetchError}
                            </AlertDescription>
                        </Alert>
                    )}
                    {userList && (
                        <div className='grid gap-2 grid-cols-1'>
                            {userList.map((user) => (
                                <Link
                                    href={`/users/${user.uid}`}
                                    key={user.uid}>
                                    <Card className='hover:animate-pulse hover:bg-accent/40'>
                                        <CardHeader>
                                            <CardTitle>
                                                {user.username}
                                            </CardTitle>
                                            <CardDescription>
                                                Joined{' '}
                                                {new Date(
                                                    user.createdAt,
                                                ).toLocaleDateString()}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            </MainLayout>
        </>
    );
};
