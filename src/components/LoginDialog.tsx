import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, User, UserPlus, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
interface LoginDialogProps {
  onLoginSuccess: (user: {
    username: string;
    role: string;
    id: string;
  }) => void;
}
const LoginDialog = ({
  onLoginSuccess
}: LoginDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    toast
  } = useToast();

  // Demo credentials - now includes user IDs and expanded roles
  const validCredentials = [{
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    email: 'admin@example.com'
  }, {
    id: '2',
    username: 'yoga_admin',
    password: 'shakti2024',
    role: 'admin',
    email: 'yoga_admin@example.com'
  }, {
    id: '3',
    username: 'superadmin',
    password: 'super123',
    role: 'superadmin',
    email: 'superadmin@example.com'
  }, {
    id: '4',
    username: 'instructor',
    password: 'teacher123',
    role: 'user',
    email: 'instructor@example.com'
  }, {
    id: '5',
    username: 'student',
    password: 'student123',
    role: 'user',
    email: 'student@example.com'
  }];
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check stored users first
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const allUsers = [...validCredentials, ...storedUsers];
    const user = allUsers.find(cred => cred.username === loginData.username && cred.password === loginData.password);
    if (user) {
      if (user.role === 'admin' || user.role === 'superadmin') {
        try {
          const res = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: loginData.password })
          });
          const data = await res.json();
          if (data.success && data.token) {
            localStorage.setItem('adminToken', data.token);
          }
        } catch (err) {
          console.error('Backend login failed:', err);
        }
      }

      // Store user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      toast({
        title: "Welcome back! 🧘‍♀️",
        description: `Successfully logged in as ${user.username}`
      });
      onLoginSuccess(user);
      setOpen(false);
      setLoginData({
        username: '',
        password: ''
      });
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid username or password. Please try again."
      });
    }
    setIsLoading(false);
  };
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validation
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again."
      });
      setIsLoading(false);
      return;
    }
    if (signupData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Password must be at least 6 characters long"
      });
      setIsLoading(false);
      return;
    }

    // Check if username already exists
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const allUsers = [...validCredentials, ...storedUsers];
    if (allUsers.some(user => user.username === signupData.username)) {
      toast({
        variant: "destructive",
        title: "Username Taken",
        description: "This username already exists. Please choose another."
      });
      setIsLoading(false);
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username: signupData.username,
      email: signupData.email,
      password: signupData.password,
      role: 'user' // Default role for new signups
    };

    // Store user
    const updatedUsers = [...storedUsers, newUser];
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    toast({
      title: "Welcome to SHAKTI YOGA THEME! 🙏",
      description: `Account created successfully for ${newUser.username}`
    });
    onLoginSuccess(newUser);
    setOpen(false);
    setSignupData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setIsLoading(false);
  };
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hidden md:inline-flex border-yoga-sage text-yoga-forest hover:bg-yoga-sage hover:text-white">
          <LogIn size={16} className="mr-2" />
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-yoga-cream to-white border-yoga-sage/20">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl text-yoga-forest">
            <User size={24} className="text-yoga-sage" />
            Account Login
          </DialogTitle>
          <div className="text-sm text-yoga-forest/60 mt-2">
            Digital Dev partner{' '}
            <a href="https://gorillatechsolution.com" target="_blank" rel="noopener noreferrer" className="text-yoga-sage hover:text-yoga-forest font-medium underline">
              Gorilla Tech Solution
            </a>
          </div>
          <DialogDescription className="text-yoga-forest/70">
            Sign in to your account or create a new one to start your yoga journey.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-yoga-sage/10">
            <TabsTrigger value="login" className="data-[state=active]:bg-yoga-sage data-[state=active]:text-white">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-yoga-sage data-[state=active]:text-white">
              Create Account
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username" className="text-yoga-forest font-medium flex items-center gap-2">
                  <User size={16} />
                  Username
                </Label>
                <Input id="login-username" type="text" placeholder="Enter your username" value={loginData.username} onChange={e => setLoginData(prev => ({
                ...prev,
                username: e.target.value
              }))} className="border-yoga-sage/30 focus:border-yoga-sage" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-yoga-forest font-medium flex items-center gap-2">
                  <Lock size={16} />
                  Password
                </Label>
                <div className="relative">
                  <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={loginData.password} onChange={e => setLoginData(prev => ({
                  ...prev,
                  password: e.target.value
                }))} className="border-yoga-sage/30 focus:border-yoga-sage pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yoga-forest/50 hover:text-yoga-forest">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              
              
              <Button type="submit" className="w-full bg-yoga-sage hover:bg-yoga-forest text-white py-2.5" disabled={isLoading}>
                {isLoading ? <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </div> : <>
                    <LogIn size={16} className="mr-2" />
                    Sign In
                  </>}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-username" className="text-yoga-forest font-medium flex items-center gap-2">
                  <User size={16} />
                  Username
                </Label>
                <Input id="signup-username" type="text" placeholder="Choose a username" value={signupData.username} onChange={e => setSignupData(prev => ({
                ...prev,
                username: e.target.value
              }))} className="border-yoga-sage/30 focus:border-yoga-sage" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-yoga-forest font-medium flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </Label>
                <Input id="signup-email" type="email" placeholder="Enter your email" value={signupData.email} onChange={e => setSignupData(prev => ({
                ...prev,
                email: e.target.value
              }))} className="border-yoga-sage/30 focus:border-yoga-sage" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-yoga-forest font-medium flex items-center gap-2">
                  <Lock size={16} />
                  Password
                </Label>
                <div className="relative">
                  <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="Create a password" value={signupData.password} onChange={e => setSignupData(prev => ({
                  ...prev,
                  password: e.target.value
                }))} className="border-yoga-sage/30 focus:border-yoga-sage pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yoga-forest/50 hover:text-yoga-forest">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password" className="text-yoga-forest font-medium flex items-center gap-2">
                  <Lock size={16} />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input id="signup-confirm-password" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" value={signupData.confirmPassword} onChange={e => setSignupData(prev => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))} className="border-yoga-sage/30 focus:border-yoga-sage pr-10" required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yoga-forest/50 hover:text-yoga-forest">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yoga-cream to-yoga-sand p-4 rounded-lg border border-yoga-sage/20">
                <p className="text-yoga-forest/80 text-sm">
                  New users will be created with "User" role by default. 
                  Contact an admin to upgrade your permissions.
                </p>
              </div>
              
              <Button type="submit" className="w-full bg-yoga-sage hover:bg-yoga-forest text-white py-2.5" disabled={isLoading}>
                {isLoading ? <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </div> : <>
                    <UserPlus size={16} className="mr-2" />
                    Create Account
                  </>}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>;
};
export default LoginDialog;
