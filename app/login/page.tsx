'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ShieldAlert, User, Lock, KeyRound, Eye, EyeOff } from 'lucide-react';

export default function UnifiedLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        storage.init();
        const user = storage.getCurrentUser();
        if (user) {
            if (user.role === 'ADMIN') {
                router.push('/');
            } else {
                router.push('/pos');
            }
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const user = await storage.login(username, password);
            setIsLoading(false);

            if (user) {
                toast.success(`Welcome back, ${user.name}!`);
                if (user.role === 'ADMIN') {
                    router.push('/');
                } else {
                    router.push('/pos');
                }
            } else {
                toast.error('Invalid credentials');
            }
        } catch (error: any) {
            setIsLoading(false);
            toast.error(error.message || 'Login failed. Please check your connection.');
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />

            <Card className="z-10 w-full max-w-md border-slate-800 bg-slate-900/50 shadow-2xl backdrop-blur-xl">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-blue-500/20">
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-3xl font-bold text-transparent">
                            WMS Login
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Enter your credentials to access your terminal
                        </CardDescription>
                    </div>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-slate-300">Username</Label>
                            <div className="relative group">
                                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-blue-400" />
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="your_username"
                                    className="border-slate-800 bg-slate-950/50 pl-10 text-slate-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">Password</Label>
                            <div className="relative group">
                                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-blue-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="border-slate-800 bg-slate-950/50 pl-10 pr-10 text-slate-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-blue-900/20 hover:from-indigo-500 hover:to-blue-500 focus:ring-blue-500/50"
                            size="lg"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                    Logging in...
                                </span>
                            ) : 'Sign In'}
                        </Button>
                        <p className="text-center text-xs text-slate-500">
                            Enterprise Security • Authorized Access Only
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
