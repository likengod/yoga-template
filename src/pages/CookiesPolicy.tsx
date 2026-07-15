import React, { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { policiesService } from '@/services/database';
import PolicyLayout from '@/components/PolicyLayout';

const CookiesPolicy = () => {
  usePageMeta({ title: 'Cookies Policy', description: 'Read our Cookies Policy to understand how we use cookies and tracking technologies.' });

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Cookies Policy');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await policiesService.getPolicy('cookies');
        if (data) {
          if (data.title) setTitle(data.title);
          if (data.content) setContent(data.content);
        }
      } catch (error) {
        console.error('Failed to load cookies policy', error);
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
      icon={Cookie} 
    />
  );
};

export default CookiesPolicy;
