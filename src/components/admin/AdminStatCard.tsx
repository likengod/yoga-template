import React from 'react';
import { Card } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  subtitle?: string;
  iconColorClass?: string;
  iconBgClass?: string;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  iconColorClass = 'text-yoga-forest',
  iconBgClass = 'bg-yoga-sage/20 border border-yoga-sage/30',
}) => {
  return (
    <Card className="p-5 border border-yoga-sage/20 bg-white/90 shadow-xs hover:shadow-sm transition-all">
      <div className="flex items-center space-x-3.5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass}`}>
          <Icon className={`w-6 h-6 ${iconColorClass}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-yoga-forest/70 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-yoga-forest mt-0.5 truncate">
            {value}
          </p>
          {trend && (
            <p className={`text-xs flex items-center mt-0.5 font-medium ${trend.isPositive !== false ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend.isPositive !== false ? (
                <TrendingUp className="w-3.5 h-3.5 mr-1 shrink-0" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 mr-1 shrink-0" />
              )}
              <span>{trend.value}</span>
            </p>
          )}
          {subtitle && !trend && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AdminStatCard;
