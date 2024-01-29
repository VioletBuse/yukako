import { MainLayout } from './layouts/main.tsx';
import { GlobalTheme } from '@carbon/react';

function App() {
    return (
        <>
            <GlobalTheme theme='g100'>
                <MainLayout>
                    <h1>Dashboard</h1>
                </MainLayout>
            </GlobalTheme>
        </>
    );
}

export default App;
