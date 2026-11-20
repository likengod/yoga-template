import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  description,
  icon: Icon,
  actions,
  badge,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-yoga-sage/20">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-yoga-sage/15 border border-yoga-sage/30 flex items-center justify-center shrink-0 text-yoga-forest shadow-xs">
            <Icon size={20} />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-yoga-forest tracking-tight">
              {title}
            </h2>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-yoga-forest/70 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
};

export default AdminHeader;
