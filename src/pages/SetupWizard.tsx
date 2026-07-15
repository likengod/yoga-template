import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Database, Shield, CheckCircle2, Loader2, Play, Eye, EyeOff } from 'lucide-react';

const SetupWizard = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [dbProvider, setDbProvider] = useState<'mysql' | 'sqlite'>('mysql');
  
  // Database configuration
  const [dbConfig, setDbConfig] = useState({
    dbHost: '127.0.0.1',
    dbPort: '3306',
    dbUser: 'root',
    dbPassword: '',
    dbName: 'shaakti',
    sqlitePath: './dev.db',
  });

  // Admin configuration
  const [adminConfig, setAdminConfig] = useState({
    adminEmail: 'admin@example.com',
    adminPassword: '',
    confirmPassword: '',
    jwtSecret: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    port: '3000',
  });

  // Installation status
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'restarting' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [progressMsg, setProgressMsg] = useState('');

  const [showDbPassword, setShowDbPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleDbConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDbConfig({
      ...dbConfig,
      [e.target.id]: e.target.value,
    });
  };

  const handleAdminConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminConfig({
      ...adminConfig,
      [e.target.id]: e.target.value,
    });
  };

  const nextStep = () => {
    if (step === 1) {
      if (dbProvider === 'mysql') {
        if (!dbConfig.dbHost || !dbConfig.dbPort || !dbConfig.dbUser || !dbConfig.dbName) {
          toast({ variant: 'destructive', title: 'Error', description: 'Please fill all database details.' });
          return;
        }
      } else {
        if (!dbConfig.sqlitePath) {
          toast({ variant: 'destructive', title: 'Error', description: 'Please fill SQLite file path.' });
          return;
        }
      }
      setStep(2);
    } else if (step === 2) {
      if (!adminConfig.adminEmail) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please enter admin email.' });
        return;
      }
      if (!adminConfig.adminPassword || adminConfig.adminPassword.length < 6) {
        toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 6 characters.' });
        return;
      }
      if (adminConfig.adminPassword !== adminConfig.confirmPassword) {
        toast({ variant: 'destructive', title: 'Error', description: 'Passwords do not match.' });
        return;
      }
      setStep(3);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const startInstallation = async () => {
    setInstallStatus('installing');
    setProgressMsg('Saving configuration files and generating database client...');
    setErrorMessage('');

    try {
      const response = await fetch('/api/setup/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dbProvider,
          ...dbConfig,
          ...adminConfig,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Configuration setup failed.');
      }

      setInstallStatus('restarting');
      setProgressMsg('Server is restarting to apply changes... (this takes ~5-10 seconds)');
      pollServerStatus();
    } catch (err: any) {
      setInstallStatus('failed');
      setErrorMessage(err.message || 'Setup encountered an error. Please check your credentials.');
      toast({ variant: 'destructive', title: 'Setup Failed', description: err.message || 'An error occurred.' });
    }
  };

  const pollServerStatus = () => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > 30) {
        clearInterval(interval);
        setInstallStatus('failed');
        setErrorMessage('Server took too long to restart. Please refresh or check server logs.');
        return;
      }

      try {
        const response = await fetch('/api/setup/status');
        const data = await response.json();
        if (response.ok && data.isConfigured === true) {
          clearInterval(interval);
          setInstallStatus('success');
          setProgressMsg('System successfully configured!');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
      } catch (e) {
        // Server is restarting and currently down. Ignore error and keep polling.
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yoga-forest via-[#1e3d30] to-[#12241d] flex items-center justify-center p-4">
      {/* Dynamic Background Elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-yoga-sage/20 rounded-full blur-3xl z-0"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-yellow-600/10 rounded-full blur-3xl z-0"></div>

      <Card className="w-full max-w-xl bg-white/95 backdrop-blur-md shadow-2xl border border-yoga-sage/30 relative z-10 overflow-hidden">
        {/* Header Ribbon */}
        <div className="h-2 bg-gradient-to-r from-yoga-sage via-yellow-500 to-yoga-forest"></div>
        
        <CardHeader className="text-center pt-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center border border-yoga-sage/20 shadow-md p-1 overflow-hidden">
              <img 
                src="/gorillatechsolution-uploads/001a3e79-c253-4f0f-8842-ed9a57850b57.png" 
                alt="Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-yoga-forest font-serif">
            Shakti Yoga
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            First-Time Installation Setup Wizard
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 sm:px-10 pb-8 pt-2">
          {/* Progress Indicators */}
          <div className="flex justify-between items-center mb-8 relative">
            <div className="absolute h-[2px] bg-slate-200 left-0 right-0 top-1/2 -translate-y-1/2 z-0"></div>
            <div 
              className="absolute h-[2px] bg-yoga-sage left-0 top-1/2 -translate-y-1/2 transition-all duration-300 z-0"
              style={{ width: `${(step - 1) * 50}%` }}
            ></div>

            {[1, 2, 3].map((num) => (
              <div 
                key={num} 
                className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
                  step > num 
                    ? 'bg-yoga-sage border-yoga-sage text-white shadow-md' 
                    : step === num 
                    ? 'bg-white border-yoga-sage text-yoga-sage ring-4 ring-yoga-sage/10 shadow-md' 
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {step > num ? <CheckCircle2 className="h-5 w-5" /> : num}
              </div>
            ))}
          </div>

          {/* STEP 1: DATABASE SETTINGS */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-yoga-forest font-bold text-lg border-b pb-2 mb-4">
                <Database className="h-5 w-5 text-yoga-sage" />
                <h2>MySQL Database Configuration</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dbHost">Database Host</Label>
                  <Input 
                    id="dbHost"
                    value={dbConfig.dbHost}
                    onChange={handleDbConfigChange}
                    placeholder="127.0.0.1"
                    className="border-slate-200 focus-visible:ring-yoga-sage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dbPort">Database Port</Label>
                  <Input 
                    id="dbPort"
                    value={dbConfig.dbPort}
                    onChange={handleDbConfigChange}
                    placeholder="3306"
                    className="border-slate-200 focus-visible:ring-yoga-sage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dbUser">Username</Label>
                  <Input 
                    id="dbUser"
                    value={dbConfig.dbUser}
                    onChange={handleDbConfigChange}
                    placeholder="root"
                    className="border-slate-200 focus-visible:ring-yoga-sage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dbPassword">Password</Label>
                  <div className="relative">
                    <Input 
                      id="dbPassword"
                      type={showDbPassword ? "text" : "password"}
                      value={dbConfig.dbPassword}
                      onChange={handleDbConfigChange}
                      placeholder="Database Password"
                      className="border-slate-200 focus-visible:ring-yoga-sage pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDbPassword(!showDbPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showDbPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="dbName">Database Name</Label>
                  <Input 
                    id="dbName"
                    value={dbConfig.dbName}
                    onChange={handleDbConfigChange}
                    placeholder="shaakti"
                    className="border-slate-200 focus-visible:ring-yoga-sage"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ADMIN & PORT SETTINGS */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-yoga-forest font-bold text-lg border-b pb-2 mb-4">
                <Shield className="h-5 w-5 text-yoga-sage" />
                <h2>Admin Credentials & Site Server</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email Address</Label>
                <Input 
                  id="adminEmail"
                  type="email"
                  value={adminConfig.adminEmail}
                  onChange={handleAdminConfigChange}
                  placeholder="admin@example.com"
                  className="border-slate-200 focus-visible:ring-yoga-sage"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword">Admin Password</Label>
                <div className="relative">
                  <Input 
                    id="adminPassword"
                    type={showAdminPassword ? "text" : "password"}
                    value={adminConfig.adminPassword}
                    onChange={handleAdminConfigChange}
                    placeholder="Set Admin Password (Min. 6 chars)"
                    className="border-slate-200 focus-visible:ring-yoga-sage pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Admin Password</Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={adminConfig.confirmPassword}
                    onChange={handleAdminConfigChange}
                    placeholder="Repeat Admin Password"
                    className="border-slate-200 focus-visible:ring-yoga-sage pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="port">Application Port</Label>
                  <Input 
                    id="port"
                    value={adminConfig.port}
                    onChange={handleAdminConfigChange}
                    placeholder="3000"
                    className="border-slate-200 focus-visible:ring-yoga-sage"
                  />
                  <p className="text-xs text-slate-400">Port the express backend will listen to.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jwtSecret">JWT Secret Key</Label>
                  <Input 
                    id="jwtSecret"
                    value={adminConfig.jwtSecret}
                    onChange={handleAdminConfigChange}
                    placeholder="Auto-generated secret"
                    className="border-slate-200 focus-visible:ring-yoga-sage"
                  />
                  <p className="text-xs text-slate-400">Security secret for signing login tokens.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: INSTALLATION PROGRESS */}
          {step === 3 && (
            <div className="space-y-6 py-6 text-center animate-fade-in">
              {installStatus === 'idle' && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center text-yellow-600 shadow-md">
                      <Play className="h-6 w-6 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-yoga-forest">Ready to Configure</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    The wizard is ready to write the configuration to your environment and build the database client schema.
                  </p>
                  <Button onClick={startInstallation} className="bg-yoga-sage hover:bg-yoga-forest text-white px-8">
                    Start Setup Now
                  </Button>
                </div>
              )}

              {(installStatus === 'installing' || installStatus === 'restarting') && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Loader2 className="h-12 w-12 text-yoga-sage animate-spin" />
                  </div>
                  <h3 className="text-lg font-bold text-yoga-forest">Installing & Setting Up</h3>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                    <div className={`h-full bg-yoga-sage rounded-full animate-pulse transition-all duration-500 ${installStatus === 'restarting' ? 'w-4/5' : 'w-2/5'}`}></div>
                  </div>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto italic">
                    {progressMsg}
                  </p>
                </div>
              )}

              {installStatus === 'success' && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600 shadow-md">
                      <CheckCircle2 className="h-8 w-8 animate-bounce" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-green-700">Setup Completed!</h3>
                  <p className="text-slate-500 text-sm">
                    Database configured and migrations complete. Redirecting you to the home page...
                  </p>
                </div>
              )}

              {installStatus === 'failed' && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <span className="text-4xl">❌</span>
                  </div>
                  <h3 className="text-lg font-bold text-red-600">Installation Failed</h3>
                  <p className="text-red-500 text-sm bg-red-50 border border-red-200 p-3 rounded-lg max-w-md mx-auto text-left whitespace-pre-wrap font-mono text-xs">
                    {errorMessage}
                  </p>
                  <Button onClick={() => setStep(1)} variant="outline" className="border-slate-200 mt-2">
                    Go Back and Fix
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>

        {step < 3 && (
          <CardFooter className="flex justify-between border-t border-slate-100 bg-slate-50/50 py-4 px-6 sm:px-10">
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep} 
              disabled={step === 1}
              className="border-slate-200"
            >
              Previous
            </Button>
            <Button 
              type="button" 
              onClick={nextStep}
              className="bg-yoga-sage hover:bg-yoga-forest text-white"
            >
              Next Step
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default SetupWizard;
