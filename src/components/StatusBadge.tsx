import type { ProjectStatus } from '../types';

const STATUS_CONFIG: Record<ProjectStatus, { label: string; className: string }> = {
  healthy: { label: 'Здоровий проєкт', className: 'status-healthy' },
  belowTarget: { label: 'Нижче цільової маржі', className: 'status-below-target' },
  critical: { label: 'Критичний ризик', className: 'status-critical' },
  loss: { label: 'Проєкт у мінусі', className: 'status-loss' },
};

interface StatusBadgeProps {
  status: ProjectStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
}
