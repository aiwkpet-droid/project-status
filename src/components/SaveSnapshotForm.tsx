import { useState } from 'react';

interface SaveSnapshotFormProps {
  onSave: (note?: string) => void;
}

export function SaveSnapshotForm({ onSave }: SaveSnapshotFormProps) {
  const [note, setNote] = useState('');

  const handleSave = () => {
    onSave(note.trim() || undefined);
    setNote('');
  };

  return (
    <div className="save-snapshot-form">
      <div className="save-snapshot-form__field">
        <label className="input-field__label">Коментар до розрахунку</label>
        <input
          className="input-field__input"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Додайте короткий коментар…"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }}
        />
        <p className="input-field__helper">
          Наприклад: стартова оцінка, після першого етапу, після додаткових правок, фінальний розрахунок.
        </p>
      </div>
      <button className="btn-primary" onClick={handleSave}>
        Зберегти розрахунок
      </button>
      <p className="save-snapshot-form__hint">
        Кожне збереження створює новий запис в історії, щоб ви могли порівнювати фінансовий стан проєкту в різні моменти.
      </p>
    </div>
  );
}
