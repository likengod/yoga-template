import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminEmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 px-4 border border-dashed border-yoga-sage/30 rounded-2xl bg-white/50 flex flex-col items-center justify-center my-4 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-yoga-sage/15 flex items-center justify-center text-yoga-forest mb-3">
        <Icon size={24} />
      </div>
      <h3 className="text-base font-semibold text-yoga-forest mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-yoga-forest/70 max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button
          onClick={onAction}
          className="bg-yoga-sage hover:bg-yoga-forest text-white text-xs h-9"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default AdminEmptyState;
