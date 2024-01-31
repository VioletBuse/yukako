import { Route, Switch } from 'wouter';
import { AuthPage } from '@/pages/auth';
import { ThemeProvider } from '@/components/theme-provider.tsx';
import { Toaster } from '@/components/ui/sonner.tsx';

function App() {
    return (
        <>
            <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
                <Toaster richColors />
                <Switch>
                    <Route path='/auth' component={AuthPage}></Route>
                </Switch>
            </ThemeProvider>
        </>
    );
}

export default App;
