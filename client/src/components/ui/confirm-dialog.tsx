'use client';
import { Button } from './button';
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-950/40 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
      >
        <h2
          id="confirm-title"
          className="text-lg font-extrabold text-stone-950"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
