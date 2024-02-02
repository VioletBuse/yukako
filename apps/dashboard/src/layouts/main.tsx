import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button.tsx';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import {
    CircleUserRound,
    Home,
    Loader2,
    LogOut,
    MoreVertical,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth, useRequireLoggedIn, useUser } from '@/lib/hooks/auth.ts';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';

type Props = {
    children: React.ReactNode;
};

const sidebarLinkClass =
    'w-full justify-start ' +
    buttonVariants({ variant: 'ghost' })
        .replace('justify-center', '')
        .replace('px-4', 'px-2')
        .replace('py-2', 'py-1');

export const MainLayout = (props: Props) => {
    const user = useUser();
    useRequireLoggedIn();

    const [, setLocation] = useLocation();
    const { logout } = useAuth();

    return (
        <>
            <div className='w-screen h-screen flex flex-col'>
                <div className='px-2 py-2 flex items-center justify-between'>
                    <Link href='/'>
                        <h1 className='font-bold text-2xl'>Yukako</h1>
                    </Link>
                    <div></div>
                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant='secondary'>
                                    {user.loading && (
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    )}
                                    {!user.loading && (
                                        <MoreVertical className='mr-2 h-4 w-4' />
                                    )}
                                    {user.loading
                                        ? 'Loading...'
                                        : user.data?.username}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem
                                        onSelect={() =>
                                            setLocation('/profile')
                                        }>
                                        <CircleUserRound className='mr-2 h-4 w-4' />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={logout}>
                                        <LogOut className='mr-2 h-4 w-4' />
                                        <span>Log Out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <ResizablePanelGroup
                    className='border-t border-border grow'
                    direction='horizontal'>
                    <ResizablePanel defaultSize={22}>
                        <ScrollArea className='h-full w-full'>
                            <Link className={sidebarLinkClass} href='/'>
                                <Home className='mr-2 h-4 w-4' />
                                Home
                            </Link>
                        </ScrollArea>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel>
                        <ScrollArea className='p-2 h-full w-full'>
                            {props.children}
                        </ScrollArea>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </>
    );
};
