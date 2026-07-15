import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { policiesService } from '@/services/database';
import PolicyLayout from '@/components/PolicyLayout';

const PrivacyPolicy = () => {
  usePageMeta({ title: 'Privacy Policy', description: 'Read our Privacy Policy to understand how we collect, use, and protect your personal information.' });

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Privacy Policy');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await policiesService.getPolicy('privacy');
        if (data) {
          if (data.title) setTitle(data.title);
          if (data.content) setContent(data.content);
        }
      } catch (error) {
        console.error('Failed to load privacy policy', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <PolicyLayout 
      title={title} 
      content={content} 
      isLoading={isLoading} 
      icon={Shield} 
    />
  );
};

export default PrivacyPolicy;
