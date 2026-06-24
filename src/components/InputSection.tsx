import type { ProjectInputs, Currency } from '../types';
import { CURRENCY_SYMBOLS } from '../types';

interface InputSectionProps {
  inputs: ProjectInputs;
  totalBudget: number;
  estimatedTotalHours: number;
  onUpdate: <K extends keyof ProjectInputs>(field: K, value: ProjectInputs[K]) => void;
  onReset: () => void;
}

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'UAH', label: 'UAH (₴)' },
  { value: 'GBP', label: 'GBP (£)' },
];

function InputField({
  label,
  helper,
  value,
  onChange,
  type = 'number',
  suffix,
  min,
  max,
  step,
  prefix,
}: {
  label: string;
  helper: string;
  value: string | number;
  onChange: (val: string) => void;
  type?: 'text' | 'number' | 'currency';
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
}) {
  return (
    <div className="input-field">
      <label className="input-field__label">{label}</label>
      <div className="input-field__wrapper">
        {prefix && <span className="input-field__prefix">{prefix}</span>}
        <input
          className={`input-field__input ${prefix ? 'input-field__input--with-prefix' : ''} ${suffix ? 'input-field__input--with-suffix' : ''}`}
          type={type === 'currency' ? 'number' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
        />
        {suffix && <span className="input-field__suffix">{suffix}</span>}
      </div>
      <p className="input-field__helper">{helper}</p>
    </div>
  );
}

function CalculatedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="input-field input-field--calculated">
      <label className="input-field__label">{label}</label>
      <div className="input-field__calculated-value">{value}</div>
    </div>
  );
}

export function InputSection({ inputs, totalBudget, estimatedTotalHours, onUpdate, onReset }: InputSectionProps) {
  const currencySymbol = CURRENCY_SYMBOLS[inputs.currency];

  const handleNumberChange = (field: keyof ProjectInputs, val: string) => {
    const num = val === '' ? 0 : parseFloat(val);
    if (!isNaN(num)) {
      onUpdate(field, num as ProjectInputs[typeof field]);
    }
  };

  const formatCurrency = (amount: number) =>
    `${currencySymbol}${amount.toLocaleString('uk-UA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  return (
    <div className="input-section">
      <div className="input-section__header">
        <h2 className="input-section__main-title">Параметри проєкту</h2>
        <button className="btn-secondary" onClick={onReset}>
          Скинути
        </button>
      </div>

      {/* 1. Інформація про проєкт */}
      <section className="input-group">
        <h3 className="input-group__title">Інформація про проєкт</h3>

        <InputField
          label="Назва проєкту"
          helper="Введіть назву проєкту, щоб легше відрізняти його від інших розрахунків."
          value={inputs.projectName}
          onChange={(val) => onUpdate('projectName', val)}
          type="text"
        />

        <div className="input-field">
          <label className="input-field__label">Валюта</label>
          <select
            className="input-field__input"
            value={inputs.currency}
            onChange={(e) => onUpdate('currency', e.target.value as Currency)}
          >
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <p className="input-field__helper">
            Оберіть валюту, у якій буде рахуватися бюджет, витрати та прибуток.
          </p>
        </div>

        <InputField
          label="Початковий фіксований бюджет"
          helper="Сума, за яку проєкт був погоджений із клієнтом на старті."
          value={inputs.originalFixedBudget}
          onChange={(val) => handleNumberChange('originalFixedBudget', val)}
          type="currency"
          prefix={currencySymbol}
          min={0}
          step={100}
        />

        <InputField
          label="Додатково погоджений бюджет"
          helper="Додаткова сума, яку клієнт погодив після зміни обсягу робіт або додаткових задач."
          value={inputs.additionalApprovedBudget}
          onChange={(val) => handleNumberChange('additionalApprovedBudget', val)}
          type="currency"
          prefix={currencySymbol}
          min={0}
          step={100}
        />

        <CalculatedField
          label="Загальний бюджет проєкту"
          value={formatCurrency(totalBudget)}
        />
      </section>

      {/* 2. Час на дизайн */}
      <section className="input-group">
        <h3 className="input-group__title">Час на дизайн / UX / UI</h3>

        <InputField
          label="Погодинна ставка"
          helper="Вартість однієї години вашої роботи або внутрішня ставка, за якою ви оцінюєте витрати часу."
          value={inputs.hourlyRate}
          onChange={(val) => handleNumberChange('hourlyRate', val)}
          type="currency"
          prefix={currencySymbol}
          min={0}
          step={5}
        />

        <InputField
          label="Фактично витрачені години"
          helper="Кількість годин, які вже були реально витрачені на проєкт."
          value={inputs.actualHoursSpent}
          onChange={(val) => handleNumberChange('actualHoursSpent', val)}
          suffix="год"
          min={0}
          step={1}
        />

        <InputField
          label="Прогнозовані години до завершення"
          helper="Скільки годин, за вашою оцінкою, ще потрібно витратити до завершення проєкту."
          value={inputs.estimatedRemainingHours}
          onChange={(val) => handleNumberChange('estimatedRemainingHours', val)}
          suffix="год"
          min={0}
          step={1}
        />

        <CalculatedField
          label="Орієнтовна загальна кількість годин"
          value={`${estimatedTotalHours} год`}
        />
      </section>

      {/* 3. Внутрішні коефіцієнти */}
      <section className="input-group">
        <h3 className="input-group__title">Внутрішні коефіцієнти</h3>

        <InputField
          label="Коефіцієнт артдирекшну"
          helper="Додатковий відсоток до вартості дизайн-робіт, який враховує артдирекшн, рев'ю, контроль якості та стратегічні рішення."
          value={inputs.artDirectionPercent}
          onChange={(val) => handleNumberChange('artDirectionPercent', val)}
          suffix="%"
          min={0}
          step={1}
        />

        <InputField
          label="Коефіцієнт менеджменту / PM"
          helper="Додатковий відсоток до вартості дизайн-робіт, який враховує комунікацію, планування, менеджмент, мітинги та супровід проєкту."
          value={inputs.managementPercent}
          onChange={(val) => handleNumberChange('managementPercent', val)}
          suffix="%"
          min={0}
          step={1}
        />
      </section>

      {/* 4. Зовнішні та прямі витрати */}
      <section className="input-group">
        <h3 className="input-group__title">Зовнішні та прямі витрати</h3>

        <InputField
          label="Вартість розробки"
          helper="Сума, яку потрібно заплатити за розробку або технічну реалізацію проєкту."
          value={inputs.developmentCost}
          onChange={(val) => handleNumberChange('developmentCost', val)}
          type="currency"
          prefix={currencySymbol}
          min={0}
          step={100}
        />

        <InputField
          label="Інші прямі витрати"
          helper="Інші витрати, напряму пов'язані з проєктом: сервіси, підрядники, ліцензії, додаткові спеціалісти тощо."
          value={inputs.otherDirectCosts}
          onChange={(val) => handleNumberChange('otherDirectCosts', val)}
          type="currency"
          prefix={currencySymbol}
          min={0}
          step={100}
        />
      </section>

      {/* 5. Комерційні витрати */}
      <section className="input-group">
        <h3 className="input-group__title">Комерційні витрати</h3>

        <InputField
          label="Комісія за продаж"
          helper="Відсоток від загального бюджету проєкту, який іде на sales, залучення клієнта або комісію за продаж."
          value={inputs.salesCommissionPercent}
          onChange={(val) => handleNumberChange('salesCommissionPercent', val)}
          suffix="%"
          min={0}
          step={1}
        />
      </section>

      {/* 6. Податки */}
      <section className="input-group">
        <h3 className="input-group__title">Податки</h3>

        <InputField
          label="Податок"
          helper="Відсоток податків або обов'язкових платежів, який буде віднято із бюджету проєкту."
          value={inputs.taxPercent}
          onChange={(val) => handleNumberChange('taxPercent', val)}
          suffix="%"
          min={0}
          step={1}
        />

        <p className="input-group__note">
          У цій версії податок рахується від загального бюджету проєкту.
        </p>
      </section>

      {/* 7. Резерв ризику */}
      <section className="input-group">
        <h3 className="input-group__title">Резерв ризику</h3>

        <InputField
          label="Резерв / буфер"
          helper="Відсоток бюджету, який резервується на непередбачені витрати, додаткові ітерації або ризики."
          value={inputs.bufferPercent}
          onChange={(val) => handleNumberChange('bufferPercent', val)}
          suffix="%"
          min={0}
          step={1}
        />
      </section>

      {/* 8. Налаштування маржинальності */}
      <section className="input-group">
        <h3 className="input-group__title">Налаштування маржинальності</h3>

        <InputField
          label="Цільова маржа прибутку"
          helper="Бажаний рівень прибутковості проєкту. Калькулятор покаже, чи вдається зберегти цю маржу."
          value={inputs.targetMarginPercent}
          onChange={(val) => handleNumberChange('targetMarginPercent', val)}
          suffix="%"
          min={0}
          max={100}
          step={1}
        />

        <InputField
          label="Мінімально допустима маржа"
          helper="Нижня межа прибутковості. Якщо прогнозована маржа падає нижче цього рівня, проєкт переходить у критичний стан."
          value={inputs.minimumMarginPercent}
          onChange={(val) => handleNumberChange('minimumMarginPercent', val)}
          suffix="%"
          min={0}
          max={100}
          step={1}
        />
      </section>
    </div>
  );
}
