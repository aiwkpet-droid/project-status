import * as XLSX from 'xlsx';
import type { ProjectHistoryRecord } from '../types';
import { CURRENCY_SYMBOLS } from '../types';

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

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

function autoWidth(ws: XLSX.WorkSheet, data: (string | number | undefined)[][]): void {
  const colWidths: number[] = [];
  for (const row of data) {
    row.forEach((cell, i) => {
      const len = cell != null ? String(cell).length : 0;
      colWidths[i] = Math.max(colWidths[i] || 0, Math.min(len + 2, 40));
    });
  }
  ws['!cols'] = colWidths.map(w => ({ wch: w }));
}

function buildHistorySheet(records: ProjectHistoryRecord[]): XLSX.WorkSheet {
  const headers = [
    'Дата збереження',
    'Коментар',
    'Назва проєкту',
    'Валюта',
    'Початковий фіксований бюджет',
    'Додатково погоджений бюджет',
    'Загальний бюджет проєкту',
    'Погодинна ставка',
    'Фактично витрачені години',
    'Прогнозовані години до завершення',
    'Орієнтовна загальна кількість годин',
    'Коефіцієнт артдирекшну, %',
    'Коефіцієнт менеджменту / PM, %',
    'Вартість розробки',
    'Інші прямі витрати',
    'Комісія за продаж, %',
    'Сума комісії за продаж',
    'Податок, %',
    'Сума податку',
    'Резерв / буфер, %',
    'Сума резерву',
    'Поточна загальна собівартість',
    'Прогнозована загальна собівартість',
    'Поточний прибуток',
    'Прогнозований прибуток',
    'Поточна маржа, %',
    'Прогнозована маржа, %',
    'Ефективна погодинна ставка',
    'Цільова маржа, %',
    'Цільовий прибуток',
    'Мінімально допустима маржа, %',
    'Мінімально допустимий прибуток',
    'Безпечний ліміт годин для цільової маржі',
    'Безпечний залишок годин',
    'Точка беззбитковості, год',
    'Годин до точки беззбитковості',
    'Необхідний бюджет для цільової маржі',
    'Розрив бюджету',
    'Статус проєкту',
  ];

  const rows = records.map(r => [
    formatDate(r.createdAt),
    r.note || '',
    r.inputs.projectName,
    r.inputs.currency,
    r.inputs.originalFixedBudget,
    r.inputs.additionalApprovedBudget,
    r.metrics.totalProjectBudget,
    r.inputs.hourlyRate,
    r.inputs.actualHoursSpent,
    r.inputs.estimatedRemainingHours,
    r.metrics.estimatedTotalHours,
    r.inputs.artDirectionPercent,
    r.inputs.managementPercent,
    r.inputs.developmentCost,
    r.inputs.otherDirectCosts,
    r.inputs.salesCommissionPercent,
    r.metrics.salesCost,
    r.inputs.taxPercent,
    r.metrics.taxCost,
    r.inputs.bufferPercent,
    r.metrics.bufferCost,
    r.metrics.currentTotalCost,
    r.metrics.projectedTotalCost,
    r.metrics.currentProfit,
    r.metrics.projectedProfit,
    round2(r.metrics.currentMarginPercent),
    round2(r.metrics.projectedMarginPercent),
    round2(r.metrics.effectiveHourlyRate),
    r.inputs.targetMarginPercent,
    r.metrics.targetProfit,
    r.inputs.minimumMarginPercent,
    r.metrics.minimumAcceptableProfit,
    round2(r.metrics.maxSafeHoursForTargetMargin),
    round2(r.metrics.remainingSafeHours),
    round2(r.metrics.breakEvenHours),
    round2(r.metrics.hoursUntilBreakEven),
    round2(r.metrics.requiredBudgetForTargetMargin),
    round2(r.metrics.budgetGap),
    r.metrics.projectStatusLabel,
  ]);

  const data = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);
  autoWidth(ws, data);
  return ws;
}

function buildLatestRecordSheet(record: ProjectHistoryRecord): XLSX.WorkSheet {
  const sym = CURRENCY_SYMBOLS[record.inputs.currency as keyof typeof CURRENCY_SYMBOLS] || '';
  const m = record.metrics;
  const inp = record.inputs;

  const rows: (string | number)[][] = [
    ['Секція', 'Параметр', 'Значення'],
    [],
    ['Проєкт', 'Назва проєкту', inp.projectName || '—'],
    ['', 'Валюта', inp.currency],
    ['', 'Дата розрахунку', formatDate(record.createdAt)],
    ['', 'Коментар', record.note || '—'],
    [],
    ['Введені параметри', 'Початковий фіксований бюджет', `${sym}${inp.originalFixedBudget}`],
    ['', 'Додатково погоджений бюджет', `${sym}${inp.additionalApprovedBudget}`],
    ['', 'Загальний бюджет проєкту', `${sym}${m.totalProjectBudget}`],
    ['', 'Погодинна ставка', `${sym}${inp.hourlyRate}`],
    ['', 'Фактично витрачені години', `${inp.actualHoursSpent} год`],
    ['', 'Прогнозовані години до завершення', `${inp.estimatedRemainingHours} год`],
    ['', 'Орієнтовна загальна кількість годин', `${m.estimatedTotalHours} год`],
    ['', 'Коефіцієнт артдирекшну', `${inp.artDirectionPercent}%`],
    ['', 'Коефіцієнт менеджменту / PM', `${inp.managementPercent}%`],
    ['', 'Вартість розробки', `${sym}${inp.developmentCost}`],
    ['', 'Інші прямі витрати', `${sym}${inp.otherDirectCosts}`],
    ['', 'Комісія за продаж', `${inp.salesCommissionPercent}%`],
    ['', 'Податок', `${inp.taxPercent}%`],
    ['', 'Резерв / буфер', `${inp.bufferPercent}%`],
    [],
    ['Основні фінансові показники', 'Поточна загальна собівартість', `${sym}${round2(m.currentTotalCost)}`],
    ['', 'Прогнозована загальна собівартість', `${sym}${round2(m.projectedTotalCost)}`],
    ['', 'Поточний прибуток', `${sym}${round2(m.currentProfit)}`],
    ['', 'Прогнозований прибуток', `${sym}${round2(m.projectedProfit)}`],
    ['', 'Поточна маржа', `${round2(m.currentMarginPercent)}%`],
    ['', 'Прогнозована маржа', `${round2(m.projectedMarginPercent)}%`],
    ['', 'Ефективна погодинна ставка', `${sym}${round2(m.effectiveHourlyRate)}`],
    ['', 'Цільовий прибуток', `${sym}${round2(m.targetProfit)}`],
    ['', 'Необхідний бюджет для цільової маржі', `${sym}${round2(m.requiredBudgetForTargetMargin)}`],
    ['', 'Розрив бюджету', `${sym}${round2(m.budgetGap)}`],
    [],
    ['Контроль годин', 'Безпечний ліміт годин', `${round2(m.maxSafeHoursForTargetMargin)} год`],
    ['', 'Безпечний залишок годин', `${round2(m.remainingSafeHours)} год`],
    ['', 'Точка беззбитковості', `${round2(m.breakEvenHours)} год`],
    ['', 'Годин до точки беззбитковості', `${round2(m.hoursUntilBreakEven)} год`],
    [],
    ['Висновок', 'Статус проєкту', m.projectStatusLabel],
    ['', 'Рекомендація', getStatusRecommendation(m.status)],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  autoWidth(ws, rows);
  return ws;
}

function buildExplanationsSheet(): XLSX.WorkSheet {
  const rows: string[][] = [
    ['Поле', 'Пояснення'],
    ['Початковий фіксований бюджет', 'Сума, за яку проєкт був погоджений із клієнтом на старті.'],
    ['Додатково погоджений бюджет', 'Додаткова сума, яку клієнт погодив після зміни обсягу робіт або додаткових задач.'],
    ['Загальний бюджет проєкту', 'Початковий фіксований бюджет + Додатково погоджений бюджет.'],
    ['Погодинна ставка', 'Вартість однієї години роботи або внутрішня ставка для оцінки витрат часу.'],
    ['Фактично витрачені години', 'Кількість годин, які вже були реально витрачені на проєкт.'],
    ['Прогнозовані години до завершення', 'Скільки годин ще потрібно витратити до завершення проєкту.'],
    ['Коефіцієнт артдирекшну', 'Додатковий відсоток до вартості дизайн-робіт за артдирекшн, рев\'ю, контроль якості.'],
    ['Коефіцієнт менеджменту / PM', 'Додатковий відсоток за комунікацію, планування, менеджмент, мітинги та супровід.'],
    ['Вартість розробки', 'Сума за розробку або технічну реалізацію проєкту.'],
    ['Інші прямі витрати', 'Інші витрати: сервіси, підрядники, ліцензії, додаткові спеціалісти.'],
    ['Комісія за продаж', 'Відсоток від загального бюджету на sales, залучення клієнта або комісію за продаж.'],
    ['Податок', 'Відсоток податків або обов\'язкових платежів від бюджету проєкту.'],
    ['Резерв / буфер', 'Відсоток бюджету на непередбачені витрати, додаткові ітерації або ризики.'],
    ['Поточний прибуток', 'Прибуток на поточний момент з урахуванням уже витрачених годин.'],
    ['Прогнозований прибуток', 'Очікуваний прибуток після завершення проєкту з урахуванням всіх витрат.'],
    ['Поточна маржа', 'Поточний прибуток / Загальний бюджет × 100%.'],
    ['Прогнозована маржа', 'Прогнозований прибуток / Загальний бюджет × 100%.'],
    ['Ефективна погодинна ставка', 'Ставка з урахуванням коефіцієнтів артдирекшну та менеджменту.'],
    ['Безпечний залишок годин', 'Скільки годин ще можна витратити, щоб зберегти цільову маржу.'],
    ['Точка беззбитковості', 'Після цієї кількості годин проєкт перестає бути прибутковим.'],
    ['Необхідний бюджет для цільової маржі', 'Сума, за яку проєкт мав би бути проданий, щоб зберегти цільову маржу.'],
    ['Розрив бюджету', 'Різниця між необхідним і фактичним бюджетом.'],
    ['Статус проєкту', 'Оцінка стану: Здоровий проєкт / Нижче цільової маржі / Критичний ризик / Проєкт у мінусі.'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  autoWidth(ws, rows);
  return ws;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function exportProjectHistoryToExcel(records: ProjectHistoryRecord[]): void {
  const wb = XLSX.utils.book_new();

  const historySheet = buildHistorySheet(records);
  XLSX.utils.book_append_sheet(wb, historySheet, 'Історія');

  if (records.length > 0) {
    const latestRecord = records[records.length - 1];
    const latestSheet = buildLatestRecordSheet(latestRecord);
    XLSX.utils.book_append_sheet(wb, latestSheet, 'Останній розрахунок');
  }

  const explanationsSheet = buildExplanationsSheet();
  XLSX.utils.book_append_sheet(wb, explanationsSheet, 'Пояснення полів');

  const projectName = records.length > 0 ? records[0].inputs.projectName : '';
  const sanitized = projectName ? sanitizeFileName(projectName) : '';
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = sanitized
    ? `finansova-istoriia-proiektu-${sanitized}-${dateStr}.xlsx`
    : `finansova-istoriia-proiektu-${dateStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
