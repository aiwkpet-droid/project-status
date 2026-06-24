import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  helper: string;
  variant?: 'default' | 'positive' | 'warning' | 'critical' | 'loss';
  alert?: string;
}

export function MetricCard({ title, value, subtitle, helper, variant = 'default', alert }: MetricCardProps) {
  return (
    <div className={`metric-card metric-card--${variant}`}>
      <div className="metric-card__header">
        <h3 className="metric-card__title">{title}</h3>
      </div>
      <div className="metric-card__value">{value}</div>
      {subtitle && <div className="metric-card__subtitle">{subtitle}</div>}
      {alert && <div className="metric-card__alert">{alert}</div>}
      <p className="metric-card__helper">{helper}</p>
    </div>
  );
}
