import React, { useState, useEffect } from 'react';
import { Scale } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { policiesService } from '@/services/database';
import PolicyLayout from '@/components/PolicyLayout';

const TermsConditions = () => {
  usePageMeta({ title: 'Terms & Conditions', description: 'Read our Terms and Conditions for using SHAKTI YOGA services.' });

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Terms & Conditions');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await policiesService.getPolicy('terms');
        if (data) {
          if (data.title) setTitle(data.title);
          if (data.content) setContent(data.content);
        }
      } catch (error) {
        console.error('Failed to load terms policy', error);
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
      icon={Scale} 
    />
  );
};

export default TermsConditions;
