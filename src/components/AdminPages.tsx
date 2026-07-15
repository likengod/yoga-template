import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText, Save, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { policiesService } from '@/services/database';

const POLICY_TYPES = [
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'terms', label: 'Terms & Conditions' },
  { id: 'refund', label: 'Refund Policy' },
  { id: 'cookies', label: 'Cookies Policy' }
];

const AdminPages = () => {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState('privacy');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPolicy(selectedType);
  }, [selectedType]);

  const fetchPolicy = async (type: string) => {
    setIsLoading(true);
    try {
      const data = await policiesService.getPolicy(type);
      if (data) {
        setTitle(data.title || POLICY_TYPES.find(p => p.id === type)?.label || '');
        setContent(data.content || '');
      }
    } catch (error) {
      console.error('Error fetching policy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch page content.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await policiesService.updatePolicy(selectedType, { title, content });
      toast({
        title: "Success",
        description: "Page content updated successfully.",
      });
    } catch (error) {
      console.error('Error saving policy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save page content.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-yoga-forest mb-2">Pages Edit</h2>
        <p className="text-yoga-forest/70">Manage the content for your legal and policy pages.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-yoga-sage" />
            Select Page to Edit
          </CardTitle>
          <CardDescription>Choose a policy page to update its content.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md mb-6">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a page" />
              </SelectTrigger>
              <SelectContent>
                {POLICY_TYPES.map(policy => (
                  <SelectItem key={policy.id} value={policy.id}>{policy.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-yoga-sage" />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <Label htmlFor="page-title">Page Title</Label>
                <Input 
                  id="page-title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="mt-1"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="page-content">Page Content (HTML/Text)</Label>
                </div>
                <Textarea 
                  id="page-content" 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="<h2>Privacy Policy</h2><p>Your content here...</p>"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  You can use HTML tags (e.g., &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;) to format your content. The text will be rendered dynamically on the website.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-yoga-sage hover:bg-yoga-forest text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPages;
