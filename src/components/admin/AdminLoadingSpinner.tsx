import React from 'react';

interface AdminLoadingSpinnerProps {
  message?: string;
}

const AdminLoadingSpinner = ({ message = 'Loading...' }: AdminLoadingSpinnerProps) => {
  return (
    <div className="text-center py-12 flex flex-col items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yoga-sage mb-4"></div>
      <p className="text-yoga-forest font-medium">{message}</p>
    </div>
  );
};

export default AdminLoadingSpinner;
