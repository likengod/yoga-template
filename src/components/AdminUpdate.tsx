import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DownloadCloud, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { defaultSiteSettings } from '@/config/siteSettings';
import { siteSettingsService } from '@/services/database';
import packageJson from '../../package.json';

interface AdminUpdateProps {
  onNavigate?: (tab: string, subTab?: string) => void;
}

const AdminUpdate = ({ onNavigate }: AdminUpdateProps) => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'available' | 'up-to-date'>('idle');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [availableVersion, setAvailableVersion] = useState<string | null>(null);

  // Load GitHub config from Site Settings
  const [githubConfig, setGithubConfig] = useState({
    token: '',
    owner: '',
    repo: ''
  });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await siteSettingsService.getSettings();
        if (data && data.socialLinks) {
          const parsed = JSON.parse(data.socialLinks);
          setGithubConfig({
            token: parsed.githubToken || '',
            owner: parsed.githubRepoOwner || '',
            repo: parsed.githubRepoName || ''
          });
        } else {
          // Fallback to localStorage
          const stored = localStorage.getItem('siteSettings');
          if (stored) {
            const settings = { ...defaultSiteSettings, ...JSON.parse(stored) };
            setGithubConfig({
              token: settings.githubToken || '',
              owner: settings.githubRepoOwner || '',
              repo: settings.githubRepoName || ''
            });
          }
        }
      } catch (e) {
        console.error("Failed to load site settings from database", e);
        // Fallback to localStorage
        const stored = localStorage.getItem('siteSettings');
        if (stored) {
          try {
            const settings = { ...defaultSiteSettings, ...JSON.parse(stored) };
            setGithubConfig({
              token: settings.githubToken || '',
              owner: settings.githubRepoOwner || '',
              repo: settings.githubRepoName || ''
            });
          } catch (err) {
            console.error("Failed to parse site settings", err);
          }
        }
      }
    };

    loadConfig();
  }, []);

  const handleGoToSettings = () => {
    if (onNavigate) {
      onNavigate('site-settings', 'integrations');
    }
  };

  const handleCheckUpdate = async () => {
    if (!githubConfig.token || !githubConfig.owner || !githubConfig.repo) {
      toast({
        variant: "destructive",
        title: "Configuration Missing",
        description: "Please configure GitHub CI/CD settings in Site Settings -> Integrations.",
      });
      return;
    }

    setIsChecking(true);
    
    try {
      const response = await fetch(`https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/package.json`, {
        headers: {
          'Accept': 'application/vnd.github.v3.raw',
          'Authorization': `token ${githubConfig.token}`
        }
      });

      if (response.ok) {
        const remotePackage = await response.json();
        const remoteVersion = remotePackage.version;
        const localVersion = packageJson.version;
        
        setLastChecked(new Date());
        
        if (remoteVersion !== localVersion) {
          setUpdateStatus('available');
          setAvailableVersion(remoteVersion);
        } else {
          setUpdateStatus('up-to-date');
        }
        
        toast({
          title: "Update Check Complete",
          description: "Successfully checked GitHub for new updates.",
        });
      } else {
        throw new Error('Failed to fetch package.json from GitHub');
      }
    } catch (error) {
      console.error('GitHub API Error:', error);
      toast({
        variant: "destructive",
        title: "Check Failed",
        description: error instanceof Error ? error.message : "Failed to connect to GitHub.",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleInstallUpdate = async () => {
    if (!githubConfig.token || !githubConfig.owner || !githubConfig.repo) {
      toast({
        variant: "destructive",
        title: "Configuration Missing",
        description: "GitHub integration is not fully configured.",
      });
      return;
    }

    setIsUpdating(true);
    
    try {
      const response = await fetch(`https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/actions/workflows/deploy.yml/dispatches`, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${githubConfig.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main'
        })
      });

      if (response.ok || response.status === 204) {
        toast({
          title: "Update Started",
          description: "The CI/CD pipeline has been triggered. The website will update shortly.",
        });
        
        setUpdateStatus('up-to-date');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to trigger deployment workflow');
      }
    } catch (error) {
      console.error('GitHub API Error:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to trigger the GitHub CI/CD pipeline.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-yoga-forest">Website Updates</h2>
          <span className="text-sm font-medium bg-yoga-sage/20 text-yoga-forest px-3 py-1 rounded-full">
            Version: v{packageJson.version}
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
                The website is running the latest version from your GitHub repository.
              </AlertDescription>
            </Alert>
          )}

          {updateStatus === 'available' && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Update Available</AlertTitle>
              <AlertDescription className="text-blue-700">
                A new version of the website (v{availableVersion}) is available to be installed.
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
                  Checking GitHub...
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

          {(!githubConfig.token || !githubConfig.owner || !githubConfig.repo) && (
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-800">
              <p className="font-semibold mb-1 flex items-center gap-1">
                <AlertCircle size={14} /> Configuration Notice
              </p>
              <p>
                Please configure your GitHub Repository Owner, Repository Name, and Personal Access Token in the{' '}
                <button 
                  onClick={handleGoToSettings}
                  className="font-bold underline text-yoga-forest hover:text-yoga-sage cursor-pointer bg-transparent border-none p-0 inline"
                >
                  Site Settings &rarr; Integrations & API
                </button>{' '}
                tab to enable OTA updates.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUpdate;
