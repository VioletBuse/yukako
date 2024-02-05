import { MainLayout } from '@/layouts/main';
import { useUsers } from '@/lib/hooks/users';

export const UsersPage: React.FC = () => {
    const data = useUsers();
    console.log(data);

    return (
        <>
            <MainLayout>
                <h1>Users</h1>
            </MainLayout>
        </>
    );
};
