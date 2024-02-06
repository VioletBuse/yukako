import React from 'react';
import { Button } from '@/components/ui/button.tsx';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import {
    CircleUserRound,
    Github,
    GithubIcon,
    HomeIcon,
    LayoutDashboard,
    Loader2,
    LogOut,
    MoreVertical,
    Users,
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
    selectedTab?: 'home' | 'projects' | 'users';
};

// const sidebarLinkClass =
//     'w-full justify-start ' +
//     buttonVariants({ variant: 'ghost' })
//         .replace('justify-center', '')
//         .replace('px-4', 'px-2')
//         .replace('py-2', 'py-1');

export const MainLayout = (props: Props) => {
    const [userData, , userLoading] = useUser();
    useRequireLoggedIn();

    const [, setLocation] = useLocation();
    const { logout } = useAuth();

    return (
        <>
            <div className='w-screen h-screen flex flex-col'>
                <div className='px-4 py-2 flex items-center justify-between'>
                    <h1 className='font-bold text-2xl'>Yukako</h1>
                    <div>
                        <Button variant='ghost' asChild>
                            <a href='https://github.com/JulianBuse/yukako'>
                                <Github className='w-4 h-4 mr-2' /> Github
                            </a>
                        </Button>
                    </div>
                </div>
                <ResizablePanelGroup
                    className='w-screen grow overflow-hidden border-t border-t-border'
                    direction='horizontal'>
                    <ResizablePanel
                        className='flex flex-col justify-between items-start'
                        defaultSize={22}>
                        <div className='grid grid-cols-1 w-full'>
                            {/*<div className='mb-8 mt-2'>*/}
                            {/*    <Link className='p-4' href='/'>*/}
                            {/*        Yukako Dashboard*/}
                            {/*    </Link>*/}
                            {/*</div>*/}
                            <Button
                                className='justify-start'
                                variant={
                                    props.selectedTab === 'home'
                                        ? undefined
                                        : 'ghost'
                                }
                                asChild>
                                <Link href='/'>
                                    <HomeIcon className='mr-2 w-4 h-4' />
                                    Home
                                </Link>
                            </Button>
                            <Button
                                className='justify-start'
                                variant={
                                    props.selectedTab === 'projects'
                                        ? undefined
                                        : 'ghost'
                                }
                                asChild>
                                <Link href='/projects'>
                                    <LayoutDashboard className='mr-2 w-4 h-4' />
                                    Projects
                                </Link>
                            </Button>
                            <Button
                                className='justify-start'
                                variant={
                                    props.selectedTab === 'users'
                                        ? undefined
                                        : 'ghost'
                                }
                                asChild>
                                <Link href='/users'>
                                    <Users className='mr-2 w-4 h-4' />
                                    Users
                                </Link>
                            </Button>
                        </div>
                        <div className='flex flex-row items-center justify-between w-full p-2'>
                            <p className='ml-2 text-md font-light'>
                                {userLoading
                                    ? 'Loading...'
                                    : userData?.username || 'Unknown'}
                            </p>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant='secondary' size='icon'>
                                        {userLoading && (
                                            <Loader2 className='h-4 w-4 animate-spin' />
                                        )}
                                        {!userLoading && (
                                            <MoreVertical className='h-4 w-4' />
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className='w-56'>
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
