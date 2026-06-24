import { useProjectData } from './hooks/useProjectData';
import { useProjectHistory } from './hooks/useProjectHistory';
import { CURRENCY_SYMBOLS } from './types';
import { StatusBadge } from './components/StatusBadge';
import { MetricCard } from './components/MetricCard';
import { InputSection } from './components/InputSection';
import { BudgetBreakdownChart } from './components/BudgetBreakdownChart';
import { ProfitComparisonChart } from './components/ProfitComparisonChart';
import { HoursControlChart } from './components/HoursControlChart';
import { MarginIndicatorChart } from './components/MarginIndicatorChart';
import { ProjectHistory } from './components/ProjectHistory';
import './App.css';

function getStatusRecommendation(status: string): string {
  switch (status) {
    case 'healthy':
      return 'Проєкт зберігає цільову прибутковість.';
    case 'belowTarget':
      return 'Проєкт залишається прибутковим, але прогнозована маржа нижча за цільову.';
    case 'critical':
      return 'Маржа майже вичерпана. Варто обмежити додаткові ітерації або погодити додатковий бюджет.';
    case 'loss':
      return 'Проєкт прогнозовано йде в мінус. Потрібно переглянути обсяг робіт, бюджет або витрати.';
    default:
      return '';
  }
}

function getMetricVariant(status: string) {
  switch (status) {
    case 'healthy': return 'positive' as const;
    case 'belowTarget': return 'warning' as const;
    case 'critical': return 'critical' as const;
    case 'loss': return 'loss' as const;
    default: return 'default' as const;
  }
}

function App() {
  const { inputs, metrics, updateField, resetToDefaults } = useProjectData();
  const {
    history,
    notification,
    addSnapshot,
    removeRecord,
    clearAll,
    exportToExcel,
  } = useProjectHistory();
  const symbol = CURRENCY_SYMBOLS[inputs.currency];

  const fmt = (val: number) =>
    `${symbol}${val.toLocaleString('uk-UA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  const fmtPercent = (val: number) =>
    `${val.toFixed(1)}%`;

  const statusVariant = getMetricVariant(metrics.status);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__left">
          <h1 className="app-header__title">Калькулятор прибутковості проєкту</h1>
          {inputs.projectName && (
            <span className="app-header__project-name">{inputs.projectName}</span>
          )}
        </div>
        <div className="app-header__right">
          <div className="app-header__budget">
            <span className="app-header__budget-label">Загальний бюджет</span>
            <span className="app-header__budget-value">{fmt(metrics.totalProjectBudget)}</span>
          </div>
          <StatusBadge status={metrics.status} />
        </div>
      </header>

      <div className="app-layout">
        <aside className="app-sidebar">
          <InputSection
            inputs={inputs}
            totalBudget={metrics.totalProjectBudget}
            estimatedTotalHours={metrics.estimatedTotalHours}
            onUpdate={updateField}
            onReset={resetToDefaults}
          />
        </aside>

        <main className="app-main">
          <div className="recommendation-banner" data-status={metrics.status}>
            {getStatusRecommendation(metrics.status)}
          </div>

          <div className="metrics-grid">
            <MetricCard
              title="Прогнозований прибуток"
              value={fmt(metrics.projectedProfit)}
              subtitle={`Маржа: ${fmtPercent(metrics.projectedMarginPercent)}`}
              helper="Очікуваний прибуток після завершення проєкту з урахуванням прогнозованих годин і всіх витрат."
              variant={statusVariant}
            />

            <MetricCard
              title="Поточний прибуток"
              value={fmt(metrics.currentProfit)}
              subtitle={`Маржа: ${fmtPercent(metrics.currentMarginPercent)}`}
              helper="Прибуток на поточний момент з урахуванням уже витрачених годин."
              variant={metrics.currentProfit >= 0 ? 'positive' : 'loss'}
            />

            <MetricCard
              title="Безпечний залишок годин"
              value={metrics.remainingSafeHours >= 0
                ? `${metrics.remainingSafeHours.toFixed(1)} год`
                : `−${Math.abs(metrics.remainingSafeHours).toFixed(1)} год`
              }
              helper="Скільки годин ще можна витратити, щоб зберегти цільову маржу."
              variant={metrics.remainingSafeHours >= 0 ? 'positive' : 'loss'}
              alert={metrics.remainingSafeHours < 0
                ? `Безпечний ліміт уже перевищено на ${Math.abs(metrics.remainingSafeHours).toFixed(1)} год.`
                : undefined
              }
            />

            <MetricCard
              title="Точка беззбитковості"
              value={`${metrics.breakEvenHours.toFixed(1)} год`}
              subtitle={metrics.hoursUntilBreakEven > 0
                ? `Залишилось: ${metrics.hoursUntilBreakEven.toFixed(1)} год`
                : undefined
              }
              helper="Після цієї кількості годин проєкт перестає бути прибутковим."
              variant={metrics.hoursUntilBreakEven > 0 ? 'default' : 'loss'}
              alert={metrics.hoursUntilBreakEven <= 0
                ? 'Проєкт уже перевищив точку беззбитковості.'
                : undefined
              }
            />

            <MetricCard
              title="Статус проєкту"
              value={<StatusBadge status={metrics.status} />}
              helper="Оцінка стану проєкту на основі прогнозованої маржі та прибутку."
              variant={statusVariant}
            />

            <MetricCard
              title="Необхідний бюджет"
              value={fmt(metrics.requiredBudgetForTargetMargin)}
              helper="Орієнтовна сума, за яку проєкт мав би бути проданий, щоб зберегти цільову маржу."
              variant={metrics.budgetGap > 0 ? 'warning' : 'positive'}
              alert={metrics.budgetGap > 0
                ? `Поточний бюджет нижчий за необхідний на ${fmt(metrics.budgetGap)}.`
                : undefined
              }
            />
          </div>

          <div className="charts-section">
            <BudgetBreakdownChart inputs={inputs} metrics={metrics} />
            <div className="charts-row">
              <ProfitComparisonChart metrics={metrics} currency={inputs.currency} />
              <MarginIndicatorChart inputs={inputs} metrics={metrics} />
            </div>
            <HoursControlChart inputs={inputs} metrics={metrics} />
          </div>

          <ProjectHistory
            history={history}
            notification={notification}
            onSave={(note) => addSnapshot(inputs, metrics, note)}
            onDelete={removeRecord}
            onClearAll={clearAll}
            onExport={exportToExcel}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
