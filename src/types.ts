export type Currency = 'USD' | 'EUR' | 'UAH' | 'GBP';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  UAH: '₴',
  GBP: '£',
};

export interface ProjectInputs {
  projectName: string;
  currency: Currency;
  originalFixedBudget: number;
  additionalApprovedBudget: number;
  hourlyRate: number;
  actualHoursSpent: number;
  estimatedRemainingHours: number;
  artDirectionPercent: number;
  managementPercent: number;
  developmentCost: number;
  otherDirectCosts: number;
  salesCommissionPercent: number;
  taxPercent: number;
  bufferPercent: number;
  targetMarginPercent: number;
  minimumMarginPercent: number;
}

export type ProjectStatus = 'healthy' | 'belowTarget' | 'critical' | 'loss';

export interface ProjectMetrics {
  totalProjectBudget: number;
  estimatedTotalHours: number;
  currentDesignCost: number;
  projectedDesignCost: number;
  currentArtDirectionCost: number;
  projectedArtDirectionCost: number;
  currentManagementCost: number;
  projectedManagementCost: number;
  salesCost: number;
  taxCost: number;
  bufferCost: number;
  nonDesignCosts: number;
  currentTotalCost: number;
  projectedTotalCost: number;
  currentProfit: number;
  projectedProfit: number;
  currentMarginPercent: number;
  projectedMarginPercent: number;
  effectiveHourlyRate: number;
  targetProfit: number;
  minimumAcceptableProfit: number;
  maxSafeHoursForTargetMargin: number;
  remainingSafeHours: number;
  breakEvenHours: number;
  hoursUntilBreakEven: number;
  requiredBudgetForTargetMargin: number;
  budgetGap: number;
  status: ProjectStatus;
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  healthy: 'Здоровий проєкт',
  belowTarget: 'Нижче цільової маржі',
  critical: 'Критичний ризик',
  loss: 'Проєкт у мінусі',
};

export interface ProjectHistoryRecord {
  id: string;
  createdAt: string;
  note?: string;
  inputs: ProjectInputs;
  metrics: ProjectMetrics & {
    projectStatusLabel: string;
  };
}

export const DEFAULT_INPUTS: ProjectInputs = {
  projectName: '',
  currency: 'USD',
  originalFixedBudget: 10000,
  additionalApprovedBudget: 0,
  hourlyRate: 50,
  actualHoursSpent: 40,
  estimatedRemainingHours: 20,
  artDirectionPercent: 20,
  managementPercent: 15,
  developmentCost: 3000,
  otherDirectCosts: 0,
  salesCommissionPercent: 10,
  taxPercent: 0,
  bufferPercent: 5,
  targetMarginPercent: 30,
  minimumMarginPercent: 15,
};
