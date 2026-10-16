import React from 'react';

export const KpiCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = 'bg-blue-50 text-blue-600 border-blue-100',
  trend,
  trendPositive = true,
  progressBar,
  badgeText,
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden ${
        onClick ? 'cursor-pointer hover:border-blue-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-800">
              {value}
            </h3>
            {badgeText && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {badgeText}
              </span>
            )}
          </div>
        </div>

        <div className={`p-3 rounded-xl border ${iconBg} shadow-xs transition-transform duration-200 hover:scale-105`}>
          <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
        </div>
      </div>

      {(subtitle || trend !== undefined || progressBar !== undefined) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
          {progressBar !== undefined && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Completion</span>
                <span>{progressBar}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, progressBar))}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            {trend && (
              <span className={`inline-flex items-center font-semibold gap-1 ${
                trendPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                <span>{trendPositive ? '↑' : '↓'}</span>
                <span>{trend}</span>
              </span>
            )}
            {subtitle && (
              <span className="text-slate-500">{subtitle}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
