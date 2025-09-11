import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Lock, UserPlus, AlertCircle, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    provider?: string;
}

export default function AdminLogin() {
    const [, setLocation] = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [error, setError] = useState('');
    const { toast } = useToast();

    // Check auth status on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch('/api/auth/user', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const userData = await response.json();
                setCurrentUser(userData);
                setLocation('/admin');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Please enter both email and password");
            toast({
                title: "Missing Information",
                description: "Please enter both email and password",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setCurrentUser(data.user);
                toast({
                    title: "Login Successful",
                    description: "Welcome back! Redirecting...",
                });
                setTimeout(() => {
                    setLocation('/admin');
                }, 1000);
            } else {
                setError(data.error || "Login failed");
                toast({
                    title: "Login Failed",
                    description: data.error || "Invalid email or password",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = "Failed to connect to authentication service";
            setError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!email || !password || !firstName) {
            setError("Please fill in all required fields");
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            toast({
                title: "Password Too Short",
                description: "Password must be at least 8 characters long",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password, firstName, lastName }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setCurrentUser(data.user);
                toast({
                    title: "Registration Successful",
                    description: "Account created! Redirecting...",
                });
                setTimeout(() => {
                    setLocation('/admin');
                }, 1000);
            } else {
                setError(data.error || "Registration failed");
                toast({
                    title: "Registration Failed",
                    description: data.error || "Failed to create account",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = "Failed to connect to authentication service";
            setError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = '/api/auth/google';
    };

    const handleQuickAdminAccess = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/admin-access', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({}),
            });

            const data = await response.json();

            if (data.success) {
                setCurrentUser(data.user);
                toast({
                    title: "Admin Access Granted",
                    description: "Redirecting to admin panel...",
                });
                setTimeout(() => {
                    setLocation('/admin');
                }, 1000);
            } else {
                setError("Failed to grant admin access");
                toast({
                    title: "Access Denied",
                    description: "Failed to grant admin access",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Admin access error:', error);
            setError("Failed to connect to authentication service");
            toast({
                title: "Error",
                description: "Failed to connect to authentication service",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });

            setCurrentUser(null);
            toast({
                title: "Logged Out",
                description: "You have been signed out successfully.",
            });
            setLocation('/');
        } catch (error) {
            console.error('Logout error:', error);
            toast({
                title: "Error",
                description: "Failed to sign out completely.",
                variant: "destructive",
            });
        }
    };

    const clearError = () => {
        setError('');
    };

    if (currentUser) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <Database className="h-12 w-12 text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Welcome Back
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                            {currentUser.firstName} {currentUser.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                            {currentUser.email} • {currentUser.role}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={() => setLocation('/admin')}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            Go to Admin Panel
                        </Button>
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="w-full"
                        >
                            Sign Out
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Database className="h-12 w-12 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        TPA Admin Portal
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                        Simplified Authentication System
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <p className="text-sm text-red-600">{error}</p>
                            <button
                                onClick={clearError}
                                className="ml-auto text-red-600 hover:text-red-800"
                                aria-label="Clear error"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    <Tabs defaultValue="signin" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="signin">Sign In</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            <TabsTrigger value="quick">Quick</TabsTrigger>
                        </TabsList>

                        <TabsContent value="signin" className="space-y-4 mt-4">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="signin-email">Email</Label>
                                    <Input
                                        id="signin-email"
                                        type="email"
                                        placeholder="admin@company.com"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            clearError();
                                        }}
                                        disabled={isLoading}
                                        autoComplete="email"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="signin-password">Password</Label>
                                    <Input
                                        id="signin-password"
                                        type="password"
                                        placeholder="Your password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            clearError();
                                        }}
                                        disabled={isLoading}
                                        autoComplete="current-password"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !isLoading) {
                                                handleLogin();
                                            }
                                        }}
                                    />
                                </div>
                                <Button
                                    onClick={handleLogin}
                                    disabled={isLoading || !email || !password}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <LogIn className="h-4 w-4 mr-2" />
                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                </Button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-gray-50 px-2 text-gray-500">Or continue with</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleGoogleLogin}
                                    variant="outline"
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                                        <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    Sign in with Google
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="signup" className="space-y-4 mt-4">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="signup-firstname">First Name *</Label>
                                        <Input
                                            id="signup-firstname"
                                            type="text"
                                            placeholder="John"
                                            value={firstName}
                                            onChange={(e) => {
                                                setFirstName(e.target.value);
                                                clearError();
                                            }}
                                            disabled={isLoading}
                                            autoComplete="given-name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="signup-lastname">Last Name</Label>
                                        <Input
                                            id="signup-lastname"
                                            type="text"
                                            placeholder="Doe"
                                            value={lastName}
                                            onChange={(e) => {
                                                setLastName(e.target.value);
                                                clearError();
                                            }}
                                            disabled={isLoading}
                                            autoComplete="family-name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="signup-email">Email *</Label>
                                    <Input
                                        id="signup-email"
                                        type="email"
                                        placeholder="admin@company.com"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            clearError();
                                        }}
                                        disabled={isLoading}
                                        autoComplete="email"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="signup-password">Password *</Label>
                                    <Input
                                        id="signup-password"
                                        type="password"
                                        placeholder="At least 8 characters"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            clearError();
                                        }}
                                        disabled={isLoading}
                                        minLength={8}
                                        autoComplete="new-password"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Password must be at least 8 characters long
                                    </p>
                                </div>
                                <Button
                                    onClick={handleRegister}
                                    disabled={isLoading || !email || !password || !firstName || password.length < 8}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                                </Button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-gray-50 px-2 text-gray-500">Or continue with</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleGoogleLogin}
                                    variant="outline"
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                                        <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    Sign up with Google
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="quick" className="space-y-4 mt-4">
                            <div className="text-center text-sm text-gray-600 mb-4">
                                Development access only
                            </div>
                            <Button
                                onClick={handleQuickAdminAccess}
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                data-testid="button-admin-access"
                            >
                                <Lock className="h-4 w-4 mr-2" />
                                {isLoading ? 'Granting Access...' : 'Quick Admin Access'}
                            </Button>
                        </TabsContent>
                    </Tabs>

                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            Secure authentication with session management
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}