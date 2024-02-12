import { useUser } from '@/lib/hooks/data-hooks/auth.ts';
import { MainLayout } from '@/layouts/main.tsx';

export const HomePage: React.FC = () => {
    const [data, error, loading] = useUser();

    console.log({ data, error, loading });

    return (
        <>
            <MainLayout
                breadcrumbs={[{ loading: false, name: 'home', href: '/' }]}
                selectedTab='home'>
                <>
                    <div className='mb-2'>
                        <h1 className='text-3xl font-medium'>Home</h1>
                    </div>
                </>
            </MainLayout>
        </>
    );
};
