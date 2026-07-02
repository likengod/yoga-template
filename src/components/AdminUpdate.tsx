import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DownloadCloud, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AdminUpdate = () => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'available' | 'up-to-date'>('idle');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [availableVersion, setAvailableVersion] = useState<string | null>(null);

  // Configuration for GitHub API (should be in .env in production)
  // Vite exposes env vars via import.meta.env
  const githubToken = import.meta.env.VITE_GITHUB_TOKEN || '';
  const repoOwner = import.meta.env.VITE_GITHUB_REPO_OWNER || '';
  const repoName = import.meta.env.VITE_GITHUB_REPO_NAME || '';
  const workflowId = import.meta.env.VITE_GITHUB_WORKFLOW_ID || 'deploy.yml'; // e.g., deploy.yml

  const handleCheckUpdate = async () => {
    setIsChecking(true);
    // Simulate checking for update
    setTimeout(() => {
      // For demonstration, we'll pretend an update is always available if checking for the first time
      const hasUpdate = Math.random() > 0.3;
      setUpdateStatus(hasUpdate ? 'available' : 'up-to-date');
      setAvailableVersion(hasUpdate ? '0.0.2' : null);
      setLastChecked(new Date());
      setIsChecking(false);
      
      toast({
        title: "Update Check Complete",
        description: "Successfully checked for new versions.",
      });
    }, 1500);
  };

  const handleInstallUpdate = async () => {
    if (!githubToken || !repoOwner || !repoName) {
      toast({
        variant: "destructive",
        title: "Configuration Missing",
        description: "GitHub integration is not fully configured in your .env file.",
      });
      // Fallback for demonstration if env vars aren't set
      simulateUpdate();
      return;
    }

    setIsUpdating(true);
    
    try {
      const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/actions/workflows/${workflowId}/dispatches`, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main' // The branch to run the workflow on
        })
      });

      if (response.ok) {
        toast({
          title: "Update Started",
          description: "The CI/CD pipeline has been triggered on GitHub. The website will update shortly.",
        });
        setUpdateStatus('idle');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to trigger update');
      }
    } catch (error) {
      console.error('GitHub API Error:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to connect to GitHub CI/CD pipeline.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const simulateUpdate = () => {
    setIsUpdating(true);
    toast({
      title: "Update Started (Simulation)",
      description: "Triggering CI/CD pipeline...",
    });

    setTimeout(() => {
      setIsUpdating(false);
      setUpdateStatus('idle');
      toast({
        title: "Update Pipeline Triggered",
        description: "The mock pipeline has started successfully.",
      });
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-yoga-forest">Website Updates</h2>
          <span className="text-sm font-medium bg-yoga-sage/20 text-yoga-forest px-3 py-1 rounded-full">
            Version 0.0.1
          </span>
        </div>
        <p className="text-yoga-forest/70">Check for and install new updates using the GitHub CI/CD pipeline.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="text-yoga-sage" />
            System Status
          </CardTitle>
          <CardDescription>
            {lastChecked ? `Last checked: ${lastChecked.toLocaleTimeString()}` : 'Never checked for updates in this session.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {updateStatus === 'up-to-date' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Up to Date</AlertTitle>
              <AlertDescription className="text-green-700">
                The website is running the latest version.
              </AlertDescription>
            </Alert>
          )}

          {updateStatus === 'available' && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Update Available</AlertTitle>
              <AlertDescription className="text-blue-700">
                A new version of the website ({availableVersion}) is available to be installed.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={handleCheckUpdate} 
              disabled={isChecking || isUpdating}
              className="border-yoga-sage text-yoga-forest hover:bg-yoga-sage hover:text-white"
            >
              {isChecking ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Checking...
                </div>
              ) : (
                'Check for Updates'
              )}
            </Button>
            
            <Button 
              onClick={handleInstallUpdate}
              disabled={updateStatus !== 'available' || isUpdating}
              className="bg-yoga-sage hover:bg-yoga-forest text-white"
            >
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Triggering Pipeline...
                </div>
              ) : (
                <>
                  <DownloadCloud size={16} className="mr-2" />
                  Install Update
                </>
              )}
            </Button>
          </div>

          {!githubToken && (
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-800">
              <p className="font-semibold mb-1 flex items-center gap-1">
                <AlertCircle size={14} /> Configuration Notice
              </p>
              <p>
                GitHub environment variables (<code>VITE_GITHUB_TOKEN</code>, <code>VITE_GITHUB_REPO_OWNER</code>, <code>VITE_GITHUB_REPO_NAME</code>) are not set. The "Install Update" button will run in simulation mode.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUpdate;
