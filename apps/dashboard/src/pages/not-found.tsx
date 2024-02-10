import { MainLayout } from '@/layouts/main';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export const NotFoundPage: React.FC = () => {
    return (
        <MainLayout breadcrumbs={[]}>
            <div className='h-[90vh] w-full flex items-center justify-center'>
                <Alert variant='destructive' className='w-fit'>
                    <AlertTitle>
                        You seem to have gotten lost somewhere.
                    </AlertTitle>
                    <AlertDescription>
                        This page doesn't exist. Want to go back home?
                    </AlertDescription>
                    <Button asChild className='mt-2'>
                        <Link href='/'>Go Home</Link>
                    </Button>
                </Alert>
            </div>
        </MainLayout>
    );
};
