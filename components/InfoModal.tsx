"use client";

export function InfoModal({
  title,
  children,
  open,
  onClose
}: {
  title: string;
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="modalBackdrop" role="presentation" onClick={onClose}>
      <div className="modalCard" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h3>{title}</h3>
          <button className="iconButton" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}
