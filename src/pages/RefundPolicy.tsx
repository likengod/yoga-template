import React, { useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { policiesService } from '@/services/database';
import PolicyLayout from '@/components/PolicyLayout';

const RefundPolicy = () => {
  usePageMeta({ title: 'Refund Policy', description: 'Read our Refund Policy for SHAKTI YOGA classes and programs.' });

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Refund Policy');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await policiesService.getPolicy('refund');
        if (data) {
          if (data.title) setTitle(data.title);
          if (data.content) setContent(data.content);
        }
      } catch (error) {
        console.error('Failed to load refund policy', error);
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
      icon={RefreshCcw} 
    />
  );
};

export default RefundPolicy;
