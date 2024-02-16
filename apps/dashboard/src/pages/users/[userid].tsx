import { MainLayout } from '@/layouts/main';
import { useGetUserById } from '@/lib/hooks/data-hooks/users/get-user-by-id';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from 'wouter';

type SpecificUserPageProps = {
    userid: string;
};

export const SpecificUserPage: React.FC<SpecificUserPageProps> = ({
    userid,
}) => {
    const [userData, userFetchError, loadingUser] = useGetUserById(userid);

    console.log(userData, userFetchError, loadingUser);

    return (
        <MainLayout
            breadcrumbs={[
                {
                    name: 'users',
                    href: '/users',
                    loading: false,
                },
                userData
                    ? {
                          name: userData.username,
                          href: `/users/${userData.uid}`,
                          loading: false,
                      }
                    : { loading: true },
            ]}
            selectedTab='users'>
            {loadingUser && (
                <>
                    <div className='w-full h-[75vh] flex items-center justify-center'>
                        <p className='flex flex-row items-center'>
                            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                            Loading user data...
                        </p>
                    </div>
                </>
            )}
            {userFetchError && (
                <>
                    <div className='w-full h-[75vh] flex flex-row items-center justify-center'>
                        <Alert variant='destructive'>
                            <AlertCircle className='w-4 h-4 mr-2' />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                {userFetchError ?? 'An unknown error occurred.'}
                            </AlertDescription>
                        </Alert>
                    </div>
                </>
            )}
            {userData && (
                <>
                    <h1 className='text-3xl font-medium'>
                        {userData.username}
                    </h1>
                    <p className='font-light'>
                        Joined {new Date(userData.createdAt).toDateString()}
                        <br />
                        {userData.invitedBy
                            ? `Invited by ${userData.invitedBy.username}`
                            : 'First user in the system.'}
                    </p>
                    {userData.invitees.length > 0 && (
                        <>
                            <h3 className='text-xl font-normal mt-2'>
                                Invited Users
                            </h3>
                            {userData.invitees.map((invitee) => (
                                <Link
                                    href={`/users/${invitee.uid}`}
                                    key={invitee.uid}>
                                    <div className='bg-accent/50 hover:bg-accent border border-border p-2 mt-2'>
                                        <h1 className='text-lg font-medium'>
                                            {invitee.username}
                                        </h1>
                                    </div>
                                </Link>
                            ))}
                        </>
                    )}
                </>
            )}
        </MainLayout>
    );
};
