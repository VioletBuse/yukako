import { MainLayout } from '@/layouts/main';
import { useUsers } from '@/lib/hooks/data-hooks/users';
import { Loader2 } from 'lucide-react';
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

export const UsersPage: React.FC = () => {
    const [userList, usersFetchError, loadingUsers] = useUsers();

    return (
        <>
            <MainLayout selectedTab='users'>
                <>
                    {loadingUsers && (
                        <div className='w-full h-[95vh] flex items-center justify-center'>
                            <p className='flex flex-row gap-x-2 items-center'>
                                <Loader2 className='w-4 h-4 animate-spin' />
                                Loading
                            </p>
                        </div>
                    )}
                    {usersFetchError && (
                        <div className='w-full h-[95vh] flex items-center justify-center'>
                            <p className='text-red-500'>
                                {usersFetchError ??
                                    'There was an unknown error loading users.'}
                            </p>
                        </div>
                    )}
                    {userList !== null && (
                        <div>
                            {/*<ul>*/}
                            {/*    {userList.map((user) => (*/}
                            {/*        <li key={user.uid}>{user.username}</li>*/}
                            {/*    ))}*/}
                            {/*</ul>*/}
                            <Table>
                                <TableCaption>
                                    A list of Yukako Cluster Users
                                </TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Username</TableHead>
                                        <TableHead>User Id</TableHead>
                                        <TableHead>
                                            Account Creation Date
                                        </TableHead>
                                        <TableHead>Invited By</TableHead>
                                        <TableHead>Invitees</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {userList.map((user) => (
                                        <TableRow key={user.uid}>
                                            <TableCell>
                                                {user.username}
                                            </TableCell>
                                            <TableCell>{user.uid}</TableCell>
                                            <TableCell>
                                                {new Date(
                                                    user.createdAt,
                                                ).toDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {user.invitedBy?.username ??
                                                    'null'}
                                            </TableCell>
                                            <TableCell>
                                                {user.invitees.length === 0 && (
                                                    <Button
                                                        className='w-full'
                                                        disabled
                                                        variant='secondary'>
                                                        None
                                                    </Button>
                                                )}
                                                {user.invitees.length > 0 && (
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant='secondary'
                                                                className='w-full'>
                                                                Invited Users
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className='min-w-56 p-4 grid grid-cols-1 gap-2'>
                                                            {user.invitees.map(
                                                                (val) => (
                                                                    <p
                                                                        key={
                                                                            val.uid
                                                                        }>
                                                                        {
                                                                            val.username
                                                                        }
                                                                    </p>
                                                                ),
                                                            )}
                                                        </PopoverContent>
                                                    </Popover>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </>
            </MainLayout>
        </>
    );
};
