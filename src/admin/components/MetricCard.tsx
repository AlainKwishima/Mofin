import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  badge?: string;
  highlight?: 'default' | 'green' | 'amber' | 'magenta';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  badge,
  highlight = 'default',
  onClick,
}) => {
  const getBadgeStyle = () => {
    switch (highlight) {
      case 'green':
        return 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20';
      case 'amber':
        return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
      case 'magenta':
        return 'text-[#fe45e2] bg-[#fe45e2]/10 border-[#fe45e2]/20';
      default:
        return 'text-[#52525b] bg-[#ececee] border-transparent';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 border border-[#ececee] shadow-xs flex flex-col justify-between transition-all ${
        onClick ? 'cursor-pointer hover:border-[#10b981]/40 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#71717a]">{label}</span>
        {Icon && (
          <div className="p-2 rounded-xl bg-[#f4f4f5] text-[#18181b]">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-3xl md:text-4xl font-bold tracking-tight text-[#09090b]">
          {value}
        </span>
        {badge && (
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getBadgeStyle()}`}>
            {badge}
          </span>
        )}
      </div>

      {subtext && <p className="text-xs text-[#71717a] mt-2 font-normal">{subtext}</p>}
    </div>
  );
};
