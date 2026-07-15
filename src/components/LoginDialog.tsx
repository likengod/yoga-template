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
  triggerClassName?: string;
  triggerText?: string;
}
const LoginDialog = ({
  onLoginSuccess,
  triggerClassName,
  triggerText
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

  // Authentication runs only against the server database in production
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Authenticate against backend
      const loginUrl = '/api/login';
        
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginData.username, password: loginData.password })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.token && data.user) {
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          toast({
            title: "Welcome back! 🧘‍♀️",
            description: `Successfully logged in as ${data.user.username}`
          });
          onLoginSuccess(data.user);
          setOpen(false);
          setLoginData({
            username: '',
            password: ''
          });
          setIsLoading(false);
          return;
        }
      }

      // If backend login fails
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid username or password. Please try again."
      });
    } catch (err) {
      console.error('Authentication check failed:', err);
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An error occurred during login. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signupData.username,
          email: signupData.email,
          password: signupData.password
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          if (data.token) {
            localStorage.setItem('adminToken', data.token);
          }
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          toast({
            title: "Welcome to SHAKTI YOGA THEME! 🙏",
            description: `Account created successfully for ${data.user.username}`
          });
          onLoginSuccess(data.user);
          setOpen(false);
          setSignupData({
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
          });
          return;
        }
      }

      const errData = await res.json();
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: errData.error || "Failed to create account. Please try again."
      });
    } catch (err) {
      console.error('Registration failed:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred during signup."
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={triggerClassName ? "default" : "outline"} 
          size="sm" 
          className={triggerClassName || "hidden md:inline-flex border-yoga-sage text-yoga-forest hover:bg-yoga-sage hover:text-white"}
        >
          <LogIn size={16} className="mr-2" />
          {triggerText || "Login"}
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
