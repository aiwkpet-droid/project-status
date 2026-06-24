import type { ProjectHistoryRecord } from '../types';
import { SaveSnapshotForm } from './SaveSnapshotForm';
import { HistoryTable } from './HistoryTable';

interface ProjectHistoryProps {
  history: ProjectHistoryRecord[];
  notification: string | null;
  onSave: (note?: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onExport: () => void;
}

export function ProjectHistory({
  history,
  notification,
  onSave,
  onDelete,
  onClearAll,
  onExport,
}: ProjectHistoryProps) {
  const handleSave = (note?: string) => {
    onSave(note);
  };

  return (
    <section className="project-history">
      <div className="project-history__header">
        <div>
          <h2 className="project-history__title">Фінансова історія проєкту</h2>
          <p className="project-history__helper">
            Зберігайте проміжні розрахунки, щоб бачити, як змінюється прибутковість проєкту протягом роботи.
          </p>
        </div>
      </div>

      <SaveSnapshotForm onSave={handleSave} />

      <div className="project-history__actions">
        <button className="btn-primary" onClick={onExport}>
          Експортувати в Excel
        </button>
        {history.length > 0 && (
          <button className="btn-delete" onClick={onClearAll}>
            Очистити історію
          </button>
        )}
      </div>

      <div className="project-history__table-section">
        <h3 className="project-history__subtitle">Історія розрахунків</h3>
        <HistoryTable records={history} onDelete={onDelete} />
      </div>

      {notification && (
        <div className="toast-notification">
          {notification}
        </div>
      )}
    </section>
  );
}
