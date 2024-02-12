import React, { useState } from 'react';
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
    FolderGit2,
    Github,
    HomeIcon,
    LayoutDashboard,
    Loader2,
    LogOut,
    Moon,
    MoreVertical,
    Sun,
    Terminal,
    Users,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import {
    useAuth,
    useRequireLoggedIn,
    useUser,
} from '@/lib/hooks/data-hooks/auth.ts';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { useListProjects } from '@/lib/hooks/data-hooks/list-projects';
import { useUsersList } from '@/lib/hooks/data-hooks/users';
import { CommandLoading } from 'cmdk';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/components/theme-provider';

// const sidebarLinkClass =
//     'w-full justify-start ' +
//     buttonVariants({ variant: 'ghost' })
//         .replace('justify-center', '')
//         .replace('px-4', 'px-2')
//         .replace('py-2', 'py-1');

type CommandBarProps = {
    open: boolean;
    onChangeOpen: (open: boolean | ((val: boolean) => boolean)) => void;
};

const CommandBar: React.FC<CommandBarProps> = ({ open, onChangeOpen }) => {
    const [, setLocation] = useLocation();
    const [projects] = useListProjects();
    const [users] = useUsersList();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onChangeOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    return (
        <>
            <CommandDialog open={open} onOpenChange={onChangeOpen}>
                <CommandInput placeholder='Type a command or search...' />
                <CommandList>
                    <CommandEmpty>No Commands Found...</CommandEmpty>
                    <CommandGroup heading='Navigation'>
                        <CommandItem
                            value='home-page-navigate'
                            onSelect={() => setLocation('/')}>
                            <HomeIcon className='mr-2 w-4 h-4' />
                            <span>Home</span>
                        </CommandItem>
                        <CommandItem
                            value='projects-page-navigate'
                            onSelect={() => setLocation('/projects')}>
                            <LayoutDashboard className='mr-2 w-4 h-4' />
                            <span>Projects</span>
                        </CommandItem>
                        <CommandItem
                            value='users-page-navigate'
                            onSelect={() => setLocation('/users')}>
                            <Users className='mr-2 w-4 h-4' />
                            <span>Users</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading='Projects'>
                        {projects === null && (
                            <CommandLoading>
                                Loading Project List...
                            </CommandLoading>
                        )}
                        {projects !== null &&
                            projects.map((project) => (
                                <CommandItem
                                    key={project.id}
                                    value={`navigate-specific-project-${project.id}`}
                                    onSelect={() =>
                                        setLocation(`/projects/${project.id}`)
                                    }>
                                    <FolderGit2 className='mr-2 w-4 h-4' />
                                    <span>
                                        View Project{' '}
                                        <span className='italic font-medium'>
                                            {project.name}
                                        </span>
                                    </span>
                                </CommandItem>
                            ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading='Users'>
                        {users === null && (
                            <CommandLoading>
                                Loading User List...
                            </CommandLoading>
                        )}
                        {users !== null &&
                            users.map((user) => (
                                <CommandItem
                                    key={user.uid}
                                    value={`navigate-specific-user-${user.uid}`}
                                    onSelect={() =>
                                        setLocation(`/users/${user.uid}`)
                                    }>
                                    <CircleUserRound className='mr-2 w-4 h-4' />
                                    <span>
                                        View User{' '}
                                        <span className='italic font-medium'>
                                            {user.username}
                                        </span>
                                    </span>
                                </CommandItem>
                            ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
};

type Props = {
    children: React.ReactNode;
    selectedTab?: 'home' | 'projects' | 'users';
    breadcrumbs: (
        | {
              name: string;
              href: string | null;
              loading: false;
          }
        | {
              loading: true;
              name?: null;
              href?: null;
          }
    )[];
};

export const MainLayout = (props: Props) => {
    const { theme, setTheme } = useTheme();

    const [userData, , userLoading] = useUser();
    useRequireLoggedIn();

    const [, setLocation] = useLocation();
    const { logout } = useAuth();

    const [cmdBarOpen, setCmdBarOpen] = useState(false);

    return (
        <>
            <CommandBar open={cmdBarOpen} onChangeOpen={setCmdBarOpen} />
            <div className='w-screen h-screen flex flex-col'>
                <div className='px-4 py-2 flex items-center justify-between'>
                    <div className='flex flex-row items-center gap-x-3'>
                        <Link href='/' className='font-semibold text-xl'>
                            Yukako
                        </Link>
                        {props.breadcrumbs.length > 0 &&
                            props.breadcrumbs.map((crumb, _idx) => (
                                <React.Fragment key={_idx}>
                                    <span className='text-lg font-light'>
                                        /
                                    </span>
                                    {crumb.loading && (
                                        <Skeleton className='h-6 w-24' />
                                    )}
                                    {!crumb.loading && crumb.href && (
                                        <Link
                                            className='text-md font-light'
                                            href={crumb.href}>
                                            {crumb.name}
                                        </Link>
                                    )}
                                    {!crumb.loading && !crumb.href && (
                                        <span className='text-md font-light'>
                                            {crumb.name}
                                        </span>
                                    )}
                                </React.Fragment>
                            ))}
                    </div>
                    <div className='flex flex-row gap-2'>
                        <Button
                            variant='secondary'
                            onClick={() => setCmdBarOpen(!cmdBarOpen)}>
                            <Terminal className='w-4 h-4 mr-2' />
                            {cmdBarOpen ? 'Close' : 'Open'} Command Menu
                            <span className='ml-5 px-2 py-1 text-xs bg-background hover:bg-background/50'>
                                ⌘ + K
                            </span>
                        </Button>
                        <Button
                            variant='secondary'
                            onClick={() =>
                                setTheme(theme === 'light' ? 'dark' : 'light')
                            }>
                            {theme === 'light' ? (
                                <Moon className='w-4 h-4 mr-2' />
                            ) : (
                                <Sun className='w-4 h-4 mr-2' />
                            )}
                            {theme === 'light' ? 'Dark' : 'Light'} Mode
                        </Button>
                        <Button variant='secondary' asChild>
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
