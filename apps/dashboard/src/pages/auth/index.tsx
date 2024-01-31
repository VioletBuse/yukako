import React from 'react';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs.tsx';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form.tsx';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button.tsx';
import { useAuth } from '@/lib/hooks/auth.ts';
import { toast } from 'sonner';

const loginFormSchema = z.object({
    username: z.string().min(3).max(20),
    password: z.string().min(8),
});

const LoginCard: React.FC = () => {
    const { login } = useAuth();

    const form = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    const onSubmit = async (data: z.infer<typeof loginFormSchema>) => {
        const [res, err] = await login({
            username: data.username,
            password: data.password,
        });

        if (err) {
            toast.error(err);
        } else {
            toast.success('Logged in!');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                    Sign in to your existing account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='space-y-2'>
                        <FormField
                            control={form.control}
                            name='username'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='a cool username'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter your username.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='password'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='password'
                                            placeholder='a cool password'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter your password.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type='submit'>Submit</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

const registerFormSchema = z.object({
    username: z.string().min(3).max(20),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    newAccountToken: z.string(),
});

const RegisterCard: React.FC = () => {
    const form = useForm<z.infer<typeof registerFormSchema>>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            username: '',
            password: '',
            confirmPassword: '',
            newAccountToken: '',
        },
    });

    const onSubmit = async (data: z.infer<typeof registerFormSchema>) => {
        console.log(data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>Create a new account.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='space-y-2'>
                        <FormField
                            control={form.control}
                            name='username'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='a cool username'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter your username.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='password'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='password'
                                            placeholder='a cool password'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter your password.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='confirmPassword'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='password'
                                            placeholder='a cool password'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Confirm your password.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='newAccountToken'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Account Token</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='a cool token'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter your new account token. Unless
                                        this is the first account being created,
                                        you will need to get this from an
                                        existing account.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type='submit'>Submit</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export const AuthPage: React.FC = () => {
    return (
        <>
            <div className='w-screen h-screen flex items-center justify-center'>
                <div className='w-[400px]'>
                    <Tabs defaultValue='login'>
                        <TabsList className='grid w-full grid-cols-2'>
                            <TabsTrigger value='login'>Login</TabsTrigger>
                            <TabsTrigger value='register'>Register</TabsTrigger>
                        </TabsList>
                        <TabsContent value='login'>
                            <LoginCard />
                        </TabsContent>
                        <TabsContent value='register'>
                            <RegisterCard />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
};
