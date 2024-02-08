import { Route, Switch } from 'wouter';
import { AuthPage } from '@/pages/auth';
import { ThemeProvider } from '@/components/theme-provider.tsx';
import { Toaster } from '@/components/ui/sonner.tsx';
import { HomePage } from '@/pages/home.tsx';
import { UsersPage } from '@/pages/users';
import { ProjectsPage } from '@/pages/projects';
import { NotFoundPage } from '@/pages/not-found';
import { ProjectByIdPage } from '@/pages/projects/[id]';

function App() {
    return (
        <>
            <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
                <Toaster richColors />
                <Switch>
                    <Route path='/' component={HomePage}></Route>
                    <Route path='/home' component={HomePage}></Route>

                    <Route path='/users' component={UsersPage}></Route>

                    <Route path='/projects' component={ProjectsPage}></Route>
                    <Route path='/projects/:id'>
                        {(params) => <ProjectByIdPage id={params.id} />}
                    </Route>

                    <Route path='/auth' component={AuthPage}></Route>

                    <Route component={NotFoundPage}></Route>
                </Switch>
            </ThemeProvider>
        </>
    );
}

export default App;
