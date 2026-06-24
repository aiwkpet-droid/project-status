import type { ProjectInputs, ProjectMetrics, ProjectStatus } from '../types';

export function calculateProjectMetrics(inputs: ProjectInputs): ProjectMetrics {
  const totalProjectBudget = inputs.originalFixedBudget + inputs.additionalApprovedBudget;
  const estimatedTotalHours = inputs.actualHoursSpent + inputs.estimatedRemainingHours;

  const currentDesignCost = inputs.actualHoursSpent * inputs.hourlyRate;
  const projectedDesignCost = estimatedTotalHours * inputs.hourlyRate;

  const currentArtDirectionCost = currentDesignCost * inputs.artDirectionPercent / 100;
  const projectedArtDirectionCost = projectedDesignCost * inputs.artDirectionPercent / 100;

  const currentManagementCost = currentDesignCost * inputs.managementPercent / 100;
  const projectedManagementCost = projectedDesignCost * inputs.managementPercent / 100;

  const salesCost = totalProjectBudget * inputs.salesCommissionPercent / 100;
  const taxCost = totalProjectBudget * inputs.taxPercent / 100;
  const bufferCost = totalProjectBudget * inputs.bufferPercent / 100;

  const nonDesignCosts =
    inputs.developmentCost +
    inputs.otherDirectCosts +
    salesCost +
    taxCost +
    bufferCost;

  const currentTotalCost =
    currentDesignCost +
    currentArtDirectionCost +
    currentManagementCost +
    inputs.developmentCost +
    inputs.otherDirectCosts +
    salesCost +
    taxCost +
    bufferCost;

  const projectedTotalCost =
    projectedDesignCost +
    projectedArtDirectionCost +
    projectedManagementCost +
    inputs.developmentCost +
    inputs.otherDirectCosts +
    salesCost +
    taxCost +
    bufferCost;

  const currentProfit = totalProjectBudget - currentTotalCost;
  const projectedProfit = totalProjectBudget - projectedTotalCost;

  const currentMarginPercent = totalProjectBudget > 0
    ? (currentProfit / totalProjectBudget) * 100
    : 0;
  const projectedMarginPercent = totalProjectBudget > 0
    ? (projectedProfit / totalProjectBudget) * 100
    : 0;

  const effectiveHourlyRate =
    inputs.hourlyRate * (1 + inputs.artDirectionPercent / 100 + inputs.managementPercent / 100);

  const targetProfit = totalProjectBudget * inputs.targetMarginPercent / 100;
  const minimumAcceptableProfit = totalProjectBudget * inputs.minimumMarginPercent / 100;
  const maxAllowedCostForTargetMargin = totalProjectBudget - targetProfit;
  const maxAllowedDesignRelatedCost = maxAllowedCostForTargetMargin - nonDesignCosts;

  const maxSafeHoursForTargetMargin = effectiveHourlyRate > 0
    ? maxAllowedDesignRelatedCost / effectiveHourlyRate
    : 0;

  const remainingSafeHours = maxSafeHoursForTargetMargin - inputs.actualHoursSpent;

  const breakEvenHours = effectiveHourlyRate > 0
    ? (totalProjectBudget - nonDesignCosts) / effectiveHourlyRate
    : 0;

  const hoursUntilBreakEven = breakEvenHours - inputs.actualHoursSpent;

  const requiredBudgetForTargetMargin = inputs.targetMarginPercent < 100
    ? projectedTotalCost / (1 - inputs.targetMarginPercent / 100)
    : 0;

  const budgetGap = requiredBudgetForTargetMargin - totalProjectBudget;

  let status: ProjectStatus;
  if (projectedProfit < 0) {
    status = 'loss';
  } else if (projectedMarginPercent < inputs.minimumMarginPercent) {
    status = 'critical';
  } else if (projectedMarginPercent < inputs.targetMarginPercent) {
    status = 'belowTarget';
  } else {
    status = 'healthy';
  }

  return {
    totalProjectBudget,
    estimatedTotalHours,
    currentDesignCost,
    projectedDesignCost,
    currentArtDirectionCost,
    projectedArtDirectionCost,
    currentManagementCost,
    projectedManagementCost,
    salesCost,
    taxCost,
    bufferCost,
    nonDesignCosts,
    currentTotalCost,
    projectedTotalCost,
    currentProfit,
    projectedProfit,
    currentMarginPercent,
    projectedMarginPercent,
    effectiveHourlyRate,
    targetProfit,
    minimumAcceptableProfit,
    maxSafeHoursForTargetMargin,
    remainingSafeHours,
    breakEvenHours,
    hoursUntilBreakEven,
    requiredBudgetForTargetMargin,
    budgetGap,
    status,
  };
}
